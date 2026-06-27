'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMizanStore } from '@/store/useMizanStore';
import { ChevronRight, Sparkles, Lock, ArrowRight, User, Landmark, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function OnboardingWizard() {
  const { completeOnboarding } = useMizanStore();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  
  // PIN states
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');

  // Initial Account Balances
  const [salBal, setSalBal] = useState('0');
  const [savBal, setSavBal] = useState('0');
  const [upiBal, setUpiBal] = useState('0');
  const [cashBal, setCashBal] = useState('0');

  const handleNextStep = () => {
    if (step === 1) {
      if (!name.trim()) return;
      setStep(2);
    } else if (step === 2) {
      if (pin.length !== 4) {
        setPinError('PIN must be exactly 4 digits.');
        return;
      }
      if (pin !== confirmPin) {
        setPinError('PIN entries do not match.');
        return;
      }
      setPinError('');
      setStep(3);
    }
  };

  const handleFinish = async () => {
    const parsedSal = Number(salBal) || 0;
    const parsedSav = Number(savBal) || 0;
    const parsedUpi = Number(upiBal) || 0;
    const parsedCash = Number(cashBal) || 0;

    const initialAccounts = [
      { name: 'Salary Account', type: 'salary' as const, balance: parsedSal, color: '#8FAF9B' },
      { name: 'Savings Account', type: 'savings' as const, balance: parsedSav, color: '#607567' },
      { name: 'UPI Wallet', type: 'upi' as const, balance: parsedUpi, color: '#AFC5B3' },
      { name: 'Cash', type: 'cash' as const, balance: parsedCash, color: '#B3C8B9' },
    ];

    await completeOnboarding(name, pin, initialAccounts);

    // Celebratory confetti rain!
    confetti({
      particleCount: 150,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#8FAF9B', '#607567', '#AFC5B3', '#63A66F']
    });
  };

  return (
    <div className="fixed inset-0 bg-[#F7F9F7] dark:bg-[#121412] z-50 flex flex-col justify-between p-8 safe-top safe-bottom max-w-md mx-auto w-full">
      {/* Title */}
      <div className="flex flex-col items-center mt-6">
        <div className="w-12 h-12 rounded-full bg-[#8FAF9B]/10 dark:bg-[#8FAF9B]/5 flex items-center justify-center text-[#8FAF9B]">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>
        <h1 className="mt-3 text-2xl font-black text-[#1E1E1E] dark:text-[#F7F9F7] tracking-wider uppercase">MIZAN</h1>
        <span className="text-xxs text-[#757575] dark:text-[#757575] font-bold tracking-widest uppercase mt-0.5">Setup Companion</span>
      </div>

      {/* Slide Sections */}
      <div className="my-auto py-8">
        <AnimatePresence mode="wait">
          {/* Step 1: User name */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col space-y-4"
            >
              <div className="flex flex-col text-center mb-4">
                <h2 className="text-xl font-bold text-[#1E1E1E] dark:text-[#F7F9F7]">Welcome to Mizan</h2>
                <p className="text-xs text-[#757575] dark:text-[#757575] mt-1">Let's build your financial balance dashboard. First, what is your name?</p>
              </div>

              <div className="flex items-center space-x-3 bg-white dark:bg-[#1E221E] border border-[#ECECEC] dark:border-[#2C322E] rounded-2xl p-4 shadow-sm">
                <User className="w-5 h-5 text-[#8FAF9B]" />
                <input
                  type="text"
                  placeholder="Arshad"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-transparent border-none outline-none font-bold text-sm text-[#1E1E1E] dark:text-[#F7F9F7]"
                  maxLength={15}
                  required
                />
              </div>
            </motion.div>
          )}

          {/* Step 2: Set PIN */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col space-y-4"
            >
              <div className="flex flex-col text-center mb-2">
                <h2 className="text-xl font-bold text-[#1E1E1E] dark:text-[#F7F9F7]">Define Security PIN</h2>
                <p className="text-xs text-[#757575] dark:text-[#757575] mt-1">Mizan keeps your provisioning safe. Set a 4-digit login PIN.</p>
              </div>

              <div className="flex flex-col space-y-3">
                <div className="flex items-center space-x-3 bg-white dark:bg-[#1E221E] border border-[#ECECEC] dark:border-[#2C322E] rounded-2xl p-4 shadow-sm">
                  <Lock className="w-5 h-5 text-[#8FAF9B]" />
                  <input
                    type="password"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="Set PIN"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-transparent border-none outline-none font-bold text-sm tracking-widest text-[#1E1E1E] dark:text-[#F7F9F7]"
                  />
                </div>

                <div className="flex items-center space-x-3 bg-white dark:bg-[#1E221E] border border-[#ECECEC] dark:border-[#2C322E] rounded-2xl p-4 shadow-sm">
                  <Lock className="w-5 h-5 text-[#8FAF9B]" />
                  <input
                    type="password"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="Confirm PIN"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-transparent border-none outline-none font-bold text-sm tracking-widest text-[#1E1E1E] dark:text-[#F7F9F7]"
                  />
                </div>

                {pinError && (
                  <p className="text-xxs font-bold text-[#D66C6C] text-center">{pinError}</p>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 3: Accounts Starting Balances */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col space-y-4 max-h-[50vh] overflow-y-auto no-scrollbar pr-1"
            >
              <div className="flex flex-col text-center mb-1">
                <h2 className="text-xl font-bold text-[#1E1E1E] dark:text-[#F7F9F7]">Setup Your Accounts</h2>
                <p className="text-xs text-[#757575] dark:text-[#757575] mt-1">What are your starting balances? Skip or enter any numbers.</p>
              </div>

              <div className="flex flex-col space-y-3">
                {/* Salary Account */}
                <div className="bg-white dark:bg-[#1E221E] border border-[#ECECEC] dark:border-[#2C322E] rounded-2xl p-3.5 shadow-sm flex flex-col space-y-1.5">
                  <span className="text-[10px] font-bold text-[#8FAF9B]">SALARY ACCOUNT</span>
                  <div className="flex items-center">
                    <span className="text-sm font-bold text-[#757575] mr-1.5">₹</span>
                    <input
                      type="number"
                      value={salBal}
                      onChange={(e) => setSalBal(e.target.value)}
                      className="w-full bg-transparent border-none outline-none font-bold text-sm text-[#1E1E1E] dark:text-[#F7F9F7]"
                    />
                  </div>
                </div>

                {/* Savings Account */}
                <div className="bg-white dark:bg-[#1E221E] border border-[#ECECEC] dark:border-[#2C322E] rounded-2xl p-3.5 shadow-sm flex flex-col space-y-1.5">
                  <span className="text-[10px] font-bold text-[#607567]">SAVINGS ACCOUNT</span>
                  <div className="flex items-center">
                    <span className="text-sm font-bold text-[#757575] mr-1.5">₹</span>
                    <input
                      type="number"
                      value={savBal}
                      onChange={(e) => setSavBal(e.target.value)}
                      className="w-full bg-transparent border-none outline-none font-bold text-sm text-[#1E1E1E] dark:text-[#F7F9F7]"
                    />
                  </div>
                </div>

                {/* UPI Wallet */}
                <div className="bg-white dark:bg-[#1E221E] border border-[#ECECEC] dark:border-[#2C322E] rounded-2xl p-3.5 shadow-sm flex flex-col space-y-1.5">
                  <span className="text-[10px] font-bold text-[#AFC5B3]">UPI WALLET</span>
                  <div className="flex items-center">
                    <span className="text-sm font-bold text-[#757575] mr-1.5">₹</span>
                    <input
                      type="number"
                      value={upiBal}
                      onChange={(e) => setUpiBal(e.target.value)}
                      className="w-full bg-transparent border-none outline-none font-bold text-sm text-[#1E1E1E] dark:text-[#F7F9F7]"
                    />
                  </div>
                </div>

                {/* Cash */}
                <div className="bg-white dark:bg-[#1E221E] border border-[#ECECEC] dark:border-[#2C322E] rounded-2xl p-3.5 shadow-sm flex flex-col space-y-1.5">
                  <span className="text-[10px] font-bold text-[#757575]">CASH</span>
                  <div className="flex items-center">
                    <span className="text-sm font-bold text-[#757575] mr-1.5">₹</span>
                    <input
                      type="number"
                      value={cashBal}
                      onChange={(e) => setCashBal(e.target.value)}
                      className="w-full bg-transparent border-none outline-none font-bold text-sm text-[#1E1E1E] dark:text-[#F7F9F7]"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Button controls */}
      <div className="w-full mt-6">
        {step < 3 ? (
          <button
            onClick={handleNextStep}
            className="w-full py-4 bg-[#607567] text-white font-bold rounded-2xl active:scale-98 transition-all flex items-center justify-center space-x-1.5 shadow-premium"
          >
            <span>Continue</span>
            <ChevronRight className="w-4.5 h-4.5" />
          </button>
        ) : (
          <button
            onClick={handleFinish}
            className="w-full py-4 bg-[#63A66F] text-white font-bold rounded-2xl active:scale-98 transition-all flex items-center justify-center space-x-1.5 shadow-premium"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>Fulfill Setup</span>
          </button>
        )}
      </div>
    </div>
  );
}
