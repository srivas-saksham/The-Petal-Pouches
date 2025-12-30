// frontend/src/pages/auth/OAuthCallback.jsx

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserAuth } from '../../context/UserAuthContext';
import { useToast } from '../../hooks/useToast';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const { handleOAuthCallback } = useUserAuth();
  const toast = useToast();

  useEffect(() => {
    const processCallback = async () => {
      try {
        const result = await handleOAuthCallback();
        
        if (result.success) {
          toast.success('Welcome back!');
          navigate('/user/dashboard');
        } else {
          toast.error('Google login failed. Please try again.');
          navigate('/login');
        }
      } catch (error) {
        toast.error('Authentication error occurred');
        navigate('/login');
      }
    };

    processCallback();
  }, [handleOAuthCallback, navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-tpppeach via-white to-tpppeach/50">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-tpppink border-t-transparent"></div>
        </div>
        <h2 className="text-2xl font-bold text-tppslate mb-2">Completing Sign In</h2>
        <p className="text-tppslate/60">Please wait while we verify your account...</p>
      </div>
    </div>
  );
}