// frontend/src/components/user/layout/CustomerLayout.jsx

import { useState } from 'react';
import CustomerSidebar from './Sidebar';
import CustomerTopBar from './TopBar';
import { useBrand } from  '../../../context/BrandContext';

export default function CustomerLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { brandMode } = useBrand();
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex h-screen dark:bg-tppdark"
      style={{
        backgroundImage: brandMode == 'feminine' ? 'url(/assets/windmill_saturated.png)' : 'url(/assets/windmill_grey_dark.png)',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }}
    >
      <CustomerSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      <div className="flex flex-col flex-1 overflow-hidden bg-tppslate/15 dark:bg-tppdark/60">
        <CustomerTopBar onMenuClick={toggleSidebar} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 dark:bg-black/70 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}
    </div>
  );
}