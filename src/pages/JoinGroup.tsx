import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { useGroup } from '../contexts/GroupContext';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Users, Trophy, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { where } from 'firebase/firestore';
import type { Group } from '../types/group';
import {
  getCollectionRef,
  createQuery,
  getQueryDocuments,
  getDocRef,
  getDocument
} from '../services/firebase/firestore';

const JoinGroup: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { joinGroup } = useGroup();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [publicGroups, setPublicGroups] = useState<Group[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublicGroups = async () => {
      try {
        const groupsRef = getCollectionRef<Group>('groups');
        const groupsQuery = createQuery(groupsRef, where('visibility', '==', 'public'));
        const groupsData = await getQueryDocuments(groupsQuery);
        
        // Enrich the groups with member counts and other details
        const enrichedGroups = await Promise.all(groupsData.map(async (group) => {
          const groupRef = getDocRef<Group>('groups', group.id);
          const fullGroupData = await getDocument(groupRef);
          return fullGroupData || group;
        }));
        
        setPublicGroups(enrichedGroups);
      } catch (err) {
        console.error('Error fetching public groups:', err);
        setError('Failed to load public groups');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublicGroups();
  }, []);

  const handleJoinGroup = async (groupId: string) => {
    if (!currentUser) {
      toast.error('Please sign in to join a group');
      navigate('/login');
      return;
    }

    setIsLoading(true);
    try {
      await joinGroup(groupId);
      toast.success('Successfully joined group!');
      navigate('/groups');
    } catch (err: any) {
      console.error('Error joining group:', err);
      const errorMessage = err.message || 'Failed to join group. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center space-x-3 mb-8">
        <Users className="w-8 h-8 text-blue-500" />
        <h1 className="text-3xl font-bold text-white">Join a Group</h1>
      </div>

      {/* Public Groups Section */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Public Groups
        </h2>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <p className="text-red-500 text-center">{error}</p>
          </div>
        ) : publicGroups.length === 0 ? (
          <div className="bg-gray-800/50 rounded-lg p-6">
            <p className="text-gray-400 text-center">No public groups available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicGroups.map(group => (
              <Card 
                key={group.id}
                className="bg-gray-800/50 border-purple-500/20 hover:border-purple-500/40 transition-all duration-200"
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{group.emoji}</span>
                    <h3 className="text-xl font-semibold text-white">{group.name}</h3>
                  </div>
                  <p className="text-gray-400 text-sm">
                    {group.description}
                  </p>
                  <div className="flex justify-between items-center text-sm text-gray-400">
                    <span>Members: {group.memberIds.length}</span>
                    {group.wallet?.cashBalance > 0 && (
                      <span>Prize Pool: ${group.wallet.cashBalance}</span>
                    )}
                  </div>
                  <Button
                    onClick={() => handleJoinGroup(group.id)}
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isLoading ? 'Joining...' : 'Join Group'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Private Groups Section */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Lock className="w-5 h-5 mr-2" />
          Private Groups
        </h2>
        <div className="bg-gray-800/50 rounded-lg p-6">
          <p className="text-gray-400 text-center">
            Private groups require an invitation from the group owner.
            Contact the group owner to get an invite code.
          </p>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <Button
          onClick={() => navigate('/groups')}
          className="bg-gray-700 hover:bg-gray-600 text-white"
        >
          Back to Groups
        </Button>
      </div>
    </div>
  );
};

export default JoinGroup;
