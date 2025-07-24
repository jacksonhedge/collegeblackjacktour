// Helper to get the proper base URL for invite links
export const getBaseUrl = () => {
  // In production or when we want to use the production URL
  if (import.meta.env.PROD || import.meta.env.VITE_USE_PROD_URL === 'true') {
    return 'https://bankroll.live';
  }
  
  // For development, always use bankroll.live for invite links
  // This ensures invite links work properly even in localhost
  return 'https://bankroll.live';
};

// Helper to generate group invite link
export const generateGroupInviteLink = (groupId) => {
  return `${getBaseUrl()}/join/group/${groupId}`;
};

// Helper to generate invite code link
export const generateInviteCodeLink = (inviteCode) => {
  return `${getBaseUrl()}/invite/${inviteCode}`;
};