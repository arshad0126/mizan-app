'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMizanStore } from '@/store/useMizanStore';
import { formatAmount } from '@/lib/utils';
import confetti from 'canvas-confetti';

// Icons
import {
  Home as HomeIcon,
  Clock,
  PieChart,
  Target,
  BookOpen,
  Plus,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Heart,
  Sparkles,
  BookmarkCheck,
  Calendar,
  Layers,
  Sparkle,
  Smile
} from 'lucide-react';

// Components
import Header from '@/components/Header';
import WealthCard from '@/components/WealthCard';
import AccountSwiper from '@/components/AccountSwiper';
import TransactionWizard from '@/components/TransactionWizard';
import PaydayWizard from '@/components/PaydayWizard';
import IslamicFinanceModule from '@/components/IslamicFinanceModule';
import FinancialHealthScore from '@/components/FinancialHealthScore';

export default function Dashboard() {
  const {
    activeTab,
    setActiveTab,
    transactions,
    budgets,
    goals,
    accounts,
    privacyMode,
    contributeToGoal
  } = useMizanStore();

  const [txWizardOpen, setTxWizardOpen] = useState(false);
  const [paydayWizardOpen, setPaydayWizardOpen] = useState(false);

  // Goal contribution state
  const [goalContributionOpen, setGoalContributionOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState('');
  const [contributionAmount, setContributionAmount] = useState('');
  const [contributionSourceAcc, setContributionSourceAcc] = useState('');

  // Expandable transaction states in Timeline
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);

  // Subscriptions mock list (Subscription Center)
  const subscriptions = [
    { name: 'iCloud Storage', cost: 75, icon: '☁️', renewal: '02 July' },
    { name: 'ChatGPT Plus', cost: 1999, icon: '🤖', renewal: '10 July' },
    { name: 'Netflix Premium', cost: 649, icon: '🎬', renewal: '18 July' },
    { name: 'Masjid Support (Recur)', cost: 500, icon: '🕌', renewal: 'Weekly' },
  ];

  const totalSubMonthly = subscriptions.reduce((sum, s) => sum + s.cost, 0);

  const getCategoryColor = (cat: string) => {
    const needCats = ['Food', 'Rent', 'Medical', 'Utilities', 'Transport', 'Education'];
    const wantCats = ['Shopping', 'Coffee', 'Restaurants', 'Entertainment', 'Travel', 'Luxury'];
    const islamicCats = ['Sadaqah', 'Zakat', 'Qurbani', 'Masjid', 'Community'];
    
    if (needCats.includes(cat)) return 'bg-amber-100 text-amber-800 border-amber-200';
    if (wantCats.includes(cat)) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (islamicCats.includes(cat)) return 'bg-[#8FAF9B]/20 text-[#607567] border-[#8FAF9B]/30';
    if (cat === 'Parents') return 'bg-rose-100 text-rose-800 border-rose-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="w-full min-h-screen flex flex-col pb-24">
      {/* Universal Header */}
      <Header />

      {/* View Switcher based on store active tab state */}
      <main className="flex-grow px-6 py-6 max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex flex-col space-y-6"
            >
              {/* Wealth Card & Wallet account Swiper */}
              <WealthCard />

              {/* Quick Action triggers */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setTxWizardOpen(true)}
                  className="py-3 rounded-2xl bg-white border border-[#ECECEC] text-[#1E1E1E] text-xs font-bold shadow-sm active:scale-95 transition-all flex items-center justify-center space-x-2"
                >
                  <Plus className="w-4 h-4 text-[#8FAF9B]" />
                  <span>Add Transaction</span>
                </button>
                <button
                  onClick={() => setPaydayWizardOpen(true)}
                  className="py-3 rounded-2xl bg-[#607567] text-white text-xs font-bold shadow-premium active:scale-95 transition-all flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-4 h-4 text-[#AFC5B3]" />
                  <span>Payday wizard</span>
                </button>
              </div>

              <AccountSwiper />

              {/* Recent Activity summary */}
              <div className="flex flex-col space-y-3">
                <div className="flex justify-between items-center px-1">
                  <h3 className="text-sm font-bold text-[#607567] tracking-wider uppercase">TODAY'S ACTIVITY</h3>
                  <button 
                    onClick={() => setActiveTab('timeline')}
                    className="text-xxs text-[#8FAF9B] font-bold flex items-center space-x-0.5"
                  >
                    <span>View all</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {transactions.slice(0, 3).map((tx) => (
                  <div
                    key={tx.id}
                    className="bg-white border border-[#ECECEC] rounded-2xl p-4 flex justify-between items-center shadow-sm hover:border-[#8FAF9B] transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        tx.type === 'income' ? 'bg-[#63A66F]/10 text-[#63A66F]' : 'bg-[#ECECEC] text-[#1E1E1E]'
                      }`}>
                        {tx.type === 'income' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-[#1E1E1E] line-clamp-1">{tx.notes}</span>
                        <div className="flex items-center space-x-1.5 mt-0.5">
                          <span className={`text-xxs px-1.5 py-0.5 rounded border ${getCategoryColor(tx.category)}`}>
                            {tx.category}
                          </span>
                          {tx.journal?.isMemory && (
                            <span className="text-xxs font-bold text-[#8FAF9B] flex items-center">
                              <Smile className="w-2.5 h-2.5 mr-0.5 fill-current" />
                              <span>Memory</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className={`text-xs font-black ${
                      tx.type === 'income' ? 'text-[#63A66F]' : 'text-[#1E1E1E]'
                    }`}>
                      {tx.type === 'income' ? '+' : '-'}{formatAmount(tx.amount, privacyMode)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Subscriptions Card */}
              <div className="bg-white border border-[#ECECEC] rounded-3xl p-5 shadow-sm flex flex-col space-y-4">
                <div className="flex justify-between items-center border-b border-[#ECECEC] pb-3">
                  <div className="flex flex-col">
                    <span className="text-xxs text-[#757575] font-bold tracking-wider uppercase">SUBSCRIPTIONS</span>
                    <span className="text-xs text-[#1E1E1E] font-bold mt-0.5">
                      Monthly Cost: {formatAmount(totalSubMonthly, privacyMode)}
                    </span>
                  </div>
                  <span className="text-xxs text-[#757575] font-bold px-2 py-1 bg-[#F7F9F7] rounded-lg">
                    Yearly: {formatAmount(totalSubMonthly * 12, privacyMode)}
                  </span>
                </div>

                <div className="flex flex-col space-y-3">
                  {subscriptions.slice(0, 3).map((sub, i) => (
                    <div key={i} className="flex justify-between items-center text-xs font-semibold">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{sub.icon}</span>
                        <span className="text-[#1E1E1E]">{sub.name}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[#1E1E1E]">{formatAmount(sub.cost, privacyMode)}</span>
                        <span className="text-xxs text-[#757575] font-medium">{sub.renewal}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* TIMELINE SCREEN */}
          {activeTab === 'timeline' && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex flex-col space-y-5"
            >
              <div className="flex flex-col px-1">
                <span className="text-xxs text-[#757575] font-bold tracking-widest uppercase">CHRONOLOGICAL STORY</span>
                <h2 className="text-lg font-bold text-[#1E1E1E] mt-0.5">Financial journal</h2>
              </div>

              {transactions.length === 0 ? (
                <p className="text-center italic text-xs text-[#757575] py-8 bg-white border border-[#ECECEC] rounded-3xl">No transactions found. Add some transactions to begin your timeline story.</p>
              ) : (
                <div className="relative border-l border-[#ECECEC] pl-5 ml-3.5 space-y-6">
                  {transactions.map((tx) => {
                    const isExpanded = expandedTxId === tx.id;
                    const isSadaqah = tx.type === 'sadaqah';
                    
                    return (
                      <motion.div 
                        key={tx.id} 
                        layout 
                        className="relative"
                      >
                        {/* Timeline dot */}
                        <div className={`absolute -left-[27px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white transition-all shadow-sm ${
                          isSadaqah ? 'bg-[#8FAF9B]' : tx.type === 'income' ? 'bg-[#63A66F]' : 'bg-[#757575]'
                        }`} />

                        <div 
                          onClick={() => setExpandedTxId(isExpanded ? null : tx.id)}
                          className={`bg-white border rounded-2xl p-4 flex flex-col cursor-pointer hover:border-[#8FAF9B] transition-all shadow-sm ${
                            isSadaqah ? 'border-[#8FAF9B]/40 bg-[#8FAF9B]/2' : 'border-[#ECECEC]'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-[#1E1E1E] leading-tight">
                                {tx.notes}
                              </span>
                              <div className="flex items-center space-x-1.5 mt-1">
                                <span className={`text-xxs px-1.5 py-0.5 rounded border font-semibold ${getCategoryColor(tx.category)}`}>
                                  {tx.category}
                                </span>
                                <span className="text-xxs text-[#757575]">{tx.date}</span>
                              </div>
                            </div>
                            <span className={`text-xs font-black ${
                              tx.type === 'income' ? 'text-[#63A66F]' : 'text-[#1E1E1E]'
                            }`}>
                              {tx.type === 'income' ? '+' : '-'}{formatAmount(tx.amount, privacyMode)}
                            </span>
                          </div>

                          {/* Expanded Journal entry */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="border-t border-[#ECECEC] mt-3 pt-3 flex flex-col space-y-3"
                              >
                                {tx.journal ? (
                                  <div className="bg-[#F7F9F7] rounded-xl p-3 flex flex-col space-y-2 border border-[#ECECEC]">
                                    <div className="flex items-center justify-between">
                                      <span className="text-xxs font-bold text-[#607567] flex items-center space-x-1">
                                        <Heart className="w-3 h-3 text-[#8FAF9B] fill-current" />
                                        <span>Journal Memory</span>
                                      </span>
                                    </div>
                                    <p className="text-xs italic text-[#1E1E1E] font-medium leading-relaxed">
                                      "{tx.journal.notes}"
                                    </p>
                                    {tx.journal.voiceUrl && (
                                      <div className="flex items-center space-x-2 text-xxs text-[#757575] border-t border-[#ECECEC] pt-2">
                                        <span className="w-1.5 h-1.5 bg-[#8FAF9B] rounded-full animate-ping" />
                                        <span>Attached Voice Memo Note (0:14)</span>
                                      </div>
                                    )}
                                    {tx.journal.photoUrl && (
                                      <div className="text-xxs text-[#757575] flex items-center space-x-1">
                                        <span>📎 Attached Receipt scan</span>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-xxs text-[#757575] italic">No journal entries written. Tap to add journal notes next time.</p>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* BUDGET MODULE */}
          {activeTab === 'budget' && (
            <motion.div
              key="budget"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex flex-col space-y-5"
            >
              <div className="flex flex-col px-1">
                <span className="text-xxs text-[#757575] font-bold tracking-widest uppercase">ZERO-BASED ENVELOPES</span>
                <h2 className="text-lg font-bold text-[#1E1E1E] mt-0.5">Budget allocations</h2>
              </div>

              <div className="bg-white border border-[#ECECEC] rounded-3xl p-5 shadow-sm flex flex-col space-y-4">
                {budgets.map((b) => {
                  const percent = b.allocated > 0 ? (b.spent / b.allocated) * 100 : 0;
                  const isOver = b.spent > b.allocated;
                  
                  return (
                    <div key={b.category} className="flex flex-col space-y-2 border-b border-[#ECECEC] last:border-none pb-4 last:pb-0">
                      <div className="flex justify-between items-center text-xs font-bold text-[#1E1E1E]">
                        <span>{b.category}</span>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[#757575]">Spent:</span>
                          <span className={isOver ? 'text-[#D66C6C]' : 'text-[#607567]'}>
                            {formatAmount(b.spent, privacyMode)}
                          </span>
                          <span className="text-[#757575] font-medium">/ {formatAmount(b.allocated, privacyMode)}</span>
                        </div>
                      </div>

                      {/* Progression bar */}
                      <div className="w-full h-2 bg-[#F7F9F7] rounded-full overflow-hidden border border-[#ECECEC]">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            isOver ? 'bg-[#D66C6C]' : 'bg-[#8FAF9B]'
                          }`}
                          style={{ width: `${Math.min(100, percent)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Info alert */}
              <div className="p-4 bg-[#607567]/5 rounded-2xl border border-[#ECECEC] flex items-center space-x-3 text-xxs text-[#757575]">
                <span>💡 Adjust allocations at any time by triggering the Payday wizard to re-balance envelopes.</span>
              </div>
            </motion.div>
          )}

          {/* GOALS MODULE */}
          {activeTab === 'goals' && (
            <motion.div
              key="goals"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex flex-col space-y-5"
            >
              <div className="flex flex-col px-1">
                <span className="text-xxs text-[#757575] font-bold tracking-widest uppercase">INTENTIONAL PORTFOLIOS</span>
                <h2 className="text-lg font-bold text-[#1E1E1E] mt-0.5">Active goals</h2>
              </div>

              {goals.map((goal) => {
                const percent = Math.min(100, (goal.saved / goal.target) * 100);
                const remaining = Math.max(0, goal.target - goal.saved);
                
                return (
                  <div key={goal.id} className="bg-white border border-[#ECECEC] rounded-3xl p-5 shadow-sm flex flex-col space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <h3 className="text-sm font-bold text-[#1E1E1E]">{goal.title}</h3>
                        <span className="text-xxs text-[#757575] font-medium mt-0.5">Target: {goal.timeline}</span>
                      </div>
                      <span className="text-xs font-black text-[#8FAF9B]">{Math.round(percent)}%</span>
                    </div>

                    <div className="w-full h-2 bg-[#F7F9F7] rounded-full overflow-hidden border border-[#ECECEC]">
                      <div 
                        className="h-full bg-[#8FAF9B] rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <div className="flex flex-col">
                        <span className="text-xxs text-[#757575]">Saved</span>
                        <span className="font-bold text-[#1E1E1E]">{formatAmount(goal.saved, privacyMode)}</span>
                      </div>
                      
                      <div className="flex flex-col items-end">
                        <span className="text-xxs text-[#757575]">Remaining</span>
                        <span className="font-bold text-[#1E1E1E]">{formatAmount(remaining, privacyMode)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedGoalId(goal.id);
                        setGoalContributionOpen(true);
                      }}
                      className="w-full py-2.5 rounded-xl border border-[#ECECEC] text-[#607567] text-xs font-bold bg-[#F7F9F7] active:scale-97 hover:bg-white hover:border-[#8FAF9B] transition-all"
                    >
                      Allocate Contribution
                    </button>
                  </div>
                );
              })}

              {/* Goal Contribution Modal */}
              <AnimatePresence>
                {goalContributionOpen && (
                  <>
                    <div 
                      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-45"
                      onClick={() => setGoalContributionOpen(false)}
                    />
                    <motion.div
                      initial={{ y: '100%' }}
                      animate={{ y: 0 }}
                      exit={{ y: '100%' }}
                      className="fixed bottom-0 left-0 right-0 bg-[#F7F9F7] rounded-t-[32px] shadow-premium-lg z-50 p-6 safe-bottom"
                    >
                      <h3 className="text-sm font-bold text-[#1E1E1E] mb-4">Contribute to Goal</h3>
                      
                      <div className="flex flex-col space-y-4">
                        <div className="flex flex-col bg-white border border-[#ECECEC] rounded-xl p-3 shadow-sm">
                          <label className="text-xxs text-[#757575] font-bold mb-1">AMOUNT</label>
                          <input
                            type="number"
                            placeholder="Enter amount"
                            value={contributionAmount}
                            onChange={(e) => setContributionAmount(e.target.value)}
                            className="bg-transparent outline-none font-bold text-[#1E1E1E]"
                          />
                        </div>

                        <div className="flex flex-col bg-white border border-[#ECECEC] rounded-xl p-3 shadow-sm">
                          <label className="text-xxs text-[#757575] font-bold mb-1">SOURCE ACCOUNT</label>
                          <select
                            value={contributionSourceAcc}
                            onChange={(e) => setContributionSourceAcc(e.target.value)}
                            className="bg-transparent outline-none text-xs font-semibold text-[#1E1E1E]"
                          >
                            <option value="">Select Account</option>
                            {accounts.map(acc => (
                              <option key={acc.id} value={acc.id}>
                                {acc.name} (Balance: ₹{acc.balance.toLocaleString('en-IN')})
                              </option>
                            ))}
                          </select>
                        </div>

                        <button
                          onClick={async () => {
                            if (!contributionAmount || !contributionSourceAcc || !selectedGoalId) return;
                            await contributeToGoal(selectedGoalId, Number(contributionAmount), contributionSourceAcc);
                            setGoalContributionOpen(false);
                            setContributionAmount('');
                            // success celebration
                            confetti({
                              particleCount: 60,
                              spread: 50,
                              colors: ['#8FAF9B', '#607567']
                            });
                          }}
                          className="w-full py-3.5 bg-[#8FAF9B] text-white font-bold text-xs rounded-xl active:scale-95 transition-all shadow-md"
                        >
                          Confirm Transfer
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ISLAMIC TOOLS SCREEN */}
          {activeTab === 'islamic' && (
            <motion.div
              key="islamic"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
            >
              <IslamicFinanceModule />
            </motion.div>
          )}

          {/* PROFILE / FINANCIAL HEALTH SCREEN */}
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex flex-col space-y-6"
            >
              <FinancialHealthScore />

              <div className="bg-white border border-[#ECECEC] rounded-3xl p-5 shadow-sm flex flex-col space-y-4">
                <span className="text-xs font-bold text-[#607567] tracking-wider uppercase border-b border-[#ECECEC] pb-2">SETTINGS</span>
                
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-[#1E1E1E]">Biometric Face ID Lock</span>
                  <span className="text-xs text-[#8FAF9B]">Configured</span>
                </div>
                
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-[#1E1E1E]">Offline Cache sync</span>
                  <span className="text-xs text-[#63A66F] font-bold">Synchronized</span>
                </div>

                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-[#1E1E1E]">Storage engine</span>
                  <span className="text-[#757575]">IndexedDB Local</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Action Button for entry */}
      <div className="fixed bottom-20 right-6 z-30">
        <button
          onClick={() => setTxWizardOpen(true)}
          className="w-14 h-14 rounded-full bg-[#8FAF9B] hover:bg-[#607567] active:scale-95 transition-all text-white flex items-center justify-center shadow-premium-lg border border-[#AFC5B3]"
          title="Add Entry"
        >
          <Plus className="w-7 h-7" />
        </button>
      </div>

      {/* Universal Floating Tab Bar Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-[#ECECEC] py-3 px-6 z-30 flex justify-between items-center safe-bottom shadow-lg">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center space-y-1 ${
            activeTab === 'home' ? 'text-[#8FAF9B]' : 'text-[#757575] hover:text-[#1E1E1E]'
          }`}
        >
          <HomeIcon className="w-5 h-5" />
          <span className="text-[10px] font-bold">Home</span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex flex-col items-center space-y-1 ${
            activeTab === 'timeline' ? 'text-[#8FAF9B]' : 'text-[#757575] hover:text-[#1E1E1E]'
          }`}
        >
          <Clock className="w-5 h-5" />
          <span className="text-[10px] font-bold">Timeline</span>
        </button>

        <button
          onClick={() => setActiveTab('budget')}
          className={`flex flex-col items-center space-y-1 ${
            activeTab === 'budget' ? 'text-[#8FAF9B]' : 'text-[#757575] hover:text-[#1E1E1E]'
          }`}
        >
          <PieChart className="w-5 h-5" />
          <span className="text-[10px] font-bold">Budget</span>
        </button>

        <button
          onClick={() => setActiveTab('goals')}
          className={`flex flex-col items-center space-y-1 ${
            activeTab === 'goals' ? 'text-[#8FAF9B]' : 'text-[#757575] hover:text-[#1E1E1E]'
          }`}
        >
          <Target className="w-5 h-5" />
          <span className="text-[10px] font-bold">Goals</span>
        </button>

        <button
          onClick={() => setActiveTab('islamic')}
          className={`flex flex-col items-center space-y-1 ${
            activeTab === 'islamic' ? 'text-[#8FAF9B]' : 'text-[#757575] hover:text-[#1E1E1E]'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] font-bold">Islamic</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center space-y-1 ${
            activeTab === 'profile' ? 'text-[#8FAF9B]' : 'text-[#757575] hover:text-[#1E1E1E]'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px] font-bold">Health</span>
        </button>
      </nav>

      {/* Transaction sheet Bottom drawers */}
      <AnimatePresence>
        {txWizardOpen && (
          <TransactionWizard 
            isOpen={txWizardOpen} 
            onClose={() => setTxWizardOpen(false)} 
          />
        )}
      </AnimatePresence>

      {/* Payday Allocation drawer */}
      <AnimatePresence>
        {paydayWizardOpen && (
          <PaydayWizard 
            isOpen={paydayWizardOpen} 
            onClose={() => setPaydayWizardOpen(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
