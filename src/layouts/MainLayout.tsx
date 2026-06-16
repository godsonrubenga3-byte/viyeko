import React from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Navigation, 
  History, 
  Activity, 
  ShieldCheck, 
  Sun, 
  Moon, 
  LayoutDashboard
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { User } from '../types';
import NotificationSystem from '../components/NotificationSystem';
import { useRequests } from '../hooks/useRequests';

interface MainLayoutProps {
  user: User;
}

export default function MainLayout({ user }: MainLayoutProps) {
  const { theme, toggleTheme } = useTheme();
  const { role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { requests } = useRequests();

  // Navigation logic strictly derived from Verified Role
  const navItems = [
    { 
      id: 'home', 
      label: role === 'driver' ? 'Request' : 'Dashboard', 
      path: '/', 
      icon: role === 'driver' ? Navigation : LayoutDashboard 
    },
    { id: 'history', label: 'History', path: '/history', icon: History },
    { id: 'profile', label: 'Profile', path: '/profile', icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-charcoal flex flex-col md:flex-row w-full max-w-md md:max-w-6xl mx-auto shadow-2xl relative overflow-hidden font-sans transition-colors duration-300 edge-lighting">
      <NotificationSystem requests={requests} />
      
      {/* Header / Sidebar */}
      <header className="bg-charcoal text-white p-6 pt-8 md:pt-16 md:w-80 md:rounded-b-none md:rounded-r-[3rem] shadow-lg z-10 relative overflow-hidden flex flex-col shrink-0 border-r border-white/5">
        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-yellow/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <div className="flex md:flex-col justify-between items-center md:items-start mb-2 md:mb-8 relative z-10 gap-6">
          <Link to="/" className="text-3xl md:text-4xl font-black tracking-tighter italic text-slate-yellow">VIYEKO</Link>
          
          {/* User Profile Summary */}
          <div className="hidden md:flex items-center gap-3 p-3 bg-subtle rounded-full border border-subtle w-full">
            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full border border-slate-yellow/50" />
            <div className="flex flex-col">
              <span className="text-xs font-black text-slate-100">{user.name}</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{role === 'provider' ? 'Service Garage' : role || 'Member'}</span>
            </div>
          </div>

          <div className="flex md:flex-col items-center md:items-start gap-3 w-full">
            {/* Connection Status */}
            {!navigator.onLine && (
              <div className="bg-rose-500 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest animate-pulse w-full text-center md:text-left">
                Offline Mode
              </div>
            )}
            
            <button 
              onClick={toggleTheme}
              className="p-2 bg-subtle rounded-full hover:bg-slate-500/10 transition-colors flex items-center gap-2 md:w-full md:justify-center"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              <span className="hidden md:inline text-[10px] font-bold uppercase tracking-widest">
                {theme === 'dark' ? "Light Mode" : "Dark Mode"}
              </span>
            </button>
          </div>
        </div>
        <p className="text-slate-400 text-sm font-medium relative z-10 mb-8 hidden md:block">
          {role === 'provider' ? 'Garage Management Console' : 'Reliable Roadside Assistance in Punjab'}
        </p>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex flex-col gap-2 relative z-10">
          {navItems.map((item) => (
            <button 
              key={item.id}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex items-center gap-3 p-4 rounded-full transition-all font-bold uppercase tracking-widest text-xs",
                location.pathname === item.path ? "bg-slate-yellow text-charcoal shadow-lg shadow-slate-yellow/20" : "text-slate-400 hover:bg-subtle"
              )}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-auto relative z-10 hidden md:block">
          <div className="p-4 bg-subtle rounded-full border border-subtle">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Platform Support</p>
            <p className="text-xs text-slate-300">Operational assistance is available 24/7.</p>
            <a href="tel:112" className="mt-3 block text-center bg-slate-500/10 hover:bg-slate-500/20 py-2 rounded-full text-xs font-bold transition-colors">112 Dispatch</a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-0 px-6 pb-24 md:pt-4 md:px-12 md:pb-12 scrollbar-hide">
        <Outlet />
      </main>

      {/* Bottom Navigation (Mobile Only) */}
      <nav className="bg-charcoal border-t border-white/5 p-4 flex justify-around items-center fixed bottom-0 left-0 right-0 max-w-md mx-auto z-20 transition-colors duration-300 md:hidden">
        {navItems.filter(i => i.id !== 'admin').map((item) => (
          <button 
            key={item.id}
            onClick={() => navigate(item.path)}
            className={cn(
              "flex flex-col items-center gap-1 transition-colors",
              location.pathname === item.path ? "text-slate-yellow" : "text-slate-500"
            )}
          >
            <item.icon size={24} />
            <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
