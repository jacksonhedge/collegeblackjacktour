import React, { useState, useEffect } from 'react';
import { getCollegeLogo } from '../data/collegeImages';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { uploadCollegeLogo } from '../firebase/storage';

const CollegeAvatar = ({ name, className = '', logoUrl = null, onLogoChange = null }) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentLogoUrl, setCurrentLogoUrl] = useState(logoUrl);

  // Reset states and update current logo URL when logoUrl prop changes
  useEffect(() => {
    setImageError(false);
    setIsLoading(true);
    setCurrentLogoUrl(logoUrl);
  }, [logoUrl]);

  // Fetch logo URL from Firestore if not provided
  useEffect(() => {
    const fetchLogoUrl = async () => {
      if (!logoUrl) {
        try {
          const collegeId = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          const collegeRef = doc(db, 'colleges', collegeId);
          const collegeDoc = await getDoc(collegeRef);
          
          if (collegeDoc.exists() && collegeDoc.data().logoUrl) {
            setCurrentLogoUrl(collegeDoc.data().logoUrl);
          }
        } catch (error) {
          console.error('Error fetching logo URL:', error);
        }
      }
    };

    fetchLogoUrl();
  }, [name, logoUrl]);

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

  const initials = getInitials(name);
  const bgColor = getBackgroundColor(name);
  
  return (
    <div className={`relative group ${className}`}>
      {/* Image container */}
      <div className={`relative flex items-center justify-center bg-gray-50 rounded-md w-full h-full ${imageError ? 'hidden' : ''}`}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
          </div>
        )}
        <img
          key={currentLogoUrl} // Force re-render when URL changes
          src={currentLogoUrl || getCollegeLogo(name)}
          alt={`${name} logo`}
          className={`w-full h-full object-contain transition-opacity duration-200 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          onError={() => {
            console.log('Image error for:', name);
            setImageError(true);
            setIsLoading(false);
          }}
          onLoad={() => {
            console.log('Image loaded for:', name);
            setIsLoading(false);
            setImageError(false);
          }}
          loading="lazy"
        />
      </div>

      {/* Fallback initials */}
      {imageError && (
        <div 
          className={`flex items-center justify-center rounded-md ${bgColor} w-full h-full`}
          title={name}
        >
          <span className="text-white font-bold text-xl">
            {initials}
          </span>
        </div>
      )}

      {/* Hover overlay for upload */}
      <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 cursor-pointer rounded-md transition-opacity">
        <input 
          type="file" 
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            if (file.size > 5 * 1024 * 1024) {
              alert('File size must be less than 5MB');
              return;
            }

            if (!file.type.startsWith('image/')) {
              alert('File must be an image');
              return;
            }

            setIsLoading(true);
            setImageError(false);
            
            try {
              const collegeId = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
              const collegeRef = doc(db, 'colleges', collegeId);
              const collegeDoc = await getDoc(collegeRef);
              
              // Get existing college data or create new data
              const collegeData = collegeDoc.exists() ? collegeDoc.data() : {};
              
              // Ensure we have valid data with defaults
              const updatedData = {
                name,
                conference: collegeData.conference || 'Unknown',
                logoUrl: null // Will be updated after upload
              };
              
              // Upload new logo
              const newLogoUrl = await uploadCollegeLogo(file, name, updatedData.conference);
              
              // Update the logo URL in our data
              updatedData.logoUrl = newLogoUrl;
              
              // Update college document with all data
              await setDoc(collegeRef, updatedData, { merge: true });

              // Update local state
              setCurrentLogoUrl(newLogoUrl);

              // Notify parent component of the new logo URL
              if (onLogoChange) {
                onLogoChange(newLogoUrl);
              }
              
            } catch (error) {
              console.error('Error uploading logo:', error);
              setImageError(true);
              alert('Error uploading logo. Please try again.');
            } finally {
              setIsLoading(false);
            }
          }}
        />
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </label>
    </div>
  );
};

export default CollegeAvatar;
