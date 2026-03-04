// frontend/src/components/user/layout/Sidebar.jsx

import { 
  Home, ShoppingBag, Heart, MapPin, LogOut,
  Settings, Package, ChevronsLeft, ChevronsRight,
  User, ChevronDown
} from 'lucide-react';
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useUserAuth } from '../../../context/UserAuthContext';
import { useToast } from '../../../hooks/useToast';
import { useBrand } from '../../../context/BrandContext';

const NAVIGATION_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/user/dashboard' },
  { id: 'orders', label: 'Orders', icon: Package, path: '/user/orders' },
  { id: 'addresses', label: 'Addresses', icon: MapPin, path: '/user/addresses' },
  { id: 'profile', label: 'Profile', icon: User, path: '/user/profile' },
];

export default function UserSidebar({ isOpen, onClose }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { logout, user } = useUserAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const { brandMode } = useBrand();

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen z-50
          transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
          w-64 flex flex-col
        `}
      >
        {/* Diagonal Split Background */}
        <div className="absolute inset-0 -z-10">
          <div
            className="absolute inset-0 bg-tpppink dark:bg-tppdarkgray"
            style={{ clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 60%)' }}
          />
          <div
            className="absolute inset-0 bg-[#de6a7d] dark:bg-tppdark"
            style={{ clipPath: 'polygon(0 60%, 100% 50%, 100% 100%, 0 100%)' }}
          />
        </div>

        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="hidden lg:flex absolute -right-4 top-6 w-8 h-8 bg-white dark:bg-tppdarkgray border-2 border-tppslate/20 dark:border-tppdarkwhite/10 rounded-full items-center justify-center shadow-lg hover:shadow-xl hover:border-tppslate dark:hover:border-tppdarkwhite/30 transition-all duration-200 z-50"
          aria-label="Toggle sidebar"
        >
          {isCollapsed ? (
            <ChevronsRight className="w-4 h-4 text-tppslate dark:text-tppdarkwhite" />
          ) : (
            <ChevronsLeft className="w-4 h-4 text-tppslate dark:text-tppdarkwhite" />
          )}
        </button>

        {/* Logo Section */}
        <div className={`
          bg-white/10 dark:bg-tppdarkwhite/5 flex items-center gap-3 border-b-2 border-white/20 dark:border-tppdarkwhite/10 transition-all relative z-10
          ${isCollapsed ? 'justify-center px-3 py-4' : 'px-5 py-5'}
        `}>
          {!isCollapsed && (
            <div className="relative inline-block">
              <h1 className="text-6xl font-italianno text-white dark:text-tppdarkwhite transition-colors">
                Rizara
              </h1>
              <span className="font-yatraone absolute -right-1 bottom-1 uppercase text-[10px] tracking-[0.35em] font-light text-white dark:text-tppdarkwhite/70 pointer-events-none">
                {brandMode === 'feminine' ? 'Luxe' : 'Men'}
              </span>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-1 relative z-10">
          {NAVIGATION_ITEMS.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                onClick={onClose}
                title={isCollapsed ? item.label : ''}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 group
                  ${isCollapsed ? 'justify-center' : ''}
                  ${isActive
                    ? 'bg-white dark:bg-tppdarkwhite text-tppslate dark:text-tppdark shadow-md'
                    : 'text-white/80 dark:text-tppdarkwhite/70 hover:bg-white/10 dark:hover:bg-tppdarkwhite/5 hover:text-white dark:hover:text-tppdarkwhite'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`
                      flex-shrink-0 transition-all
                      ${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'}
                      ${isActive ? 'text-tppslate dark:text-tppdark' : 'text-white/70 dark:text-tppdarkwhite/50 group-hover:text-white dark:group-hover:text-tppdarkwhite'}
                    `} />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Gift Image Section */}
        {!isCollapsed && brandMode === 'feminine' && (
          <div className="relative z-10" onContextMenu={(e) => e.preventDefault()}>
            <img
              src="/assets/girl_bw_gifts_red_trans.png"
              alt="Gift offers"
              className="w-full h-auto object-contain scale-110"
              draggable={false}
            />
          </div>
        )}

        {/* User Profile Section */}
        <div className="bg-transparent border-t-2 border-white/20 dark:border-tppdarkwhite/10 p-3 relative z-20">
          {/* User Menu Dropdown */}
          {!isCollapsed && showUserMenu && (
            <div className="absolute bottom-full left-3 right-3 mb-2 space-y-1 animate-scale-in bg-white/95 dark:bg-tppdarkgray backdrop-blur-sm rounded-lg shadow-lg p-2">
              <NavLink
                to="/user/profile"
                onClick={() => { setShowUserMenu(false); onClose(); }}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all text-sm font-medium
                  ${isActive
                    ? 'bg-tpppink dark:bg-tppdarkwhite text-white dark:text-tppdark'
                    : 'text-tppslate dark:text-tppdarkwhite hover:bg-tpppink/10 dark:hover:bg-tppdarkwhite/5'
                  }`
                }
              >
                <User className="w-4 h-4" />
                <span>My Profile</span>
              </NavLink>

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingOut ? (
                  <>
                    <div className="w-4 h-4 border-2 border-red-600 dark:border-red-400 border-t-transparent rounded-full animate-spin" />
                    <span>Logging out...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* User Info */}
          <div
            onClick={() => !isCollapsed && setShowUserMenu(!showUserMenu)}
            className={`
              flex items-center gap-3 py-2.5 rounded-lg transition-all duration-200 group cursor-pointer
              ${isCollapsed ? 'justify-center px-2' : 'px-3 hover:bg-white/10 dark:hover:bg-tppdarkwhite/5'}
            `}
          >
            <div className={`
              bg-white dark:bg-tppdarkgray rounded-full flex items-center justify-center flex-shrink-0 transition-all
              ${isCollapsed ? 'w-10 h-10' : 'w-8 h-8'}
            `}>
              <span className={`text-tppslate dark:text-tppdarkwhite font-semibold transition-all ${isCollapsed ? 'text-sm' : 'text-xs'}`}>
                {getInitials(user?.name)}
              </span>
            </div>
            {!isCollapsed && (
              <>
                <div className="flex-1 min-w-0 overflow-hidden">
                  <p className="text-white dark:text-tppdarkwhite text-sm font-medium truncate">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-white/50 dark:text-tppdarkwhite/30 text-[10px] truncate">
                    {user?.email || 'email@example.com'}
                  </p>
                </div>
                <ChevronDown className={`
                  w-4 h-4 text-white/60 dark:text-tppdarkwhite/50 transition-transform duration-200
                  ${showUserMenu ? 'rotate-180' : ''}
                `} />
              </>
            )}
          </div>

          {/* Collapsed Logout Button */}
          {isCollapsed && (
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              title="Logout"
              className="w-full mt-2 flex items-center justify-center p-2.5 text-red-600 dark:text-red-400 hover:bg-white/20 dark:hover:bg-tppdarkwhite/5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? (
                <div className="w-5 h-5 border-2 border-red-600 dark:border-red-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <LogOut className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
      </aside>
    </>
  );
}