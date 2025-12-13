// frontend/src/components/admin/layout/AdminLayout.jsx

import { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div 
      className="flex h-screen overflow-hidden bg-gray-50"
      style={{
        backgroundImage: 'url(/assets/windmill_saturated.png)',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Sidebar - Fixed width with slate background */}
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Bar - Fixed height with white background */}
        <TopBar onMenuClick={toggleSidebar} />

        {/* Page Content - Scrollable with semi-transparent overlay */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}
    </div>
  );
}