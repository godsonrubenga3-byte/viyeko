import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import { useAuth } from './context/AuthContext';
import { useRequests } from './hooks/useRequests';
import { Loader2 } from 'lucide-react';
import { User as UserType } from './types';

// Pages
import HomePage from './pages/HomePage';
import AuthScreen from './components/AuthScreen';
import ProviderDashboard from './components/ProviderDashboard';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';
import OnboardingPage from './pages/OnboardingPage';

// Layouts
import MainLayout from './layouts/MainLayout';
import { ThemeProvider } from './context/ThemeContext';
import { useRegisterSW } from 'virtual:pwa-register/react';

// OBJECTIVE 4: Loading State (Dark Spinner)
const LoadingScreen = () => (
  <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
    <div className="relative">
      <div className="absolute inset-0 bg-slate-yellow/20 blur-2xl rounded-full" />
      <Loader2 className="w-12 h-12 text-slate-yellow animate-spin relative z-10" />
    </div>
    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] animate-pulse">Initializing VIYEKO</p>
  </div>
);

// OBJECTIVE 2: The Auth Guard
const ProtectedRoute = ({ children, allowedRole }: { children: React.ReactNode, allowedRole?: 'driver' | 'provider' }) => {
  const { user, loading, role, profileComplete } = useAuth();

  if (loading) return <LoadingScreen />;

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Intercept incomplete profiles
  if (!profileComplete && window.location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // OBJECTIVE 3: Role-Based Routing logic
  if (allowedRole && role && role !== allowedRole) {
    return <Navigate to={role === 'provider' ? '/provider' : '/'} replace />;
  }

  return <>{children}</>;
};

export default function App() {
  const { user: authUser, loading, role, profileComplete, signOut } = useAuth();
  const { requests, addRequest, submitBid, acceptBid, advanceStatus, cancelRequest } = useRequests();

  // PWA Update Prompt Logic
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered');
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  // Show toast when update is available
  React.useEffect(() => {
    if (needRefresh) {
      toast('Update Available', {
        description: 'A new version of VIYEKO is available. Reload to apply critical updates.',
        action: {
          label: 'Reload',
          onClick: () => updateServiceWorker(true)
        },
        duration: Infinity,
      });
    }
  }, [needRefresh, updateServiceWorker]);

  if (loading) return <LoadingScreen />;

  const user: UserType = {
    id: authUser?.id || '00000000-0000-0000-0000-000000000000',
    name: authUser?.user_metadata.full_name || 'Member',
    phone: authUser?.user_metadata.phone || '+255',
    email: authUser?.email || '',
    avatar: authUser?.user_metadata.avatar_url || `https://picsum.photos/seed/${authUser?.id}/200/200`
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out safely');
    } catch (err) {
      toast.error('Logout failed');
    }
  };

  return (
    <ThemeProvider>
      <Toaster position="top-center" richColors />
      <Routes>
        {/* Public Route */}
        <Route 
          path="/auth" 
          element={authUser ? <Navigate to={role === 'provider' ? '/provider' : '/'} replace /> : <AuthScreen />} 
        />

        {/* Onboarding Route */}
        <Route 
          path="/onboarding" 
          element={
            authUser ? (
              profileComplete ? <Navigate to="/" replace /> : <OnboardingPage />
            ) : <Navigate to="/auth" replace />
          } 
        />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute><MainLayout user={user} /></ProtectedRoute>}>
          {/* Driver Route */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute allowedRole="driver">
                <HomePage 
                  requests={requests}
                  onAddRequest={addRequest}
                  onCancelRequest={cancelRequest}
                  onAdvanceStatus={advanceStatus}
                  onAcceptBid={acceptBid}
                />
              </ProtectedRoute>
            } 
          />

          {/* Provider Route */}
          <Route 
            path="/provider" 
            element={
              <ProtectedRoute allowedRole="provider">
                <ProviderDashboard 
                  requests={requests}
                  onAccept={advanceStatus}
                  onComplete={advanceStatus}
                  onSendBid={submitBid}
                  userId={user.id}
                />
              </ProtectedRoute>
            } 
          />

          <Route path="/history" element={<HistoryPage requests={requests} />} />
          <Route path="/profile" element={<ProfilePage user={user} onLogout={handleLogout} />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeProvider>
  );
}
