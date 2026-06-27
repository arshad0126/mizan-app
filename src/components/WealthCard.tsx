'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useMizanStore } from '@/store/useMizanStore';
import { formatAmount } from '@/lib/utils';
import { Coins, PiggyBank, ShieldCheck, CalendarRange, HeartHandshake } from 'lucide-react';

export default function WealthCard() {
  const { accounts, budgets, goals, privacyMode } = useMizanStore();

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

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const remainingDays = Math.max(1, totalDays - today.getDate() + 1);
  const todaysBudget = Math.max(0, monthlyRemaining / remainingDays);

  const isHiddenMode = privacyMode === 'hide-all';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      className={`relative w-full overflow-hidden rounded-3xl p-6 shadow-premium transition-all duration-300 ${
        isHiddenMode
          ? 'bg-gradient-to-br from-[#ECECEC] to-[#F7F9F7] dark:from-[#2C322E] dark:to-[#121412] border border-[#ECECEC] dark:border-[#2C322E]'
          : 'bg-gradient-to-br from-[#607567] via-[#8FAF9B] to-[#AFC5B3] dark:from-[#1E221E] dark:via-[#607567] dark:to-[#8FAF9B] text-white'
      }`}
    >
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />

      <div className="flex flex-col relative z-10">
        <span className={`text-xs font-bold tracking-wider uppercase ${
          isHiddenMode ? 'text-[#757575] dark:text-[#9AA09C]' : 'text-white/80'
        }`}>
          TOTAL WEALTH (RIZQ)
        </span>
        
        <h2 className={`text-4xl font-extrabold tracking-tight mt-1 transition-all duration-300 ${
          isHiddenMode ? 'text-[#1E1E1E] dark:text-[#F7F9F7] filter blur-sm' : 'text-white'
        }`}>
          {formatAmount(totalWealth, privacyMode)}
        </h2>

        <div className={`w-full h-px my-5 ${
          isHiddenMode ? 'bg-[#ECECEC] dark:bg-[#2C322E]' : 'bg-white/20'
        }`} />

        <div className="grid grid-cols-2 gap-y-4 gap-x-2">
          {/* Today's Budget */}
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl flex items-center justify-center ${
              isHiddenMode ? 'bg-[#F7F9F7] dark:bg-[#121412] text-[#757575] dark:text-[#9AA09C]' : 'bg-white/10 text-white'
            }`}>
              <CalendarRange className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className={`text-xxs font-semibold tracking-wider ${
                isHiddenMode ? 'text-[#757575] dark:text-[#9AA09C]' : 'text-white/70'
              }`}>TODAY'S BUDGET</span>
              <span className={`text-sm font-bold ${
                isHiddenMode ? 'text-[#1E1E1E] dark:text-[#F7F9F7]' : 'text-white'
              }`}>
                {formatAmount(todaysBudget, isHiddenMode ? 'hide-all' : privacyMode)}
              </span>
            </div>
          </div>

          {/* Monthly Remaining */}
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl flex items-center justify-center ${
              isHiddenMode ? 'bg-[#F7F9F7] dark:bg-[#121412] text-[#757575] dark:text-[#9AA09C]' : 'bg-white/10 text-white'
            }`}>
              <Coins className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className={`text-xxs font-semibold tracking-wider ${
                isHiddenMode ? 'text-[#757575] dark:text-[#9AA09C]' : 'text-white/70'
              }`}>MONTHLY REMAINING</span>
              <span className={`text-sm font-bold ${
                isHiddenMode ? 'text-[#1E1E1E] dark:text-[#F7F9F7]' : 'text-white'
              }`}>
                {formatAmount(monthlyRemaining, isHiddenMode ? 'hide-all' : privacyMode)}
              </span>
            </div>
          </div>

          {/* Savings Portfolio */}
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl flex items-center justify-center ${
              isHiddenMode ? 'bg-[#F7F9F7] dark:bg-[#121412] text-[#757575] dark:text-[#9AA09C]' : 'bg-white/10 text-white'
            }`}>
              <PiggyBank className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className={`text-xxs font-semibold tracking-wider ${
                isHiddenMode ? 'text-[#757575] dark:text-[#9AA09C]' : 'text-white/70'
              }`}>SAVINGS PORTFOLIO</span>
              <span className={`text-sm font-bold ${
                isHiddenMode ? 'text-[#1E1E1E] dark:text-[#F7F9F7]' : 'text-white'
              }`}>
                {formatAmount(savingsTotal, isHiddenMode ? 'hide-all' : privacyMode)}
              </span>
            </div>
          </div>

          {/* Emergency Fund */}
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl flex items-center justify-center ${
              isHiddenMode ? 'bg-[#F7F9F7] dark:bg-[#121412] text-[#757575] dark:text-[#9AA09C]' : 'bg-white/10 text-white'
            }`}>
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className={`text-xxs font-semibold tracking-wider ${
                isHiddenMode ? 'text-[#757575] dark:text-[#9AA09C]' : 'text-white/70'
              }`}>EMERGENCY FUND</span>
              <span className={`text-sm font-bold ${
                isHiddenMode ? 'text-[#1E1E1E] dark:text-[#F7F9F7]' : 'text-white'
              }`}>
                {formatAmount(emergencySaved, isHiddenMode ? 'hide-all' : privacyMode)}
              </span>
            </div>
          </div>
        </div>

        {!isHiddenMode && (
          <div className="mt-5 pt-3 border-t border-white/10 flex items-center space-x-2 text-xxs text-white/80 font-medium">
            <HeartHandshake className="w-3 h-3 text-[#AFC5B3] shrink-0" />
            <span className="italic">"Wealth does not decrease by charity." (Prophet Muhammad ﷺ)</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
