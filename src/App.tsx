import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'sonner';

// Context & Hooks
import { ThemeProvider } from './context/ThemeContext';
import { useAuth } from './context/AuthContext';
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

// Types
import { User as UserType } from './types';

export default function App() {
  const { user: authUser, loading: authLoading, signOut, role } = useAuth();
  const { requests, addRequest, submitBid, acceptBid, advanceStatus, cancelRequest } = useRequests();
  const [devRole, setDevRole] = useState<'driver' | 'provider' | 'admin' | null>(() => {
    return (localStorage.getItem('viyeko_dev_role') as any) || null;
  });

  const handleDevBypass = (role: string) => {
    localStorage.setItem('viyeko_dev_role', role);
    setDevRole(role as any);
  };

  const handleLogout = async () => {
    try {
      if (devRole) {
        localStorage.removeItem('viyeko_dev_role');
        setDevRole(null);
      } else {
        await signOut();
      }
      toast.success('Logged out safely');
    } catch (err) {
      toast.error('Logout failed');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-slate-yellow border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!authUser && !devRole) {
    return (
      <ErrorBoundary>
        <Toaster position="top-center" richColors />
        <AuthScreen onBypass={handleDevBypass} />
      </ErrorBoundary>
    );
  }

  const roleToUse = devRole || role;

  const user: UserType = {
    id: authUser?.id || '00000000-0000-0000-0000-000000000000',
    name: authUser?.user_metadata.full_name || 'Developer Mode',
    phone: authUser?.user_metadata.phone || '+255 700 000 000',
    email: authUser?.email || 'dev@viyeko.com',
    avatar: authUser?.user_metadata.avatar_url || `https://picsum.photos/seed/dev/200/200`
  };

  return (
    <ThemeProvider>
      <ErrorBoundary>
        <Toaster position="top-center" richColors />
        <Routes>
          <Route element={<MainLayout user={user} />}>
            <Route path="/" element={
              roleToUse === 'provider' || roleToUse === 'admin' ? (
                <ProviderDashboard 
                  requests={requests}
                  onAccept={advanceStatus}
                  onComplete={advanceStatus}
                  onSendBid={submitBid}
                  userId={user.id}
                />
              ) : (
                <HomePage 
                  requests={requests}
                  onAddRequest={addRequest}
                  onCancelRequest={cancelRequest}
                  onAdvanceStatus={advanceStatus}
                  onAcceptBid={acceptBid}
                />
              )
            } />
            <Route path="/history" element={<HistoryPage requests={requests} />} />
            <Route path="/profile" element={<ProfilePage user={user} onLogout={handleLogout} />} />
            <Route path="/admin" element={roleToUse === 'admin' ? <AdminPanel /> : <HomePage requests={requests} onAddRequest={addRequest} onCancelRequest={cancelRequest} onAdvanceStatus={advanceStatus} onAcceptBid={acceptBid} />} />
          </Route>
        </Routes>
      </ErrorBoundary>
    </ThemeProvider>
  );
}
