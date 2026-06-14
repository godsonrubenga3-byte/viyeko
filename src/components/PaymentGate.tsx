import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, Smartphone, Building2, CheckCircle2, ChevronRight, X, Loader2, ShieldCheck, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

interface PaymentGateProps {
  amount: number;
  serviceTitle: string;
  onSuccess: () => void;
  onCancel: () => void;
}

type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'wallet';

export default function PaymentGate({ amount, serviceTitle, onSuccess, onCancel }: PaymentGateProps) {
  const [method, setMethod] = useState<PaymentMethod>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);
    // Simulate payment gateway delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setIsSuccess(true);
    
    setTimeout(() => {
      onSuccess();
    }, 2000);
  };

  const methods = [
    { id: 'upi', label: 'UPI / QR', icon: Smartphone, description: 'Google Pay, PhonePe, Paytm' },
    { id: 'card', label: 'Card', icon: CreditCard, description: 'Visa, Mastercard, RuPay' },
    { id: 'netbanking', label: 'Net Banking', icon: Building2, description: 'All major Indian banks' },
    { id: 'wallet', label: 'Wallets', icon: Zap, description: 'Mobikwik, Freecharge' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[130] flex items-center justify-center p-6"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-charcoal w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl border border-subtle relative"
      >
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div 
              key="selection"
              exit={{ opacity: 0, x: -20 }}
              className="p-8 space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-black text-slate-100 italic tracking-tight uppercase">SECURE CHECKOUT</h2>
                <button onClick={onCancel} className="p-2 bg-subtle rounded-full text-slate-500 hover:text-slate-300 transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="bg-subtle rounded-full p-4 flex justify-between items-center border border-subtle px-8">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Service</p>
                  <p className="text-sm font-bold text-slate-100">{serviceTitle}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Amount</p>
                  <p className="text-xl font-black text-slate-yellow">₹{amount}</p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Select Payment Method</p>
                {methods.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id as PaymentMethod)}
                    className={cn(
                      "w-full p-4 rounded-full px-6 border transition-all flex items-center gap-4 text-left group",
                      method === m.id 
                        ? "bg-slate-yellow/10 border-slate-yellow text-slate-yellow" 
                        : "bg-subtle border-subtle text-slate-400 hover:opacity-80"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-full transition-colors",
                      method === m.id ? "bg-slate-yellow text-charcoal" : "bg-subtle group-hover:opacity-80"
                    )}>
                      <m.icon size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold uppercase tracking-widest">{m.label}</p>
                      <p className="text-[10px] opacity-60">{m.description}</p>
                    </div>
                    {method === m.id && <ChevronRight size={18} />}
                  </button>
                ))}
              </div>

              <div className="pt-4 space-y-4">
                <div className="flex items-center justify-center gap-2 text-emerald-500/50">
                  <ShieldCheck size={14} />
                  <span className="text-[9px] font-bold uppercase tracking-widest">AES-256 Bit Encrypted</span>
                </div>
                <button 
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="btn-viyeko-primary w-full h-14"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-3">
                      <Loader2 size={20} className="animate-spin" />
                      <span>Verifying...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>Pay ₹{amount}</span>
                      <ChevronRight size={20} />
                    </div>
                  )}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-12 text-center space-y-6"
            >
              <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 12, stiffness: 200 }}
                >
                  <CheckCircle2 size={64} className="text-emerald-500" />
                </motion.div>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-100 italic tracking-tight">PAYMENT SUCCESS</h3>
                <p className="text-slate-400 text-sm">Transaction ID: VIY_{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
              </div>
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-400/10 py-2 rounded-full px-4 inline-block">
                Dispatching Provider Now
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
