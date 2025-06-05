import React, { useState, useEffect } from 'react';
import { getCollegeLogo } from '../data/collegeImages';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { uploadCollegeLogo } from '../firebase/storage';

const CollegeAvatar = ({ name, className = '', logoUrl = null, onLogoChange = null }) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentLogoUrl, setCurrentLogoUrl] = useState(logoUrl);

  useEffect(() => {
    setImageError(false);
    setIsLoading(true);
    setCurrentLogoUrl(logoUrl);
  }, [logoUrl]);

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

  const getInitials = (name) => {
    return name
      .split(/\s+/)
      .map(word => word[0])
      .join('')
      .slice(0, 3)
      .toUpperCase();
  };

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
    
    const sum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[sum % colors.length];
  };

  const initials = getInitials(name);
  const bgColor = getBackgroundColor(name);
  
  // Determine text size based on container size
  const getTextSize = () => {
    const containerSize = className.match(/w-(\d+)/)?.[1] || 16;
    if (containerSize <= 8) return 'text-xs';
    if (containerSize <= 12) return 'text-sm';
    if (containerSize <= 16) return 'text-base';
    if (containerSize <= 20) return 'text-lg';
    return 'text-xl';
  };

  const spinnerSize = className.match(/w-(\d+)/)?.[1] <= 16 ? 'w-4 h-4' : 'w-8 h-8';
  
  return (
    <div className={`relative group ${className}`}>
      <div className={`relative flex items-center justify-center bg-gray-50 rounded-md w-full h-full ${imageError ? 'hidden' : ''}`}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`${spinnerSize} border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin`} />
          </div>
        )}
        <img
          key={currentLogoUrl}
          src={currentLogoUrl || getCollegeLogo(name)}
          alt={`${name} logo`}
          className={`w-full h-full object-contain p-1 transition-opacity duration-200 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          onError={() => {
            setImageError(true);
            setIsLoading(false);
          }}
          onLoad={() => {
            setIsLoading(false);
            setImageError(false);
          }}
          loading="lazy"
        />
      </div>

      {imageError && (
        <div 
          className={`flex items-center justify-center rounded-md ${bgColor} w-full h-full`}
          title={name}
        >
          <span className={`text-white font-bold ${getTextSize()}`}>
            {initials}
          </span>
        </div>
      )}

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
              
              const collegeData = collegeDoc.exists() ? collegeDoc.data() : {};
              
              const updatedData = {
                name,
                conference: collegeData.conference || 'Unknown',
                logoUrl: null
              };
              
              const newLogoUrl = await uploadCollegeLogo(file, name, updatedData.conference);
              updatedData.logoUrl = newLogoUrl;
              
              await setDoc(collegeRef, updatedData, { merge: true });
              setCurrentLogoUrl(newLogoUrl);

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
        <svg className={`${className.match(/w-(\d+)/)?.[1] <= 16 ? 'w-4 h-4' : 'w-6 h-6'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </label>
    </div>
  );
};

export default CollegeAvatar;