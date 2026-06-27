'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useMizanStore } from '@/store/useMizanStore';
import { ShieldCheck, HeartHandshake, Percent, CheckSquare } from 'lucide-react';

export default function FinancialHealthScore() {
  const { accounts, budgets, goals, transactions } = useMizanStore();

  // 1. Calculations for Financial Health Score
  const emergencyGoal = goals.find(g => g.category === 'Emergency');
  const emergencyScore = emergencyGoal ? Math.min(100, (emergencyGoal.saved / emergencyGoal.target) * 100) : 50;

  const incomeTx = transactions.filter(t => t.type === 'income');
  const totalIncome = incomeTx.reduce((sum, t) => sum + t.amount, 0) || 70000;
  const savingsBudget = budgets.find(b => b.category === 'Savings');
  const savingsAllocated = savingsBudget ? savingsBudget.allocated : 20000;
  const savingsRate = (savingsAllocated / totalIncome) * 100;
  const savingsScore = Math.min(100, (savingsRate / 20) * 100);

  const needsBudget = budgets.find(b => b.category === 'Needs');
  const wantsBudget = budgets.find(b => b.category === 'Wants');
  const needsSpent = needsBudget ? needsBudget.spent : 15000;
  const wantsSpent = wantsBudget ? wantsBudget.spent : 2000;
  const totalSpent = needsSpent + wantsSpent || 1;
  const needsRatio = (needsSpent / totalSpent) * 100;
  const needWantScore = needsRatio <= 60 ? 100 : Math.max(0, 100 - (needsRatio - 60) * 2.5);

  const charityTxCount = transactions.filter(t => t.type === 'sadaqah').length;
  const charityScore = Math.min(100, charityTxCount * 25);

  const withinBudgetCount = budgets.filter(b => b.spent <= b.allocated).length;
  const budgetScore = budgets.length > 0 ? (withinBudgetCount / budgets.length) * 100 : 80;

  const overallScore = Math.round(
    (emergencyScore * 0.30) +
    (savingsScore * 0.25) +
    (needWantScore * 0.20) +
    (charityScore * 0.15) +
    (budgetScore * 0.10)
  );

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  const getScoreRating = (score: number) => {
    if (score >= 85) return { label: 'Excellent', color: 'text-[#63A66F]', desc: 'Mizan is well balanced. Alhamdulillah!' };
    if (score >= 70) return { label: 'Healthy', color: 'text-[#8FAF9B]', desc: 'Good financial standing. Keep it up.' };
    if (score >= 50) return { label: 'Moderate', color: 'text-[#D5A349]', desc: 'Consider cutting wants or saving more.' };
    return { label: 'Unbalanced', color: 'text-[#D66C6C]', desc: 'Set aside funds for Emergency & Parents support.' };
  };

  const rating = getScoreRating(overallScore);

  return (
    <div className="bg-white dark:bg-[#1E221E] border border-[#ECECEC] dark:border-[#2C322E] rounded-3xl p-6 shadow-sm flex flex-col space-y-6">
      <div className="flex justify-between items-center border-b border-[#ECECEC] dark:border-[#2C322E] pb-3">
        <h3 className="text-sm font-bold text-[#607567] dark:text-[#8FAF9B] tracking-wider uppercase">FINANCIAL HEALTH</h3>
        <span className="text-xxs text-[#757575] dark:text-[#9AA09C] font-semibold">Self Assessment</span>
      </div>

      <div className="flex flex-col items-center justify-center py-2 relative">
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="72"
              cy="72"
              r={radius}
              className="stroke-[#F7F9F7] dark:stroke-[#121412]"
              strokeWidth="10"
              fill="transparent"
            />
            <motion.circle
              cx="72"
              cy="72"
              r={radius}
              className="stroke-[#8FAF9B]"
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-3xl font-black text-[#1E1E1E] dark:text-[#F7F9F7]">{overallScore}</span>
            <span className="text-xxs font-bold text-[#757575] dark:text-[#9AA09C] uppercase tracking-wider">Score</span>
          </div>
        </div>

        <div className="flex flex-col items-center text-center mt-4">
          <span className={`text-md font-bold ${rating.color}`}>{rating.label}</span>
          <span className="text-xxs text-[#757575] dark:text-[#9AA09C] font-medium mt-0.5">{rating.desc}</span>
        </div>
      </div>

      {/* Breakdown metrics */}
      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#ECECEC] dark:border-[#2C322E]">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-[#F7F9F7] dark:bg-[#121412] text-[#607567] dark:text-[#8FAF9B]">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="flex flex-col text-xxs font-medium">
            <span className="text-[#757575] dark:text-[#9AA09C]">EMERGENCY</span>
            <span className="text-[#1E1E1E] dark:text-[#F7F9F7] font-bold mt-0.5">{Math.round(emergencyScore)}% Saved</span>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-[#F7F9F7] dark:bg-[#121412] text-[#607567] dark:text-[#8FAF9B]">
            <Percent className="w-4 h-4" />
          </div>
          <div className="flex flex-col text-xxs font-medium">
            <span className="text-[#757575] dark:text-[#9AA09C]">SAVINGS RATE</span>
            <span className="text-[#1E1E1E] dark:text-[#F7F9F7] font-bold mt-0.5">{Math.round(savingsRate)}% (Goal 20%)</span>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-[#F7F9F7] dark:bg-[#121412] text-[#607567] dark:text-[#8FAF9B]">
            <HeartHandshake className="w-4 h-4" />
          </div>
          <div className="flex flex-col text-xxs font-medium">
            <span className="text-[#757575] dark:text-[#9AA09C]">CHARITY</span>
            <span className="text-[#1E1E1E] dark:text-[#F7F9F7] font-bold mt-0.5">{charityTxCount} Donations</span>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-[#F7F9F7] dark:bg-[#121412] text-[#607567] dark:text-[#8FAF9B]">
            <CheckSquare className="w-4 h-4" />
          </div>
          <div className="flex flex-col text-xxs font-medium">
            <span className="text-[#757575] dark:text-[#9AA09C]">ACCURACY</span>
            <span className="text-[#1E1E1E] dark:text-[#F7F9F7] font-bold mt-0.5">{withinBudgetCount}/{budgets.length} Targets</span>
          </div>
        </div>
      </div>
    </div>
  );
}
