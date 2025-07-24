// Default avatar options for users
export const defaultAvatars = [
  {
    id: 'avatar-1',
    name: 'Blue Wave',
    url: '/images/avatars/avatar-1.png',
    colors: ['#3B82F6', '#60A5FA']
  },
  {
    id: 'avatar-2',
    name: 'Purple Gradient',
    url: '/images/avatars/avatar-2.png',
    colors: ['#8B5CF6', '#A78BFA']
  },
  {
    id: 'avatar-3',
    name: 'Green Nature',
    url: '/images/avatars/avatar-3.png',
    colors: ['#10B981', '#34D399']
  },
  {
    id: 'avatar-4',
    name: 'Orange Sunset',
    url: '/images/avatars/avatar-4.png',
    colors: ['#F59E0B', '#FCD34D']
  },
  {
    id: 'avatar-5',
    name: 'Pink Dream',
    url: '/images/avatars/avatar-5.png',
    colors: ['#EC4899', '#F472B6']
  },
  {
    id: 'avatar-6',
    name: 'Red Fire',
    url: '/images/avatars/avatar-6.png',
    colors: ['#EF4444', '#F87171']
  },
  {
    id: 'avatar-7',
    name: 'Cyan Ocean',
    url: '/images/avatars/avatar-7.png',
    colors: ['#06B6D4', '#22D3EE']
  },
  {
    id: 'avatar-8',
    name: 'Indigo Night',
    url: '/images/avatars/avatar-8.png',
    colors: ['#6366F1', '#818CF8']
  }
];

// Function to get a random avatar
export const getRandomAvatar = () => {
  const randomIndex = Math.floor(Math.random() * defaultAvatars.length);
  return defaultAvatars[randomIndex];
};

// Function to get avatar by ID
export const getAvatarById = (id) => {
  return defaultAvatars.find(avatar => avatar.id === id) || defaultAvatars[0];
};

// Function to generate gradient background from avatar colors
export const getAvatarGradient = (avatar) => {
  if (!avatar || !avatar.colors) return 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)';
  return `linear-gradient(135deg, ${avatar.colors[0]} 0%, ${avatar.colors[1]} 100%)`;
};