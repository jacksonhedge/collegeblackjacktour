import { 
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
  DocumentReference,
  CollectionReference,
  Query,
  DocumentData,
  QuerySnapshot,
  DocumentSnapshot,
  WithFieldValue,
  PartialWithFieldValue,
  FirestoreDataConverter,
  FieldValue
} from 'firebase/firestore';
import { db } from './config';

// Type to ensure data matches Firestore requirements
export type FirestoreData<T> = {
  [P in keyof T]: T[P] extends FieldValue ? T[P] :
    T[P] extends Date ? Date | FieldValue :
    T[P] extends Array<infer U> ? Array<FirestoreData<U>> | FieldValue :
    T[P] extends object ? FirestoreData<T[P]> | FieldValue :
    T[P] | FieldValue;
};

// Error class for Firestore operations
export class FirestoreError extends Error {
  constructor(
    message: string,
    public code?: string,
    public operation?: string,
    public path?: string
  ) {
    super(message);
    this.name = 'FirestoreError';
  }
}

// Helper function to handle Firestore errors
function handleFirestoreError(error: unknown, operation: string, path: string): never {
  console.error(`Firestore ${operation} error:`, error);
  
  if (error instanceof Error) {
    throw new FirestoreError(
      error.message,
      (error as any).code,
      operation,
      path
    );
  }
  
  throw new FirestoreError(
    'An unknown error occurred',
    'unknown',
    operation,
    path
  );
}

// Create a data converter for type safety
function createConverter<T extends object>(): FirestoreDataConverter<T> {
  return {
    toFirestore(modelObject: WithFieldValue<T>): DocumentData {
      return modelObject as DocumentData;
    },
    fromFirestore(snapshot: DocumentSnapshot<DocumentData>): T {
      return snapshot.data() as T;
    }
  };
}

// Get a document reference with proper typing
export function getDocRef<T extends object>(
  path: string,
  ...pathSegments: string[]
): DocumentReference<T> {
  return doc(db, path, ...pathSegments).withConverter(createConverter<T>());
}

// Get a collection reference with proper typing
export function getCollectionRef<T extends object>(
  path: string,
  ...pathSegments: string[]
): CollectionReference<T> {
  return collection(db, path, ...pathSegments).withConverter(createConverter<T>());
}

// Get a document by reference
export async function getDocument<T extends object>(
  docRef: DocumentReference<T>
): Promise<T | null> {
  try {
    const snapshot = await getDoc(docRef);
    return snapshot.exists() ? snapshot.data() : null;
  } catch (error) {
    handleFirestoreError(error, 'get', docRef.path);
  }
}

// Get a document by path
export async function getDocumentByPath<T extends object>(
  path: string,
  ...pathSegments: string[]
): Promise<T | null> {
  const docRef = getDocRef<T>(path, ...pathSegments);
  return getDocument(docRef);
}

// Set a document with merge
export async function setDocument<T extends object>(
  docRef: DocumentReference<T>,
  data: WithFieldValue<T>,
  merge = true
): Promise<void> {
  try {
    await setDoc(docRef, data, { merge });
  } catch (error) {
    handleFirestoreError(error, 'set', docRef.path);
  }
}

// Update a document
export async function updateDocument<T extends object>(
  docRef: DocumentReference<T>,
  data: PartialWithFieldValue<T>
): Promise<void> {
  try {
    await updateDoc(docRef, data as any);
  } catch (error) {
    handleFirestoreError(error, 'update', docRef.path);
  }
}

// Delete a document
export async function deleteDocument(
  docRef: DocumentReference<unknown>
): Promise<void> {
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, 'delete', docRef.path);
  }
}

// Get documents from a query
export async function getQueryDocuments<T extends object>(
  query: Query<T>
): Promise<T[]> {
  try {
    const snapshot = await getDocs(query);
    return snapshot.docs.map(doc => doc.data());
  } catch (error) {
    handleFirestoreError(error, 'query', query.toString());
  }
}

// Create a query with type safety
export function createQuery<T extends object>(
  collectionRef: CollectionReference<T>,
  ...queryConstraints: Parameters<typeof query>[1][]
): Query<T> {
  return query(collectionRef, ...queryConstraints);
}

// Helper to check if a document exists
export async function documentExists(
  docRef: DocumentReference<unknown>
): Promise<boolean> {
  try {
    const snapshot = await getDoc(docRef);
    return snapshot.exists();
  } catch (error) {
    handleFirestoreError(error, 'exists check', docRef.path);
  }
}

// Helper to get multiple documents by reference
export async function getDocumentsByRefs<T extends object>(
  refs: DocumentReference<T>[]
): Promise<(T | null)[]> {
  try {
    const snapshots = await Promise.all(refs.map(ref => getDoc(ref)));
    return snapshots.map(snapshot => snapshot.exists() ? snapshot.data() : null);
  } catch (error) {
    handleFirestoreError(error, 'batch get', refs.map(ref => ref.path).join(', '));
  }
}

// Helper to batch write operations
export async function batchWrite<T extends object>(
  operations: {
    type: 'set' | 'update' | 'delete';
    ref: DocumentReference<T>;
    data?: WithFieldValue<T>;
  }[]
): Promise<void> {
  const batch = writeBatch(db);

  operations.forEach(({ type, ref, data }) => {
    switch (type) {
      case 'set':
        batch.set(ref, data!, { merge: true });
        break;
      case 'update':
        batch.update(ref, data! as any);
        break;
      case 'delete':
        batch.delete(ref);
        break;
    }
  });

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(
      error,
      'batch write',
      operations.map(op => op.ref.path).join(', ')
    );
  }
}

// Types for query constraints
export type QueryConstraint = Parameters<typeof query>[1];
export type WhereConstraint = Parameters<typeof where>;
export type OrderByConstraint = Parameters<typeof orderBy>;
export type LimitConstraint = Parameters<typeof limit>;

// Export Firestore types for convenience
export type {
  DocumentReference,
  CollectionReference,
  Query,
  DocumentData,
  QuerySnapshot,
  DocumentSnapshot,
  WithFieldValue,
  PartialWithFieldValue
};
