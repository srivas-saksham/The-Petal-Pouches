// frontend/src/components/user/layout/CustomerLayout.jsx

import { useState } from 'react';
import CustomerSidebar from './Sidebar';
import CustomerTopBar from './TopBar';

export default function CustomerLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen"
    style={{
        backgroundImage: 'url(/assets/windmill_saturated.png)',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }}
    >
      {/* Sidebar */}
      <CustomerSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden bg-tppslate/15">
        {/* Top Bar */}
        <CustomerTopBar onMenuClick={toggleSidebar} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
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