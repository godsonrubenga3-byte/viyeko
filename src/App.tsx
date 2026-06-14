import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import { AnimatePresence } from 'motion/react';

// Supabase
import { supabase } from './lib/supabase';

// Types
import { User as UserType } from './types';

// Context & Hooks
import { ThemeProvider } from './context/ThemeContext';
import { useRequests } from './hooks/useRequests';

// Layouts & Pages
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';
import AuthScreen from './components/AuthScreen';
import ProviderDashboard from './components/ProviderDashboard';
import AdminPanel from './components/AdminPanel';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Temporarily disabled
  const [isProviderMode, setIsProviderMode] = useState(false);
  const [user, setUser] = useState<UserType>({
    id: 'dev-user-123',
    name: 'Developer Mode',
    phone: '+91 98765 43210',
    email: 'dev@viyeko.com',
    avatar: 'https://picsum.photos/seed/dev/200/200'
  });

  const { requests, addRequest, advanceStatus, cancelRequest } = useRequests();
  const navigate = useNavigate();

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsAuthenticated(true);
        setUser({
          id: session.user.id,
          name: session.user.user_metadata.full_name || session.user.email?.split('@')[0] || 'Member',
          phone: session.user.user_metadata.phone || '+91 98765 43210',
          email: session.user.email || '',
          avatar: session.user.user_metadata.avatar_url || `https://picsum.photos/seed/${session.user.id}/200/200`
        });
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setIsAuthenticated(true);
        setUser({
          id: session.user.id,
          name: session.user.user_metadata.full_name || session.user.email?.split('@')[0] || 'Member',
          phone: session.user.user_metadata.phone || '+91 98765 43210',
          email: session.user.email || '',
          avatar: session.user.user_metadata.avatar_url || `https://picsum.photos/seed/${session.user.id}/200/200`
        });
      } else {
        setIsAuthenticated(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Logged out safely');
    } catch (err) {
      toast.error('Logout failed');
    }
  };

  const toggleProviderMode = () => {
    setIsProviderMode(!isProviderMode);
    navigate('/');
  };

  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <Toaster position="top-center" richColors />
        <AuthScreen onBack={() => setIsAuthenticated(true)} />
      </ErrorBoundary>
    );
  }

  return (
    <ThemeProvider>
      <ErrorBoundary>
        <Toaster position="top-center" richColors />
        <Routes>
          <Route element={<MainLayout user={user} isProviderMode={isProviderMode} toggleProviderMode={toggleProviderMode} />}>
            <Route path="/" element={
              isProviderMode ? (
                <ProviderDashboard 
                  requests={requests}
                  onAccept={advanceStatus}
                  onComplete={advanceStatus}
                  userId={user.id}
                />
              ) : (
                <HomePage 
                  requests={requests}
                  onAddRequest={addRequest}
                  onCancelRequest={cancelRequest}
                  onAdvanceStatus={advanceStatus}
                />
              )
            } />
            <Route path="/history" element={<HistoryPage requests={requests} />} />
            <Route path="/profile" element={<ProfilePage user={user} onLogout={handleLogout} />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Route>
        </Routes>
      </ErrorBoundary>
    </ThemeProvider>
  );
}
