function getDashboardPath(role) {
  switch (role) {
    case 'patient':
      return '/patient/dashboard';
    case 'doctor':
      return '/doctor/dashboard';
    case 'admin':
      return '/admin/dashboard';
    case 'lab_admin':
    case 'lab_staff':
      return '/quick-lab';
    default:
      return '/';
  }
}
export default getDashboardPath;
