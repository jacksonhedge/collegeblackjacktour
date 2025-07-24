import { deleteDoc, doc } from 'firebase/firestore';
import { db } from './config';
import { getFunctions, httpsCallable } from 'firebase/functions';

export const deleteUserAccount = async (userId) => {
  try {
    // Delete user document from Firestore
    await deleteDoc(doc(db, 'users', userId));

    // Delete user from Authentication using Cloud Functions
    const functions = getFunctions();
    const deleteAuthUser = httpsCallable(functions, 'deleteAuthUser');
    await deleteAuthUser({ userId });

    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};
