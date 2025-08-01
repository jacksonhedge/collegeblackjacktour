// Admin levels
export const AdminLevel = {
  SUPER: 'super',
  REGULAR: 'regular'
};

// Admin password
const ADMIN_PASSWORD = 'B@nkroll2024!';

// Check if user is authenticated and get their admin level
export const isAuthenticated = () => {
  const expiresAt = localStorage.getItem('adminSessionExpires');
  return expiresAt && new Date().getTime() < parseInt(expiresAt);
};

export const getAdminLevel = () => {
  return localStorage.getItem('adminLevel') || null;
};

// Sign in with password and set appropriate admin level
export const signInAsAdmin = async (password) => {
  const expiresAt = new Date().getTime() + (30 * 60 * 1000); // 30 minutes

  if (password === ADMIN_PASSWORD) {
    localStorage.setItem('adminSessionExpires', expiresAt.toString());
    localStorage.setItem('adminLevel', AdminLevel.SUPER);
    return AdminLevel.SUPER;
  }
  
  throw new Error('Invalid password');
};

// Sign out
export const signOut = () => {
  localStorage.removeItem('adminSessionExpires');
  localStorage.removeItem('adminLevel');
};
