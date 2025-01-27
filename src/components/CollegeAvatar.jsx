import React, { useState } from 'react';

const CollegeAvatar = ({ name, logoUrl, className = '' }) => {
  const [imageError, setImageError] = useState(false);

  // Get initials from college name (up to 3 letters)
  const getInitials = (name) => {
    return name
      .split(/\s+/)
      .map(word => word[0])
      .join('')
      .slice(0, 3)
      .toUpperCase();
  };

  // Generate a consistent color based on the college name
  const getBackgroundColor = (name) => {
    const colors = [
      'bg-blue-500',
      'bg-red-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500'
    ];
    
    // Use the sum of character codes to pick a color
    const sum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[sum % colors.length];
  };

  if (imageError) {
    const initials = getInitials(name);
    const bgColor = getBackgroundColor(name);
    
    return (
      <div 
        className={`flex items-center justify-center rounded-md ${bgColor} ${className}`}
        title={name}
      >
        <span className="text-white font-bold text-xl">
          {initials}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative flex items-center justify-center bg-gray-50 rounded-md ${className}`}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin opacity-0 transition-opacity duration-200" />
      </div>
      <img
        src={logoUrl}
        alt={`${name} logo`}
        className="w-full h-full object-contain relative z-10 transition-opacity duration-200"
        onError={() => setImageError(true)}
        onLoad={(e) => {
          e.target.parentElement.querySelector('.animate-spin').classList.add('opacity-0');
          e.target.classList.remove('opacity-0');
        }}
        loading="lazy"
        style={{ opacity: 0 }}
      />
    </div>
  );
};

export default CollegeAvatar;
