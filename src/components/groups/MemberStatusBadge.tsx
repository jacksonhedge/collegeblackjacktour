import React from 'react';
import { Crown, Shield, Clock, UserCheck, Users } from 'lucide-react';
import type { MemberStatus } from '../../types/group';

interface MemberStatusBadgeProps {
  status: MemberStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showText?: boolean;
}

export const MemberStatusBadge: React.FC<MemberStatusBadgeProps> = ({ 
  status, 
  size = 'md',
  showIcon = true,
  showText = true
}) => {
  const getStatusIcon = (status: MemberStatus) => {
    const iconSize = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
    
    switch (status) {
      case 'owner':
        return <Crown className={`${iconSize} text-yellow-500`} />;
      case 'admin':
        return <Shield className={`${iconSize} text-blue-500`} />;
      case 'member':
        return <UserCheck className={`${iconSize} text-green-500`} />;
      case 'invited':
        return <Clock className={`${iconSize} text-orange-500`} />;
      case 'pending':
        return <Clock className={`${iconSize} text-gray-500`} />;
      default:
        return <Users className={`${iconSize} text-gray-400`} />;
    }
  };

  const getStatusText = (status: MemberStatus) => {
    switch (status) {
      case 'owner':
        return 'Owner';
      case 'admin':
        return 'Admin';
      case 'member':
        return 'Member';
      case 'invited':
        return 'Invited';
      case 'pending':
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  const getStatusBadgeColor = (status: MemberStatus) => {
    switch (status) {
      case 'owner':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'admin':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'member':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'invited':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'pending':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-1.5 py-0.5 text-xs';
      case 'lg':
        return 'px-3 py-1.5 text-sm';
      default:
        return 'px-2 py-1 text-xs';
    }
  };

  return (
    <div className={`inline-flex items-center rounded-full font-medium ${getStatusBadgeColor(status)} ${getSizeClasses()}`}>
      {showIcon && getStatusIcon(status)}
      {showText && (
        <span className={showIcon ? 'ml-1' : ''}>
          {getStatusText(status)}
        </span>
      )}
    </div>
  );
};

export default MemberStatusBadge;