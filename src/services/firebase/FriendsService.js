import { db } from './config';
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, arrayRemove, getDoc, setDoc } from 'firebase/firestore';
import { sendNotification } from './NotificationsService';

class FriendsService {
  constructor() {
    this.db = db;
  }

  async sendFriendRequest(senderUid, recipientUid) {
    try {
      const senderDoc = await getDoc(doc(this.db, 'users', senderUid));
      const recipientDoc = await getDoc(doc(this.db, 'users', recipientUid));

      if (!senderDoc.exists() || !recipientDoc.exists()) {
        throw new Error('User not found');
      }

      const senderData = senderDoc.data();
      const recipientData = recipientDoc.data();

      // Add to recipient's pending requests
      await updateDoc(doc(this.db, 'users', recipientUid), {
        pendingFriendRequests: arrayUnion(senderUid)
      });

      // Send notification
      await sendNotification(recipientUid, {
        type: 'FRIEND_REQUEST',
        title: 'New Friend Request',
        body: `${senderData.displayName || 'A user'} sent you a friend request`,
        data: {
          senderUid,
          senderName: senderData.displayName || 'A user',
          senderProfilePic: senderData.photoURL || ''
        }
      });

      return true;
    } catch (error) {
      console.error('Error sending friend request:', error);
      throw error;
    }
  }

  async acceptFriendRequest(accepterUid, requesterUid) {
    try {
      const accepterDoc = await getDoc(doc(this.db, 'users', accepterUid));
      const requesterDoc = await getDoc(doc(this.db, 'users', requesterUid));

      if (!accepterDoc.exists() || !requesterDoc.exists()) {
        throw new Error('User not found');
      }

      const accepterData = accepterDoc.data();
      const requesterData = requesterDoc.data();

      // Remove from pending requests
      await updateDoc(doc(this.db, 'users', accepterUid), {
        pendingFriendRequests: arrayRemove(requesterUid),
        friends: arrayUnion(requesterUid)
      });

      // Add to requester's friends list
      await updateDoc(doc(this.db, 'users', requesterUid), {
        friends: arrayUnion(accepterUid)
      });

      // Send notification to requester
      await sendNotification(requesterUid, {
        type: 'FRIEND_REQUEST_ACCEPTED',
        title: 'Friend Request Accepted',
        body: `${accepterData.displayName || 'A user'} accepted your friend request`,
        data: {
          accepterUid,
          accepterName: accepterData.displayName || 'A user',
          accepterProfilePic: accepterData.photoURL || ''
        }
      });

      return true;
    } catch (error) {
      console.error('Error accepting friend request:', error);
      throw error;
    }
  }

  async rejectFriendRequest(rejectorUid, requesterUid) {
    try {
      // Remove from pending requests
      await updateDoc(doc(this.db, 'users', rejectorUid), {
        pendingFriendRequests: arrayRemove(requesterUid)
      });

      return true;
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      throw error;
    }
  }

  async removeFriend(userId, friendId) {
    try {
      // Remove from both users' friends lists
      await updateDoc(doc(this.db, 'users', userId), {
        friends: arrayRemove(friendId)
      });

      await updateDoc(doc(this.db, 'users', friendId), {
        friends: arrayRemove(userId)
      });

      return true;
    } catch (error) {
      console.error('Error removing friend:', error);
      throw error;
    }
  }

  async getFriendsList(userId) {
    try {
      const userDoc = await getDoc(doc(this.db, 'users', userId));
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      const friendIds = userData.friends || [];

      const friendsData = await Promise.all(
        friendIds.map(async (friendId) => {
          const friendDoc = await getDoc(doc(this.db, 'users', friendId));
          if (friendDoc.exists()) {
            const data = friendDoc.data();
            return {
              uid: friendId,
              displayName: data.displayName,
              photoURL: data.photoURL,
              email: data.email
            };
          }
          return null;
        })
      );

      return friendsData.filter(friend => friend !== null);
    } catch (error) {
      console.error('Error getting friends list:', error);
      throw error;
    }
  }

  async getPendingRequests(userId) {
    try {
      const userDoc = await getDoc(doc(this.db, 'users', userId));
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      const pendingIds = userData.pendingFriendRequests || [];

      const pendingData = await Promise.all(
        pendingIds.map(async (requesterId) => {
          const requesterDoc = await getDoc(doc(this.db, 'users', requesterId));
          if (requesterDoc.exists()) {
            const data = requesterDoc.data();
            return {
              uid: requesterId,
              displayName: data.displayName,
              photoURL: data.photoURL,
              email: data.email
            };
          }
          return null;
        })
      );

      return pendingData.filter(request => request !== null);
    } catch (error) {
      console.error('Error getting pending requests:', error);
      throw error;
    }
  }
}

export default new FriendsService();
