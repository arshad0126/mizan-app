'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMizanStore } from '@/store/useMizanStore';
import { X, Sparkles, Check, CheckCircle2, ChevronRight, ChevronLeft, ArrowDownCircle, HeartHandshake } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PaydayWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PaydayWizard({ isOpen, onClose }: PaydayWizardProps) {
  const { accounts, allocatePaydayWizard } = useMizanStore();
  const [step, setStep] = useState(1);
  const [incomeAmount, setIncomeAmount] = useState('70000');
  
  // Allocations state
  const [allocNeeds, setAllocNeeds] = useState(25000);
  const [allocWants, setAllocWants] = useState(10000);
  const [allocParents, setAllocParents] = useState(10000);
  const [allocSavings, setAllocSavings] = useState(20000);
  const [allocCharity, setAllocCharity] = useState(5000);

  const [selectedDestAcc, setSelectedDestAcc] = useState({
    Needs: '',
    Wants: '',
    Parents: '',
    Savings: '',
    Charity: '',
  });

  // Load default accounts into selectors
  useEffect(() => {
    if (accounts.length > 0) {
      const salaryAcc = accounts.find(a => a.type === 'salary') || accounts[0];
      const savingsAcc = accounts.find(a => a.type === 'savings') || accounts[0];
      const upiAcc = accounts.find(a => a.type === 'upi') || accounts[0];
      const cashAcc = accounts.find(a => a.type === 'cash') || accounts[0];

      setSelectedDestAcc({
        Needs: salaryAcc.id,
        Wants: upiAcc.id,
        Parents: salaryAcc.id,
        Savings: savingsAcc.id,
        Charity: upiAcc.id,
      });
    }
  }, [accounts]);

  const parsedIncome = Number(incomeAmount) || 0;
  const totalAllocated = allocNeeds + allocWants + allocParents + allocSavings + allocCharity;
  const remainingToAllocate = parsedIncome - totalAllocated;

  const handleNextStep = () => {
    if (step === 1 && parsedIncome <= 0) return;
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const handleFinish = async () => {
    if (remainingToAllocate !== 0) return;

    const allocationsList = [
      { category: 'Needs', amount: allocNeeds, accountId: selectedDestAcc.Needs },
      { category: 'Wants', amount: allocWants, accountId: selectedDestAcc.Wants },
      { category: 'Parents', amount: allocParents, accountId: selectedDestAcc.Parents },
      { category: 'Savings', amount: allocSavings, accountId: selectedDestAcc.Savings },
      { category: 'Charity', amount: allocCharity, accountId: selectedDestAcc.Charity },
    ];

    await allocatePaydayWizard(parsedIncome, allocationsList);

    // Rain of green success confetti
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#8FAF9B', '#607567', '#AFC5B3', '#63A66F']
    });

    onClose();
    // Reset wizard
    setStep(1);
    setIncomeAmount('70000');
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-[#1E1E1E]/40 backdrop-blur-sm z-45"
        onClick={onClose}
      />

      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="fixed bottom-0 left-0 right-0 max-h-[92vh] overflow-y-auto bg-[#F7F9F7] rounded-t-[32px] shadow-premium-lg z-50 px-6 pt-5 pb-8 safe-bottom"
      >
        {/* Notch */}
        <div className="w-12 h-1.5 bg-[#ECECEC] rounded-full mx-auto mb-5 cursor-pointer" onClick={onClose} />

        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col">
            <span className="text-xxs text-[#757575] font-bold tracking-widest uppercase">BUDGET ENVELOPE WIZARD</span>
            <h2 className="text-lg font-bold text-[#1E1E1E] mt-0.5">Payday wizard</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full border border-[#ECECEC] bg-white text-[#757575] active:scale-95 transition-all shadow-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center space-x-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s === step
                  ? 'w-10 bg-[#8FAF9B]'
                  : s < step
                  ? 'w-4 bg-[#607567]'
                  : 'w-4 bg-[#ECECEC]'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: Incoming Provision */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col space-y-5"
            >
              <div className="flex flex-col bg-white border border-[#ECECEC] rounded-2xl p-5 shadow-sm">
                <label className="text-xxs font-bold text-[#757575] tracking-wider uppercase mb-1.5">INCOMING SALARY / PROVISION</label>
                <div className="flex items-center">
                  <span className="text-3xl font-extrabold text-[#8FAF9B] mr-2">₹</span>
                  <input
                    type="number"
                    value={incomeAmount}
                    onChange={(e) => setIncomeAmount(e.target.value)}
                    placeholder="Enter salary"
                    className="w-full text-3xl font-black outline-none border-none text-[#1E1E1E]"
                  />
                </div>
              </div>

              <div className="p-4 bg-[#8FAF9B]/10 rounded-2xl flex items-start space-x-3 border border-[#8FAF9B]/20">
                <Sparkles className="w-5 h-5 text-[#607567] shrink-0 mt-0.5" />
                <div className="flex flex-col text-xs text-[#607567] font-medium leading-relaxed">
                  <span className="font-bold mb-0.5">Barakah is in Planning</span>
                  <span>"Take benefit of five before five... your wealth before your poverty." Manage this provision intentionally. Let's allocate it to zero-based envelopes.</span>
                </div>
              </div>

              <button
                onClick={handleNextStep}
                disabled={parsedIncome <= 0}
                className="w-full py-4 rounded-2xl bg-[#607567] text-white font-bold hover:bg-[#8FAF9B] active:scale-98 transition-all flex items-center justify-center space-x-2 shadow-premium disabled:opacity-50 disabled:pointer-events-none"
              >
                <span>Allocate Provision</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* STEP 2: Zero-Based Allocation */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col space-y-5"
            >
              {/* Floating Counter */}
              <div className={`p-4 rounded-2xl flex justify-between items-center border transition-all duration-300 ${
                remainingToAllocate === 0
                  ? 'bg-[#63A66F]/10 border-[#63A66F] text-[#63A66F]'
                  : 'bg-amber-50 border-amber-200 text-amber-700'
              }`}>
                <div className="flex flex-col">
                  <span className="text-xxs font-bold uppercase tracking-wider">REMAINING TO ALLOCATE</span>
                  <span className="text-xl font-black">₹{remainingToAllocate.toLocaleString('en-IN')}</span>
                </div>
                {remainingToAllocate === 0 ? (
                  <div className="flex items-center space-x-1 font-bold text-xs bg-[#63A66F] text-white px-3 py-1.5 rounded-full shadow-sm animate-pulse">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Zero Balance!</span>
                  </div>
                ) : (
                  <span className="text-xxs font-bold px-2.5 py-1.5 bg-amber-100 rounded-full">
                    {remainingToAllocate > 0 ? 'Short' : 'Over'} by ₹{Math.abs(remainingToAllocate).toLocaleString('en-IN')}
                  </span>
                )}
              </div>

              {/* Allocation Sliders/Inputs */}
              <div className="flex flex-col space-y-4 max-h-[42vh] overflow-y-auto pr-1 no-scrollbar">
                {/* Needs envelope */}
                <div className="bg-white border border-[#ECECEC] rounded-2xl p-4 flex flex-col space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[#1E1E1E]">Needs (Food, Rent, Medical)</span>
                    <span className="text-xs font-bold text-[#607567]">₹{allocNeeds.toLocaleString('en-IN')}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={parsedIncome}
                    step="500"
                    value={allocNeeds}
                    onChange={(e) => setAllocNeeds(Number(e.target.value))}
                    className="w-full accent-[#8FAF9B]"
                  />
                </div>

                {/* Parents Support */}
                <div className="bg-white border border-[#ECECEC] rounded-2xl p-4 flex flex-col space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[#1E1E1E]">Parents Monthly Support</span>
                    <span className="text-xs font-bold text-[#607567]">₹{allocParents.toLocaleString('en-IN')}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={parsedIncome}
                    step="500"
                    value={allocParents}
                    onChange={(e) => setAllocParents(Number(e.target.value))}
                    className="w-full accent-[#8FAF9B]"
                  />
                </div>

                {/* Savings & Goals */}
                <div className="bg-white border border-[#ECECEC] rounded-2xl p-4 flex flex-col space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[#1E1E1E]">Savings & Goals</span>
                    <span className="text-xs font-bold text-[#607567]">₹{allocSavings.toLocaleString('en-IN')}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={parsedIncome}
                    step="500"
                    value={allocSavings}
                    onChange={(e) => setAllocSavings(Number(e.target.value))}
                    className="w-full accent-[#8FAF9B]"
                  />
                </div>

                {/* Charity Sadaqah */}
                <div className="bg-white border border-[#ECECEC] rounded-2xl p-4 flex flex-col space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[#1E1E1E]">Charity (Sadaqah, Zakat)</span>
                    <span className="text-xs font-bold text-[#607567]">₹{allocCharity.toLocaleString('en-IN')}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={parsedIncome}
                    step="500"
                    value={allocCharity}
                    onChange={(e) => setAllocCharity(Number(e.target.value))}
                    className="w-full accent-[#8FAF9B]"
                  />
                </div>

                {/* Wants */}
                <div className="bg-white border border-[#ECECEC] rounded-2xl p-4 flex flex-col space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[#1E1E1E]">Personal Wants (Coffee, Shopping)</span>
                    <span className="text-xs font-bold text-[#607567]">₹{allocWants.toLocaleString('en-IN')}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={parsedIncome}
                    step="500"
                    value={allocWants}
                    onChange={(e) => setAllocWants(Number(e.target.value))}
                    className="w-full accent-[#8FAF9B]"
                  />
                </div>
              </div>

              {/* Actions navigation */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handlePrevStep}
                  className="py-4 rounded-2xl border border-[#ECECEC] bg-white text-[#757575] font-bold active:scale-98 transition-all flex items-center justify-center space-x-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  onClick={handleNextStep}
                  disabled={remainingToAllocate !== 0}
                  className="py-4 rounded-2xl bg-[#607567] text-white font-bold hover:bg-[#8FAF9B] active:scale-98 transition-all flex items-center justify-center space-x-1 shadow-premium disabled:opacity-50 disabled:pointer-events-none"
                >
                  <span>Review Plan</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Review Confirmation */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col space-y-5"
            >
              <div className="bg-white border border-[#ECECEC] rounded-2xl p-5 shadow-sm flex flex-col space-y-4">
                <h3 className="text-xs font-bold text-[#607567] tracking-wider uppercase border-b border-[#ECECEC] pb-2">PROVISION PLAN BREAKDOWN</h3>
                
                <div className="flex justify-between items-center text-xs font-medium">
                  <span className="text-[#757575]">Needs Budget (Salary Acc)</span>
                  <span className="text-[#1E1E1E] font-bold">₹{allocNeeds.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-medium">
                  <span className="text-[#757575]">Parents Support (Salary Acc)</span>
                  <span className="text-[#1E1E1E] font-bold">₹{allocParents.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-medium">
                  <span className="text-[#757575]">Savings Goal Deposit (Savings Acc)</span>
                  <span className="text-[#1E1E1E] font-bold">₹{allocSavings.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-medium">
                  <span className="text-[#757575]">Charity envelope (UPI)</span>
                  <span className="text-[#1E1E1E] font-bold">₹{allocCharity.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-medium">
                  <span className="text-[#757575]">Personal Wants (UPI)</span>
                  <span className="text-[#1E1E1E] font-bold">₹{allocWants.toLocaleString('en-IN')}</span>
                </div>

                <div className="border-t border-dashed border-[#ECECEC] pt-3 flex justify-between items-center">
                  <span className="text-xs font-bold text-[#1E1E1E]">Total Allocated</span>
                  <span className="text-sm font-black text-[#63A66F]">₹{totalAllocated.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handlePrevStep}
                  className="py-4 rounded-2xl border border-[#ECECEC] bg-white text-[#757575] font-bold active:scale-98 transition-all flex items-center justify-center space-x-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  onClick={handleFinish}
                  className="py-4 rounded-2xl bg-[#63A66F] text-white font-bold hover:bg-[#607567] active:scale-98 transition-all flex items-center justify-center space-x-1.5 shadow-premium"
                >
                  <Check className="w-4 h-4" />
                  <span>Apply Allocations</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
