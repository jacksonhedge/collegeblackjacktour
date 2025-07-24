import React from 'react';
import { getAvatarGradient } from '../../data/defaultAvatars';

const Avatar = ({ 
  src, 
  alt = 'Profile', 
  size = 'md', 
  avatar, 
  initials,
  className = '',
  gradient = true
}) => {
  const sizeClasses = {
    xs: 'w-8 h-8 text-xs',
    sm: 'w-10 h-10 text-sm',
    md: 'w-16 h-16 text-lg',
    lg: 'w-24 h-24 text-2xl',
    xl: 'w-32 h-32 text-3xl'
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;
  
  // If we have a custom image URL
  if (src && !src.includes('/images/avatars/')) {
    return (
      <div className={`relative rounded-full overflow-hidden ${sizeClass} ${className}`}>
        <img 
          src={src} 
          alt={alt}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // If we have a default avatar
  if (avatar) {
    const backgroundStyle = gradient ? {
      background: getAvatarGradient(avatar)
    } : {
      backgroundColor: avatar.colors[0]
    };

    return (
      <div 
        className={`relative rounded-full overflow-hidden flex items-center justify-center font-bold text-white ${sizeClass} ${className}`}
        style={backgroundStyle}
      >
        {initials || alt.charAt(0).toUpperCase()}
      </div>
    );
  }

  // Fallback to initials
  return (
    <div 
      className={`relative rounded-full overflow-hidden flex items-center justify-center font-bold text-white bg-gradient-to-br from-purple-600 to-pink-600 ${sizeClass} ${className}`}
    >
      {initials || alt.charAt(0).toUpperCase()}
    </div>
  );
};

export default Avatar;