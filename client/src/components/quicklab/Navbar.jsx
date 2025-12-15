// Navbar.jsx
import { useState } from 'react';
import DesktopNavbar from './DesktopNavbar';
import MobileNavbar from './MobileNavbar';
export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <>
      {/* Desktop Navbar - Hidden on mobile */}
      <DesktopNavbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* Mobile Navbar - Hidden on desktop */}
      <MobileNavbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
    </>
  );
}
