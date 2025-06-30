import React, { useState, useEffect } from 'react';
import { UserProfile } from './types';
import { useAuth } from './hooks/useAuth';
import { useUserProfile } from './hooks/useUserProfile';
import { isSupabaseConfigured } from './lib/supabase';
import AuthScreen from './components/AuthScreen';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';

function App() {
  const [profileChecked, setProfileChecked] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const { profile: userProfile, loading: profileLoading, loadProfile } = useUserProfile(user?.id);

  // Check for profile when user logs in
  useEffect(() => {
    if (user && !profileChecked) {
      setProfileChecked(true);
      // Profile will be loaded automatically by useUserProfile hook
    } else if (!user) {
      setProfileChecked(false);
    }
  }, [user, profileChecked]);

  const handleOnboardingComplete = async (profile: UserProfile) => {
    if (user) {
      // Profile will be saved and automatically updated via useUserProfile hook
      // Force a profile reload to ensure we have the latest data
      await loadProfile(user.id);
      setProfileChecked(true);
    }
  };

  const handleReset = () => {
    setProfileChecked(false);
  };

  // Show Supabase setup message if not configured
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full border border-white/20 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">⚡</span>
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-4">
            Setup Required
          </h1>
          
          <p className="text-white/80 mb-6 leading-relaxed">
            To use Fincyq, you need to connect to Supabase for secure data storage and authentication.
          </p>
          
          <div className="bg-blue-500/20 rounded-lg p-4 border border-blue-400/30 mb-6">
            <p className="text-blue-400 text-sm">
              Click the "Connect to Supabase" button in the top right corner to get started.
            </p>
          </div>
          
          <div className="text-white/60 text-sm">
            <p>This will set up:</p>
            <ul className="mt-2 space-y-1">
              <li>• Secure user authentication</li>
              <li>• Cloud data storage</li>
              <li>• Cross-device sync</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Show loading during initial auth check or profile loading
  if (authLoading || (user && profileLoading && !userProfile)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/80">
            {authLoading ? 'Loading Fincyq...' : 'Loading your profile...'}
          </p>
        </div>
      </div>
    );
  }

  // Show auth screen if user is not logged in
  if (!user) {
    return <AuthScreen />;
  }

  // Show dashboard if user has completed profile
  if (userProfile) {
    return <Dashboard profile={userProfile} onReset={handleReset} />;
  }

  // Show onboarding for authenticated users without a profile
  return <Onboarding onComplete={handleOnboardingComplete} />;
}

export default App;