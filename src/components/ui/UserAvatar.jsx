import React, { useState } from 'react';

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-base"
};

// Array of gradient colors for different users
const gradientColors = [
  'from-purple-500 to-pink-500',
  'from-blue-500 to-cyan-500',
  'from-green-500 to-emerald-500',
  'from-orange-500 to-red-500',
  'from-indigo-500 to-purple-500',
  'from-pink-500 to-rose-500',
  'from-teal-500 to-blue-500',
  'from-amber-500 to-orange-500'
];

const UserAvatar = ({ user, size = "md", className = "" }) => {
  const [imageError, setImageError] = useState(false);

  const getInitials = (user) => {
    if (!user) return '?';
    
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.displayName) {
      const parts = user.displayName.split(' ');
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return parts[0].substring(0, 2).toUpperCase();
    }
    if (user.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    if (user.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    return '?';
  };

  const getGradientColor = (user) => {
    if (!user) return gradientColors[0];
    // Use user ID or email to consistently assign same color
    const identifier = user.uid || user.id || user.email || '0';
    const hash = identifier.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return gradientColors[hash % gradientColors.length];
  };

  const getAvatarUrl = (user) => {
    if (!user) return null;
    
    // Check various possible image properties
    if (user.profileImage) return user.profileImage;
    if (user.photoURL) return user.photoURL;
    
    // If it's a Sleeper user with an avatar ID
    if (user.avatar) {
      // Handle both full URLs and avatar IDs
      if (user.avatar.startsWith('http')) {
        return user.avatar;
      }
      return `https://sleepercdn.com/avatars/thumbs/${user.avatar}`;
    }
    
    return null;
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const avatarUrl = getAvatarUrl(user);
  const gradientColor = getGradientColor(user);

  // Show initials avatar if no image or image failed to load
  if (!avatarUrl || imageError) {
    return (
      <div className={`${sizeClass} ${className} rounded-full bg-gradient-to-br ${gradientColor} flex items-center justify-center text-white font-semibold shadow-lg`}>
        {getInitials(user)}
      </div>
    );
  }

  return (
    <img
      src={avatarUrl}
      alt={user?.displayName || user?.email || 'User'}
      className={`${sizeClass} ${className} rounded-full object-cover shadow-lg`}
      onError={() => setImageError(true)}
    />
  );
};

export default UserAvatar;
