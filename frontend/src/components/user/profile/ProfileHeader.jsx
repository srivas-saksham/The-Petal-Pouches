// frontend/src/components/user/profile/ProfileHeader.jsx

import { Camera, Mail, Calendar, CheckCircle } from 'lucide-react';

export default function ProfileHeader({ user }) {
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const formatDate = (dateString) => {
    // ✅ FIX: Proper date validation and formatting
    if (!dateString) return 'Unknown';
    
    try {
      const date = new Date(dateString);
      
      // ✅ Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Unknown';
      }
      
      // ✅ Format: "January 2026" or "December 2025"
      return date.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Unknown';
    }
  };

  return (
    <div className="bg-white border border-tppslate/10 rounded-lg p-4">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Avatar */}
        <div className="relative group flex-shrink-0">
          <div className="w-20 h-20 bg-gradient-to-br from-tpppink to-tpppink/70 rounded-full flex items-center justify-center shadow-sm">
            <span className="text-white text-2xl font-bold">
              {getInitials(user?.name)}
            </span>
          </div>
          <button
            className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-sm border border-tppslate/10 hover:border-tpppink hover:shadow-md transition-all"
            title="Change avatar (Coming soon)"
          >
            <Camera className="w-3.5 h-3.5 text-tppslate" />
          </button>
        </div>

        {/* User Info */}
        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
            <h2 className="text-lg font-bold text-tppslate">{user?.name}</h2>
            {user?.email_verified && (
              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                <CheckCircle className="w-3 h-3" />
                Verified
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-sm text-tppslate/70">
            <div className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-tppslate/40" />
              <span className="text-xs">{user?.email}</span>
            </div>
            <span className="hidden sm:inline text-tppslate/30">•</span>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-tppslate/40" />
              <span className="text-xs">
                Joined {formatDate(user?.created_at)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}