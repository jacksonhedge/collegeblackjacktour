import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { UserPlus, Check, X, UserMinus } from 'lucide-react';
import friendsService from '../services/firebase/FriendsService';
import { useAuth } from '../contexts/SupabaseAuthContext';
import UserAvatar from '../components/ui/UserAvatar';
import AddFriendsModal from '../components/friends/AddFriendsModal';

const FriendsView = () => {
  const { currentUser } = useAuth();
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddFriendsModalOpen, setIsAddFriendsModalOpen] = useState(false);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        setLoading(true);
        const friendsList = await friendsService.getFriendsList(currentUser.uid);
        const pendingList = await friendsService.getPendingRequests(currentUser.uid);
        setFriends(friendsList);
        setPendingRequests(pendingList);
      } catch (error) {
        console.error('Error fetching friends:', error);
        setError('Failed to load friends');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchFriends();
    }
  }, [currentUser]);

  const handleAcceptRequest = async (requesterUid) => {
    try {
      await friendsService.acceptFriendRequest(currentUser.uid, requesterUid);
      // Refresh the lists
      const updatedFriends = await friendsService.getFriendsList(currentUser.uid);
      const updatedPending = await friendsService.getPendingRequests(currentUser.uid);
      setFriends(updatedFriends);
      setPendingRequests(updatedPending);
    } catch (error) {
      console.error('Error accepting friend request:', error);
      setError('Failed to accept friend request');
    }
  };

  const handleRejectRequest = async (requesterUid) => {
    try {
      await friendsService.rejectFriendRequest(currentUser.uid, requesterUid);
      // Refresh the pending list
      const updatedPending = await friendsService.getPendingRequests(currentUser.uid);
      setPendingRequests(updatedPending);
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      setError('Failed to reject friend request');
    }
  };

  const handleRemoveFriend = async (friendId) => {
    try {
      await friendsService.removeFriend(currentUser.uid, friendId);
      // Refresh the friends list
      const updatedFriends = await friendsService.getFriendsList(currentUser.uid);
      setFriends(updatedFriends);
    } catch (error) {
      console.error('Error removing friend:', error);
      setError('Failed to remove friend');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Friends</h1>
        <button
          onClick={() => setIsAddFriendsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <UserPlus className="w-5 h-5 mr-2" />
          Add Friends
        </button>
      </div>

      {error && (
        <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Pending Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingRequests.length === 0 ? (
              <p className="text-gray-400">No pending friend requests</p>
            ) : (
              <ul className="space-y-4">
                {pendingRequests.map((request) => (
                  <li key={request.uid} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <UserAvatar user={request} className="w-10 h-10" />
                      <span className="ml-3 text-white">{request.displayName || request.email}</span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAcceptRequest(request.uid)}
                        className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request.uid)}
                        className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Friends List */}
        <Card>
          <CardHeader>
            <CardTitle>My Friends</CardTitle>
          </CardHeader>
          <CardContent>
            {friends.length === 0 ? (
              <p className="text-gray-400">No friends added yet</p>
            ) : (
              <ul className="space-y-4">
                {friends.map((friend) => (
                  <li key={friend.uid} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <UserAvatar user={friend} className="w-10 h-10" />
                      <span className="ml-3 text-white">{friend.displayName || friend.email}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveFriend(friend.uid)}
                      className="p-2 bg-gray-600 text-white rounded-full hover:bg-gray-700"
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <AddFriendsModal
        isOpen={isAddFriendsModalOpen}
        onClose={() => setIsAddFriendsModalOpen(false)}
      />
    </div>
  );
};

export default FriendsView;
