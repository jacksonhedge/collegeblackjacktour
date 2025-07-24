import { collection, addDoc, getDocs, query, where, Timestamp, CollectionReference, DocumentData } from 'firebase/firestore';
import { db } from './config';

export interface GiftCard {
    type: 'Visa Debit' | 'Mastercard Debit' | 'Tapppp Debit';
    gamingBrand: string;
    cardNumber: string;
    expirationDate: string;
    cvv: string;
    startingAmount: number;
    dateAdded: Timestamp;
}

class GiftCardService {
    private static instance: GiftCardService;

    constructor() {
        if (GiftCardService.instance) {
            return GiftCardService.instance;
        }
        GiftCardService.instance = this;
    }

    private getGiftCardsCollection(userId: string) {
        if (!db) throw new Error('Firestore is not initialized');
        return collection(db, 'users', userId, 'giftCards');
    }

    async addGiftCard(userId: string, giftCard: GiftCard): Promise<string> {
        try {
            const giftCardsRef = this.getGiftCardsCollection(userId);
            const docRef = await addDoc(giftCardsRef, giftCard);
            return docRef.id;
        } catch (error) {
            console.error('Error adding gift card:', error);
            throw error;
        }
    }

    async getUserGiftCards(userId: string): Promise<GiftCard[]> {
        try {
            const giftCardsRef = this.getGiftCardsCollection(userId);
            const querySnapshot = await getDocs(giftCardsRef);
            return querySnapshot.docs.map(doc => doc.data() as GiftCard);
        } catch (error) {
            console.error('Error getting user gift cards:', error);
            throw error;
        }
    }
}

export const giftCardService = new GiftCardService();
