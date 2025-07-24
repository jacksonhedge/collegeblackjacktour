// Previous imports remain the same...
import React, { useState, useEffect } from 'react';
import { X, Settings, UserPlus, Trash2, Link, Trophy, Users, XIcon } from 'lucide-react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useGroup } from '../../contexts/GroupContext';
import { Card, CardHeader, CardTitle, CardContent } from '../ui';
import InviteUsersModal from './InviteUsersModal';
import UserAvatar from '../ui/UserAvatar';
import PlatformImageService from '../../services/firebase/PlatformImageService';
import { toast } from 'react-hot-toast';
import type { Group, User } from '../../types/group';

// Previous interfaces remain the same...
interface GroupViewModalProps {
  groupId: string;
  onClose: () => void;
}

interface LeagueDetails {
  buyInAmount: number;
  totalTeams: number;
  totalExpense: number;
  platform: string;
  leagueId: string;
  leagueName: string;
  seasonYear: number;
}

const GroupViewModal: React.FC<GroupViewModalProps> = ({ groupId, onClose }) => {
  // Previous state declarations remain the same...
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [leagueDetails, setLeagueDetails] = useState<LeagueDetails | null>(null);
  const [inviteLink, setInviteLink] = useState('');
  const [showCopied, setShowCopied] = useState(false);
  const [platformLogo, setPlatformLogo] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { currentUser } = useAuth();
  const { getGroup, deleteGroup, refreshGroups } = useGroup();

  const isOwner = group?.ownerId === currentUser?.uid;

  useEffect(() => {
    // Generate invite link when component mounts
    const baseUrl = window.location.origin;
    setInviteLink(`${baseUrl}/invite/group/${groupId}`);
  }, [groupId]);

  useEffect(() => {
    const loadPlatformLogo = async (platform: string) => {
      try {
        let logoName = '';
        switch (platform) {
          case 'sleeper':
            logoName = 'sleeper.png';
            break;
          case 'espn':
            logoName = 'espnFantasy.png';
            break;
          case 'yahoo':
            logoName = 'yahoofantasy.png';
            break;
          default:
            return;
        }
        const logoUrl = await PlatformImageService.getImageUrl(logoName);
        setPlatformLogo(logoUrl);
      } catch (error) {
        console.error('Error loading platform logo:', error);
      }
    };

    if (leagueDetails?.platform) {
      loadPlatformLogo(leagueDetails.platform);
    }
  }, [leagueDetails?.platform]);

  useEffect(() => {
    const fetchGroup = async () => {
      if (!currentUser) {
        setError('You must be logged in to view this group');
        setLoading(false);
        return;
      }

      if (!groupId) {
        setError('Invalid group ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        
        const groupData = await getGroup(groupId);
        
        // Ensure we have valid group data
        if (!groupData || !groupData.id) {
          setError('Group not found');
          return;
        }

        // Ensure required group properties exist
        const validatedGroup: Group = {
          ...groupData,
          members: groupData.members || [],
          memberIds: groupData.memberIds || [],
          pendingMembers: groupData.pendingMembers || [],
          wallet: groupData.wallet || {
            platformId: `group_${groupId}`,
            groupId,
            ownerId: groupData.ownerId,
            name: 'Group Wallet',
            logo: '/images/BankrollLogoTransparent.png',
            cashBalance: 0,
            bonusBalances: [],
            totalBonusBalance: 0,
            lastUpdated: new Date(),
            status: 'active',
            connected: true,
            memberBalances: {},
            expenses: []
          }
        };

        setGroup(validatedGroup);
        
        // Try to parse league details from description
        if (groupData.description) {
          try {
            const details = JSON.parse(groupData.description);
            if (details.platform && details.leagueId) {
              setLeagueDetails(details as LeagueDetails);
            }
          } catch (e) {
            console.log('Not a league group or invalid JSON in description');
          }
        }
      } catch (error: any) {
        console.error('Error fetching group:', error);
        setError(error.message || 'Failed to load group');
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [groupId, currentUser, getGroup]);

  // Rest of the component remains the same...
  // Previous methods and JSX remain unchanged...

  return (
    <>
      {/* Previous JSX remains the same... */}
    </>
  );
};

export default GroupViewModal;
