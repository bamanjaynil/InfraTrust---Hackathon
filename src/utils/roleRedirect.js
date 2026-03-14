export const getRoleRedirectPath = (role) => {
  switch (role) {
    case 'ADMIN':
      return '/admin/dashboard';
    case 'CONTRACTOR':
      return '/contractor/dashboard';
    case 'DRIVER':
      return '/driver/dashboard';
    case 'CITIZEN':
      return '/citizen/dashboard';
    default:
      return '/login';
  }
};
