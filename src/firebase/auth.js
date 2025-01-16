// Simple authentication check based on session expiration
export const isAuthenticated = () => {
  const expiresAt = localStorage.getItem('adminSessionExpires');
  return expiresAt && new Date().getTime() < parseInt(expiresAt);
};

// Sign in with just password
export const signInAsAdmin = async (password) => {
  if (password === 'hedgepayments') {
    const expiresAt = new Date().getTime() + (30 * 60 * 1000); // 30 minutes
    localStorage.setItem('adminSessionExpires', expiresAt.toString());
    return true;
  }
  throw new Error('Invalid password');
};
