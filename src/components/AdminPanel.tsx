import React from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  ShieldCheck, 
  Settings, 
  BarChart3, 
  Search, 
  Filter, 
  MoreVertical,
  AlertTriangle,
  Globe,
  RefreshCw,
  Download
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function AdminPanel() {
  const metrics = [
    { label: 'Total Users', value: '1,284', icon: Users, color: 'text-blue-400' },
    { label: 'Active Providers', value: '42', icon: ShieldCheck, color: 'text-emerald-400' },
    { label: 'System Health', value: '99.9%', icon: Globe, color: 'text-slate-yellow' },
    { label: 'Revenue (MTD)', value: '₹2.4L', icon: BarChart3, color: 'text-purple-400' },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-slate-100 italic tracking-tight uppercase">Control Center</h2>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Platform Administration & Oversight</p>
        </div>
        <div className="flex gap-2">
          <button className="p-2 bg-subtle border border-subtle rounded-full text-slate-400 hover:opacity-80 transition-all">
            <RefreshCw size={20} />
          </button>
          <button className="p-2 bg-subtle border border-subtle rounded-full text-slate-400 hover:opacity-80 transition-all">
            <Filter size={20} />
          </button>
          <button className="p-2 bg-slate-yellow text-charcoal rounded-full hover:bg-slate-yellow/90 transition-all">
            <Download size={20} />
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <motion.div 
            key={m.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-5 border-subtle"
          >
            <m.icon size={20} className={cn("mb-3", m.color)} />
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">{m.label}</p>
            <p className="text-2xl font-black text-slate-100 mt-1">{m.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Admin Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Recent Incidents</h3>
          <div className="glass-card overflow-hidden border-subtle">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-subtle">
                  <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Provider</th>
                  <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Service</th>
                  <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle">
                {[1, 2, 3, 4, 5].map((item) => (
                  <tr key={item} className="hover:bg-slate-500/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-subtle border border-subtle" />
                        <span className="text-xs font-bold text-slate-200">Rahul Singh</span>
                      </div>
                    </td>
                    <td className="p-4 text-xs text-slate-400">Tire Change</td>
                    <td className="p-4">
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 uppercase">Success</span>
                    </td>
                    <td className="p-4">
                      <button className="text-slate-600 hover:text-slate-400">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">System Alerts</h3>
          <div className="space-y-3">
            <div className="glass-card p-4 border-l-4 border-l-viyeko-red flex gap-3">
              <AlertTriangle className="text-viyeko-red shrink-0" size={18} />
              <div>
                <p className="text-xs font-bold text-slate-100">High Demand in Mohali</p>
                <p className="text-[10px] text-slate-500 mt-1">Average ETA has increased to 25 mins in Phase 7 area.</p>
              </div>
            </div>
            <div className="glass-card p-4 border-l-4 border-l-slate-yellow flex gap-3">
              <ShieldCheck className="text-slate-yellow shrink-0" size={18} />
              <div>
                <p className="text-xs font-bold text-slate-100">Provider Onboarding</p>
                <p className="text-[10px] text-slate-500 mt-1">4 new providers awaiting document verification.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
