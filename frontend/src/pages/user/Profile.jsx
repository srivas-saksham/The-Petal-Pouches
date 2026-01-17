// frontend/src/pages/user/Profile.jsx

import { useState, useEffect } from 'react';
import { LogOut, Loader2, User as UserIcon } from 'lucide-react';
import { useUserAuth } from '../../context/UserAuthContext';
import { useToast } from '../../hooks/useToast';
import { useNavigate } from 'react-router-dom';
import ProfileHeader from '../../components/user/profile/ProfileHeader';
import ProfileInfoCard from '../../components/user/profile/ProfileInfoCard';
import SecuritySettingsCard from '../../components/user/profile/SecuritySettingsCard';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// ==================== SKELETON COMPONENTS ====================

const ProfileHeaderSkeleton = () => (
  <div className="bg-white border border-tppslate/10 rounded-lg p-4 animate-pulse">
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <div className="w-20 h-20 bg-tppslate/10 rounded-full" />
      <div className="flex-1 space-y-2 text-center sm:text-left">
        <div className="h-5 bg-tppslate/10 rounded w-40 mx-auto sm:mx-0" />
        <div className="h-4 bg-tppslate/10 rounded w-56 mx-auto sm:mx-0" />
      </div>
    </div>
  </div>
);

const CardSkeleton = () => (
  <div className="bg-white border border-tppslate/10 rounded-lg overflow-hidden animate-pulse">
    <div className="px-4 py-3 border-b border-tppslate/10">
      <div className="h-4 bg-tppslate/10 rounded w-32" />
    </div>
    <div className="p-4 space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i}>
          <div className="h-3 bg-tppslate/10 rounded w-20 mb-2" />
          <div className="h-10 bg-tppslate/10 rounded" />
        </div>
      ))}
    </div>
  </div>
);

// ==================== MAIN COMPONENT ====================

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user, updateUser, logout, getAuthHeader } = useUserAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // ✅ FIX: Fetch fresh user data if created_at is missing
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user && !user.created_at) {
        try {
          const response = await fetch(`${API_URL}/api/auth/me`, {
            headers: getAuthHeader()
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data.user) {
              updateUser(data.data.user);
            }
          }
        } catch (error) {
          console.error('Failed to refresh user profile:', error);
        }
      }
      
      setTimeout(() => setLoading(false), 600);
    };

    fetchUserProfile();
  }, [user?.id]); // Only run when user ID changes

  const handleLogout = async () => {
    if (!confirm('Are you sure you want to logout?')) return;

    setIsLoggingOut(true);
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed');
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="mx-auto px-4">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-tppslate flex items-center gap-3">
          <UserIcon className="w-7 h-7 text-tpppink" />
          My Profile
        </h1>
        <p className="text-sm text-tppslate/80 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Header */}
      {loading ? (
        <ProfileHeaderSkeleton />
      ) : (
        <ProfileHeader user={user} />
      )}

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        {/* Personal Information - Wider (2 columns) */}
        <div className="lg:col-span-2">
          {loading ? (
            <CardSkeleton />
          ) : (
            <ProfileInfoCard user={user} onUpdate={updateUser} />
          )}
        </div>

        {/* Security Settings - Sidebar */}
        <div className="space-y-4">
          {loading ? (
            <>
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : (
            <>
              <SecuritySettingsCard />

              {/* Logout Card */}
              <div className="bg-white border border-tppslate/10 rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-tppslate/10">
                  <h3 className="text-sm font-bold text-tppslate">Account Actions</h3>
                </div>
                <div className="p-4">
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoggingOut ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Logging out...
                      </>
                    ) : (
                      <>
                        <LogOut className="w-4 h-4" />
                        Logout
                      </>
                    )}
                  </button>
                  <p className="text-xs text-tppslate/50 mt-2 text-center">
                    Sign out from this device
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}