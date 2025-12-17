function getDashboardPath(role) {
  switch (role) {
    case 'patient':
      return '/patient/dashboard';
    case 'doctor':
      return '/doctor/dashboard';
    case 'admin':
      return '/admin/dashboard';
    case 'lab_admin':
      return '/quick-lab/dashboard';
    case 'lab_staff':
      return '/quick-lab/staff-dashboard';
    default:
      return '/';
  }
}
export default getDashboardPath;
