import React from 'react';
import { motion } from 'motion/react';
import { 
  Zap, 
  Phone, 
  Activity, 
  ChevronRight, 
  ShieldCheck, 
  Car, 
  History 
} from 'lucide-react';
import { User, Vehicle } from '../types';

interface ProfilePageProps {
  user: User;
  onLogout: () => void;
}

export default function ProfilePage({ user, onLogout }: ProfilePageProps) {
  const vehicles: Vehicle[] = [
    { id: '1', make: 'Maruti', model: 'Swift', plate: 'CH01-XX-0000', color: 'White' },
    { id: '2', make: 'Hyundai', model: 'i20', plate: 'PB65-YY-1111', color: 'Red' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col items-center gap-4 py-6">
        <div className="relative">
          <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-full border-2 border-slate-yellow shadow-xl shadow-slate-yellow/20" />
          <div className="absolute bottom-0 right-0 bg-slate-yellow text-charcoal p-1.5 rounded-full border-2 border-charcoal">
            <Zap size={14} />
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-black text-slate-100 italic tracking-tight uppercase">{user.name}</h2>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Premium Member since 2024</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Account Information</h3>
          <div className="glass-card p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-slate-500" />
                <span className="text-sm font-bold text-slate-300">{user.phone}</span>
              </div>
              <ChevronRight size={16} className="text-slate-600" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity size={16} className="text-slate-500" />
                <span className="text-sm font-bold text-slate-300">{user.email}</span>
              </div>
              <ChevronRight size={16} className="text-slate-600" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">My Vehicles</h3>
            <button className="text-[10px] font-bold text-slate-yellow uppercase tracking-widest">+ Add New</button>
          </div>
          <div className="space-y-3">
            {vehicles.map(v => (
              <div key={v.id} className="glass-card p-4 flex items-center justify-between group hover:border-slate-yellow/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="bg-subtle p-3 rounded-full text-slate-yellow">
                    <Car size={20} />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-100 text-sm leading-none mb-1 uppercase">{v.make} {v.model}</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{v.color} • {v.plate}</p>
                  </div>
                </div>
                <button className="text-slate-600 hover:text-slate-400 transition-colors">
                  <History size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Settings</h3>
          <div className="glass-card p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck size={16} className="text-slate-500" />
                <span className="text-sm font-bold text-slate-300">Privacy & Security</span>
              </div>
              <ChevronRight size={16} className="text-slate-600" />
            </div>
          </div>
        </div>
      </div>

      <button 
        onClick={onLogout}
        className="w-full py-4 rounded-full bg-subtle text-rose-500 font-bold text-xs uppercase tracking-widest hover:bg-rose-500/10 transition-all shadow-lg"
      >
        Sign Out
      </button>
    </motion.div>
  );
}
