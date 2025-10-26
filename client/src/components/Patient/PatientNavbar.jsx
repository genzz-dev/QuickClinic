import PatientDesktopNavbar from './PatientDesktopNavbar';
import PatientMobileNavigation from './PatientMobileNavigation';

const PatientNavbar = () => {
  return (
    <>
      {/* Desktop Navbar - Hidden on mobile */}
      <div className="hidden md:block">
        <PatientDesktopNavbar />
      </div>

      {/* Mobile Navigation - Hidden on desktop */}
      <div className="md:hidden">
        <PatientMobileNavigation />
      </div>
    </>
  );
};

export default PatientNavbar;
