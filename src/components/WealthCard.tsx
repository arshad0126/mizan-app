'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useMizanStore } from '@/store/useMizanStore';
import { formatAmount } from '@/lib/utils';
import { Coins, PiggyBank, ShieldCheck, CalendarRange, HeartHandshake } from 'lucide-react';

export default function WealthCard() {
  const { accounts, budgets, goals, privacyMode } = useMizanStore();

  // 1. Calculate stats
  const totalWealth = accounts.reduce((sum, acc) => {
    if (acc.type === 'credit') return sum - acc.balance;
    return sum + acc.balance;
  }, 0);

  const savingsTotal = accounts
    .filter(acc => acc.type === 'savings' || acc.type === 'investment')
    .reduce((sum, acc) => sum + acc.balance, 0);

  const emergencySaved = goals
    .filter(g => g.category === 'Emergency')
    .reduce((sum, g) => sum + g.saved, 0);

  const monthlyBudgetLimit = budgets.reduce((sum, b) => sum + b.allocated, 0);
  const monthlySpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const monthlyRemaining = Math.max(0, monthlyBudgetLimit - monthlySpent);

  // Today's Budget: remaining budget divided by remaining days in current month
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const remainingDays = Math.max(1, totalDays - today.getDate() + 1);
  const todaysBudget = Math.max(0, monthlyRemaining / remainingDays);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      className={`relative w-full overflow-hidden rounded-3xl p-6 shadow-premium ${
        privacyMode === 'hide-all'
          ? 'bg-gradient-to-br from-[#ECECEC] to-[#F7F9F7] border border-[#ECECEC]'
          : 'bg-gradient-to-br from-[#607567] via-[#8FAF9B] to-[#AFC5B3] text-white'
      }`}
    >
      {/* Decorative vector background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />

      <div className="flex flex-col relative z-10">
        <span className={`text-xs font-bold tracking-wider uppercase ${
          privacyMode === 'hide-all' ? 'text-[#757575]' : 'text-white/80'
        }`}>
          TOTAL WEALTH (RIZQ)
        </span>
        
        <h2 className={`text-4xl font-extrabold tracking-tight mt-1 transition-all duration-300 ${
          privacyMode === 'hide-all' ? 'text-[#1E1E1E] filter blur-sm' : 'text-white'
        }`}>
          {formatAmount(totalWealth, privacyMode)}
        </h2>

        {/* Small separator */}
        <div className={`w-full h-px my-5 ${
          privacyMode === 'hide-all' ? 'bg-[#ECECEC]' : 'bg-white/20'
        }`} />

        {/* Grid for budget stats */}
        <div className="grid grid-cols-2 gap-y-4 gap-x-2">
          {/* Today's Budget */}
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl flex items-center justify-center ${
              privacyMode === 'hide-all' ? 'bg-[#F7F9F7] text-[#757575]' : 'bg-white/10 text-white'
            }`}>
              <CalendarRange className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className={`text-xxs font-semibold tracking-wider ${
                privacyMode === 'hide-all' ? 'text-[#757575]' : 'text-white/70'
              }`}>TODAY'S BUDGET</span>
              <span className={`text-sm font-bold ${
                privacyMode === 'hide-all' ? 'text-[#1E1E1E]' : 'text-white'
              }`}>
                {formatAmount(todaysBudget, privacyMode === 'hide-all' ? 'hide-all' : privacyMode)}
              </span>
            </div>
          </div>

          {/* Monthly Remaining */}
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl flex items-center justify-center ${
              privacyMode === 'hide-all' ? 'bg-[#F7F9F7] text-[#757575]' : 'bg-white/10 text-white'
            }`}>
              <Coins className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className={`text-xxs font-semibold tracking-wider ${
                privacyMode === 'hide-all' ? 'text-[#757575]' : 'text-white/70'
              }`}>MONTHLY REMAINING</span>
              <span className={`text-sm font-bold ${
                privacyMode === 'hide-all' ? 'text-[#1E1E1E]' : 'text-white'
              }`}>
                {formatAmount(monthlyRemaining, privacyMode === 'hide-all' ? 'hide-all' : privacyMode)}
              </span>
            </div>
          </div>

          {/* Savings Portfolio */}
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl flex items-center justify-center ${
              privacyMode === 'hide-all' ? 'bg-[#F7F9F7] text-[#757575]' : 'bg-white/10 text-white'
            }`}>
              <PiggyBank className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className={`text-xxs font-semibold tracking-wider ${
                privacyMode === 'hide-all' ? 'text-[#757575]' : 'text-white/70'
              }`}>SAVINGS PORTFOLIO</span>
              <span className={`text-sm font-bold ${
                privacyMode === 'hide-all' ? 'text-[#1E1E1E]' : 'text-white'
              }`}>
                {formatAmount(savingsTotal, privacyMode === 'hide-all' ? 'hide-all' : privacyMode)}
              </span>
            </div>
          </div>

          {/* Emergency Fund */}
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl flex items-center justify-center ${
              privacyMode === 'hide-all' ? 'bg-[#F7F9F7] text-[#757575]' : 'bg-white/10 text-white'
            }`}>
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className={`text-xxs font-semibold tracking-wider ${
                privacyMode === 'hide-all' ? 'text-[#757575]' : 'text-white/70'
              }`}>EMERGENCY FUND</span>
              <span className={`text-sm font-bold ${
                privacyMode === 'hide-all' ? 'text-[#1E1E1E]' : 'text-white'
              }`}>
                {formatAmount(emergencySaved, privacyMode === 'hide-all' ? 'hide-all' : privacyMode)}
              </span>
            </div>
          </div>
        </div>

        {/* Small motivational statement */}
        {privacyMode !== 'hide-all' && (
          <div className="mt-5 pt-3 border-t border-white/10 flex items-center space-x-2 text-xxs text-white/80 font-medium">
            <HeartHandshake className="w-3 h-3 text-[#AFC5B3] shrink-0" />
            <span className="italic">"Wealth does not decrease by charity." (Prophet Muhammad ﷺ)</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
