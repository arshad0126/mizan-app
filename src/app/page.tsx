'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMizanStore } from '@/store/useMizanStore';
import { formatAmount } from '@/lib/utils';
import AnimatedCounter from '@/components/AnimatedCounter';
import Header from '@/components/Header';
import WealthCard from '@/components/WealthCard';
import AccountSwiper from '@/components/AccountSwiper';
import TransactionWizard from '@/components/TransactionWizard';
import PaydayWizard from '@/components/PaydayWizard';
import IslamicFinanceModule from '@/components/IslamicFinanceModule';
import FinancialHealthScore from '@/components/FinancialHealthScore';
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
  Smile,
  Sun,
  Moon,
  Trash2,
  Lock,
  User,
  Trash,
  Info,
  Layers
} from 'lucide-react';

export default function Dashboard() {
  const {
    activeTab,
    setActiveTab,
    transactions,
    budgets,
    goals,
    accounts,
    privacyMode,
    contributeToGoal,
    theme,
    toggleTheme,
    // Dynamic settings CRUD actions
    subscriptions,
    addSubscription,
    removeSubscription,
    addAccount,
    removeAccount,
    addGoal,
    removeGoal,
    addBudgetEnvelope,
    removeBudgetEnvelope,
    updateSettings,
    resetApp,
    userName,
    userPin,
    autoLockDuration
  } = useMizanStore();

  // Dialog control states
  const [txWizardOpen, setTxWizardOpen] = useState(false);
  const [paydayWizardOpen, setPaydayWizardOpen] = useState(false);
  
  // Custom creations states
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [subModalOpen, setSubModalOpen] = useState(false);
  
  // Account Form
  const [newAccName, setNewAccName] = useState('');
  const [newAccType, setNewAccType] = useState<'salary' | 'savings' | 'upi' | 'cash' | 'investment' | 'credit'>('savings');
  const [newAccBalance, setNewAccBalance] = useState('');
  const [newAccColor, setNewAccColor] = useState('#8FAF9B');

  // Budget Form
  const [newBudgetName, setNewBudgetName] = useState('');
  const [newBudgetLimit, setNewBudgetLimit] = useState('');

  // Goal Form
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalTimeline, setNewGoalTimeline] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState('Emergency');

  // Subscription Form
  const [newSubName, setNewSubName] = useState('');
  const [newSubCost, setNewSubCost] = useState('');
  const [newSubRenewal, setNewSubRenewal] = useState('');
  const [newSubIcon, setNewSubIcon] = useState('☁️');

  // Settings Edit states
  const [editName, setEditName] = useState('');
  const [editPin, setEditPin] = useState('');
  const [editLockTimer, setEditLockTimer] = useState(60);
  const [settingsStatusMsg, setSettingsStatusMsg] = useState('');

  // Goal contribution state
  const [goalContributionOpen, setGoalContributionOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState('');
  const [contributionAmount, setContributionAmount] = useState('');
  const [contributionSourceAcc, setContributionSourceAcc] = useState('');

  // Expandable transaction states in Timeline
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);

  // Sync settings inputs when Profile loads
  useEffect(() => {
    if (activeTab === 'profile') {
      setEditName(userName || '');
      setEditPin(userPin || '');
      setEditLockTimer(autoLockDuration || 60);
      setSettingsStatusMsg('');
    }
  }, [activeTab, userName, userPin, autoLockDuration]);

  const totalSubMonthly = subscriptions.reduce((sum, s) => sum + s.cost, 0);

  const getCategoryColor = (cat: string) => {
    const needCats = ['Food', 'Rent', 'Medical', 'Utilities', 'Transport', 'Education'];
    const wantCats = ['Shopping', 'Coffee', 'Restaurants', 'Entertainment', 'Travel', 'Luxury'];
    const islamicCats = ['Sadaqah', 'Zakat', 'Qurbani', 'Masjid', 'Community'];
    
    if (needCats.includes(cat)) return 'bg-amber-100 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900/40';
    if (wantCats.includes(cat)) return 'bg-blue-100 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-900/40';
    if (islamicCats.includes(cat)) return 'bg-[#8FAF9B]/20 text-[#607567] dark:text-[#8FAF9B] border-[#8FAF9B]/30';
    if (cat === 'Parents') return 'bg-rose-100 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-900/40';
    return 'bg-gray-100 dark:bg-gray-800/45 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700/50';
  };

  return (
    <div className="w-full min-h-screen flex flex-col pb-24 bg-[#F7F9F7] dark:bg-[#121412] text-[#1E1E1E] dark:text-[#F7F9F7] transition-colors duration-300">
      {/* Universal Header */}
      <Header />

      {/* View Switcher based on store active tab state */}
      <main className="flex-grow px-6 py-6 max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          
          {/* HOME SCREEN */}
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex flex-col space-y-6"
            >
              {/* Wealth Card */}
              <WealthCard />

              {/* Quick Action triggers */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setTxWizardOpen(true)}
                  className="py-3 rounded-2xl bg-white dark:bg-[#1E221E] border border-[#ECECEC] dark:border-[#2C322E] text-[#1E1E1E] dark:text-[#F7F9F7] text-xs font-bold shadow-sm active:scale-95 transition-all flex items-center justify-center space-x-2"
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

              {/* Wallet Header & Add Account action */}
              <div className="flex justify-between items-center -mb-4">
                <div />
                <button 
                  onClick={() => setAccountModalOpen(true)}
                  className="text-xxs font-bold text-[#8FAF9B] hover:text-[#607567] flex items-center space-x-1 pr-6"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Wallet</span>
                </button>
              </div>

              <AccountSwiper />

              {/* Recent Activity summary */}
              <div className="flex flex-col space-y-3">
                <div className="flex justify-between items-center px-1">
                  <h3 className="text-sm font-bold text-[#607567] dark:text-[#8FAF9B] tracking-wider uppercase">TODAY'S ACTIVITY</h3>
                  <button 
                    onClick={() => setActiveTab('timeline')}
                    className="text-xxs text-[#8FAF9B] font-bold flex items-center space-x-0.5"
                  >
                    <span>View all</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {transactions.length === 0 ? (
                  <div className="bg-white dark:bg-[#1E221E] border border-[#ECECEC] dark:border-[#2C322E] rounded-3xl p-6 text-center text-xs italic text-[#757575] dark:text-[#9AA09C]">
                    No transactions recorded yet. Click '+' to add one.
                  </div>
                ) : (
                  transactions.slice(0, 3).map((tx) => (
                    <div
                      key={tx.id}
                      className="bg-white dark:bg-[#1E221E] border border-[#ECECEC] dark:border-[#2C322E] rounded-2xl p-4 flex justify-between items-center shadow-sm hover:border-[#8FAF9B] transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          tx.type === 'income' ? 'bg-[#63A66F]/10 text-[#63A66F]' : 'bg-[#ECECEC] dark:bg-[#2C322E] text-[#1E1E1E] dark:text-[#F7F9F7]'
                        }`}>
                          {tx.type === 'income' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-[#1E1E1E] dark:text-[#F7F9F7] line-clamp-1">{tx.notes}</span>
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
                        tx.type === 'income' ? 'text-[#63A66F]' : 'text-[#1E1E1E] dark:text-[#F7F9F7]'
                      }`}>
                        {tx.type === 'income' ? '+' : '-'}{formatAmount(tx.amount, privacyMode)}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Subscriptions Card */}
              <div className="bg-white dark:bg-[#1E221E] border border-[#ECECEC] dark:border-[#2C322E] rounded-3xl p-5 shadow-sm flex flex-col space-y-4">
                <div className="flex justify-between items-center border-b border-[#ECECEC] dark:border-[#2C322E] pb-3">
                  <div className="flex flex-col">
                    <span className="text-xxs text-[#757575] dark:text-[#9AA09C] font-bold tracking-wider uppercase">SUBSCRIPTIONS</span>
                    <span className="text-xs text-[#1E1E1E] dark:text-[#F7F9F7] font-bold mt-0.5">
                      Monthly Cost: <AnimatedCounter value={totalSubMonthly} privacyMode={privacyMode} />
                    </span>
                  </div>
                  <button 
                    onClick={() => setSubModalOpen(true)}
                    className="text-xxs text-[#8FAF9B] font-bold px-2.5 py-1.5 border border-[#8FAF9B]/20 rounded-xl hover:bg-[#8FAF9B]/5 active:scale-95 transition-all"
                  >
                    + Add Subscription
                  </button>
                </div>

                {subscriptions.length === 0 ? (
                  <p className="text-xs text-[#757575] dark:text-[#9AA09C] italic py-2 text-center">No subscriptions configured</p>
                ) : (
                  <div className="flex flex-col space-y-3.5">
                    {subscriptions.map((sub) => (
                      <div key={sub.id} className="flex justify-between items-center text-xs font-semibold group">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">{sub.icon}</span>
                          <div className="flex flex-col">
                            <span className="text-[#1E1E1E] dark:text-[#F7F9F7]">{sub.name}</span>
                            <span className="text-[10px] text-[#757575] dark:text-[#9AA09C] font-medium">{sub.renewal}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-[#1E1E1E] dark:text-[#F7F9F7]">{formatAmount(sub.cost, privacyMode)}</span>
                          <button
                            onClick={() => removeSubscription(sub.id)}
                            className="text-[#757575] hover:text-[#D66C6C] active:scale-95 transition-colors p-1"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                <span className="text-xxs text-[#757575] dark:text-[#9AA09C] font-bold tracking-widest uppercase">FINANCIAL LEDGER</span>
                <h2 className="text-lg font-bold text-[#1E1E1E] dark:text-[#F7F9F7] mt-0.5">Transactions history</h2>
              </div>

              {transactions.length === 0 ? (
                <div className="bg-white dark:bg-[#1E221E] border border-[#ECECEC] dark:border-[#2C322E] rounded-3xl p-12 text-center text-xs italic text-[#757575] dark:text-[#9AA09C]">
                  No records to display yet. Complete a Payday setup or add manual transactions to populate.
                </div>
              ) : (
                <div className="flex flex-col space-y-3">
                  {transactions.map((tx) => {
                    const isExpanded = expandedTxId === tx.id;
                    const accName = accounts.find(a => a.id === tx.accountId)?.name || 'Wallet';
                    
                    return (
                      <motion.div
                        key={tx.id}
                        layout
                        className="bg-white dark:bg-[#1E221E] border border-[#ECECEC] dark:border-[#2C322E] rounded-2xl overflow-hidden shadow-sm"
                      >
                        <div
                          onClick={() => setExpandedTxId(isExpanded ? null : tx.id)}
                          className="p-4 flex justify-between items-center cursor-pointer hover:bg-[#F7F9F7] dark:hover:bg-[#121412] transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                              tx.type === 'income' ? 'bg-[#63A66F]/10 text-[#63A66F]' : 'bg-[#ECECEC] dark:bg-[#2C322E] text-[#1E1E1E] dark:text-[#F7F9F7]'
                            }`}>
                              {tx.type === 'income' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-[#1E1E1E] dark:text-[#F7F9F7]">{tx.notes}</span>
                              <span className="text-xxs text-[#757575] dark:text-[#9AA09C] mt-0.5">{tx.date}</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded border ${getCategoryColor(tx.category)}`}>
                              {tx.category}
                            </span>
                            <span className={`text-xs font-black ${
                              tx.type === 'income' ? 'text-[#63A66F]' : 'text-[#1E1E1E] dark:text-[#F7F9F7]'
                            }`}>
                              {tx.type === 'income' ? '+' : '-'}{formatAmount(tx.amount, privacyMode)}
                            </span>
                          </div>
                        </div>

                        {/* Expandable Journal details */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="px-4 pb-4 border-t border-[#ECECEC] dark:border-[#2C322E] bg-[#F7F9F7]/40 dark:bg-[#121412]/30 pt-3"
                            >
                              <div className="grid grid-cols-2 gap-2 text-xxs font-semibold text-[#757575] dark:text-[#9AA09C] mb-3">
                                <div>
                                  <span>Account: </span>
                                  <span className="text-[#1E1E1E] dark:text-[#F7F9F7]">{accName}</span>
                                </div>
                                <div>
                                  <span>Type: </span>
                                  <span className="text-[#1E1E1E] dark:text-[#F7F9F7] uppercase">{tx.type}</span>
                                </div>
                              </div>

                              {tx.journal ? (
                                <div className="p-3 bg-white dark:bg-[#1E221E] border border-[#ECECEC] dark:border-[#2C322E] rounded-xl flex flex-col space-y-2">
                                  <span className="text-[10px] font-bold text-[#8FAF9B] tracking-wider uppercase flex items-center">
                                    <Smile className="w-3.5 h-3.5 mr-1 fill-[#8FAF9B]/20" />
                                    <span>Reflection Journal</span>
                                  </span>
                                  <p className="text-xxs italic text-[#1E1E1E] dark:text-[#F7F9F7] leading-relaxed">
                                    "{tx.journal.notes}"
                                  </p>
                                  {tx.journal.photoUrl && (
                                    <div className="text-[10px] text-[#607567] dark:text-[#8FAF9B] font-bold flex items-center bg-[#8FAF9B]/10 rounded-lg p-1.5">
                                      📸 Photo attachment verified locally
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <p className="text-xxs text-[#757575] dark:text-[#9AA09C] italic">No reflection journal notes written for this transaction.</p>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
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
              <div className="flex justify-between items-center px-1">
                <div className="flex flex-col">
                  <span className="text-xxs text-[#757575] dark:text-[#9AA09C] font-bold tracking-widest uppercase">ZERO-BASED ENVELOPES</span>
                  <h2 className="text-lg font-bold text-[#1E1E1E] dark:text-[#F7F9F7] mt-0.5">Budget allocations</h2>
                </div>
                <button 
                  onClick={() => setBudgetModalOpen(true)}
                  className="text-xxs font-bold text-[#8FAF9B] border border-[#8FAF9B]/20 rounded-xl px-2.5 py-1.5 hover:bg-[#8FAF9B]/5 active:scale-95 transition-all"
                >
                  + Add Envelope
                </button>
              </div>

              <div className="bg-white dark:bg-[#1E221E] border border-[#ECECEC] dark:border-[#2C322E] rounded-3xl p-5 shadow-sm flex flex-col space-y-4">
                {budgets.map((b) => {
                  const percent = b.allocated > 0 ? (b.spent / b.allocated) * 100 : 0;
                  const isOver = b.spent > b.allocated;
                  const isDefaultEnvelope = ['Needs', 'Wants', 'Parents', 'Savings', 'Charity'].includes(b.category);
                  
                  return (
                    <div key={b.category} className="flex flex-col space-y-2 border-b border-[#ECECEC] dark:border-[#2C322E] last:border-none pb-4 last:pb-0">
                      <div className="flex justify-between items-center text-xs font-bold text-[#1E1E1E] dark:text-[#F7F9F7]">
                        <div className="flex items-center space-x-2">
                          <span>{b.category}</span>
                          {!isDefaultEnvelope && (
                            <button
                              onClick={() => removeBudgetEnvelope(b.category)}
                              className="text-[#757575] hover:text-rose-500 transition-colors"
                              title="Delete Envelope"
                            >
                              <Trash className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {b.allocated > 0 && (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              b.allocated - b.spent >= 0 
                                ? 'bg-[#63A66F]/10 text-[#63A66F]' 
                                : 'bg-[#D66C6C]/10 text-[#D66C6C]'
                            }`}>
                              {b.allocated - b.spent >= 0 
                                ? `${formatAmount(b.allocated - b.spent, privacyMode)} left` 
                                : `-${formatAmount(b.spent - b.allocated, privacyMode)} over`}
                            </span>
                          )}
                          <span className="text-[#757575] dark:text-[#9AA09C] font-semibold">
                            {formatAmount(b.spent, privacyMode)} / {formatAmount(b.allocated, privacyMode)}
                          </span>
                        </div>
                      </div>

                      {/* Progression bar */}
                      <div className="w-full h-2 bg-[#F7F9F7] dark:bg-[#121412] rounded-full overflow-hidden border border-[#ECECEC] dark:border-[#2C322E]">
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
              <div className="p-4 bg-[#607567]/5 dark:bg-[#8FAF9B]/5 rounded-2xl border border-[#ECECEC] dark:border-[#2C322E] flex items-center space-x-3 text-xxs text-[#757575] dark:text-[#9AA09C]">
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
              <div className="flex justify-between items-center px-1">
                <div className="flex flex-col">
                  <span className="text-xxs text-[#757575] dark:text-[#9AA09C] font-bold tracking-widest uppercase">INTENTIONAL PORTFOLIOS</span>
                  <h2 className="text-lg font-bold text-[#1E1E1E] dark:text-[#F7F9F7] mt-0.5">Active goals</h2>
                </div>
                <button 
                  onClick={() => setGoalModalOpen(true)}
                  className="text-xxs font-bold text-[#8FAF9B] border border-[#8FAF9B]/20 rounded-xl px-2.5 py-1.5 hover:bg-[#8FAF9B]/5 active:scale-95 transition-all"
                >
                  + Add Goal
                </button>
              </div>

              {goals.length === 0 ? (
                <div className="bg-white dark:bg-[#1E221E] border border-[#ECECEC] dark:border-[#2C322E] rounded-3xl p-12 text-center text-xs italic text-[#757575] dark:text-[#9AA09C]">
                  No saving goals set. Tap '+ Add Goal' to configure one.
                </div>
              ) : (
                goals.map((goal) => {
                  const percent = Math.min(100, (goal.saved / goal.target) * 100);
                  const remaining = Math.max(0, goal.target - goal.saved);
                  
                  return (
                    <div key={goal.id} className="bg-white dark:bg-[#1E221E] border border-[#ECECEC] dark:border-[#2C322E] rounded-3xl p-5 shadow-sm flex flex-col space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-sm font-bold text-[#1E1E1E] dark:text-[#F7F9F7]">{goal.title}</h3>
                            <button
                              onClick={() => removeGoal(goal.id)}
                              className="text-[#757575] hover:text-rose-500 transition-colors p-1"
                              title="Delete Goal"
                            >
                              <Trash className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="text-xxs text-[#757575] dark:text-[#9AA09C] font-medium mt-0.5">Target: {goal.timeline}</span>
                        </div>
                        <span className="text-xs font-black text-[#8FAF9B]">{Math.round(percent)}%</span>
                      </div>

                      <div className="w-full h-2 bg-[#F7F9F7] dark:bg-[#121412] rounded-full overflow-hidden border border-[#ECECEC] dark:border-[#2C322E]">
                        <div 
                          className="h-full bg-[#8FAF9B] rounded-full transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <div className="flex flex-col">
                          <span className="text-xxs text-[#757575] dark:text-[#9AA09C]">Saved</span>
                          <span className="font-bold text-[#1E1E1E] dark:text-[#F7F9F7]">
                            <AnimatedCounter value={goal.saved} privacyMode={privacyMode} />
                          </span>
                        </div>
                        
                        <div className="flex flex-col items-end">
                          <span className="text-xxs text-[#757575] dark:text-[#9AA09C]">Remaining</span>
                          <span className="font-bold text-[#1E1E1E] dark:text-[#F7F9F7]">
                            <AnimatedCounter value={remaining} privacyMode={privacyMode} />
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedGoalId(goal.id);
                          setGoalContributionOpen(true);
                        }}
                        className="w-full py-2.5 rounded-xl border border-[#ECECEC] dark:border-[#2C322E] text-[#607567] dark:text-[#8FAF9B] text-xs font-bold bg-[#F7F9F7] dark:bg-[#121412] active:scale-97 hover:bg-white dark:hover:bg-[#1E221E] hover:border-[#8FAF9B] transition-all"
                      >
                        Allocate Contribution
                      </button>
                    </div>
                  );
                })
              )}

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
                      className="fixed bottom-0 left-0 right-0 bg-[#F7F9F7] dark:bg-[#1E221E] rounded-t-[32px] shadow-premium-lg z-50 p-6 safe-bottom"
                    >
                      <h3 className="text-sm font-bold text-[#1E1E1E] dark:text-[#F7F9F7] mb-4">Contribute to Goal</h3>
                      
                      <div className="flex flex-col space-y-4">
                        <div className="flex flex-col bg-white dark:bg-[#2C322E]/30 border border-[#ECECEC] dark:border-[#2C322E] rounded-xl p-3 shadow-sm">
                          <label className="text-xxs text-[#757575] dark:text-[#9AA09C] font-bold mb-1">AMOUNT</label>
                          <input
                            type="number"
                            placeholder="Enter amount"
                            value={contributionAmount}
                            onChange={(e) => setContributionAmount(e.target.value)}
                            className="bg-transparent outline-none font-bold text-[#1E1E1E] dark:text-[#F7F9F7]"
                          />
                        </div>

                        <div className="flex flex-col bg-white dark:bg-[#2C322E]/30 border border-[#ECECEC] dark:border-[#2C322E] rounded-xl p-3 shadow-sm">
                          <label className="text-xxs text-[#757575] dark:text-[#9AA09C] font-bold mb-1">SOURCE ACCOUNT</label>
                          <select
                            value={contributionSourceAcc}
                            onChange={(e) => setContributionSourceAcc(e.target.value)}
                            className="bg-transparent outline-none text-xs font-semibold text-[#1E1E1E] dark:text-[#F7F9F7]"
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

              {/* Settings Configuration form */}
              <div className="bg-white dark:bg-[#1E221E] border border-[#ECECEC] dark:border-[#2C322E] rounded-3xl p-5 shadow-sm flex flex-col space-y-4">
                <span className="text-xs font-bold text-[#607567] dark:text-[#8FAF9B] tracking-wider uppercase border-b border-[#ECECEC] dark:border-[#2C322E] pb-2">PROFILE SETTINGS</span>
                
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (!editName || !editPin) return;
                  await updateSettings(editName, editPin, Number(editLockTimer));
                  setSettingsStatusMsg('Profile settings updated successfully!');
                  setTimeout(() => setSettingsStatusMsg(''), 3000);
                }} className="flex flex-col space-y-4">
                  
                  <div className="flex flex-col bg-[#F7F9F7] dark:bg-[#121412] rounded-xl p-2.5">
                    <label className="text-[10px] text-[#757575] font-bold uppercase mb-1">USERNAME</label>
                    <input 
                      type="text" 
                      value={editName} 
                      onChange={(e) => setEditName(e.target.value)} 
                      className="bg-transparent outline-none border-none text-xs font-bold text-[#1E1E1E] dark:text-[#F7F9F7]" 
                    />
                  </div>

                  <div className="flex flex-col bg-[#F7F9F7] dark:bg-[#121412] rounded-xl p-2.5">
                    <label className="text-[10px] text-[#757575] font-bold uppercase mb-1">SECURITY PIN</label>
                    <input 
                      type="text" 
                      maxLength={4}
                      value={editPin} 
                      onChange={(e) => setEditPin(e.target.value.replace(/\D/g, ''))} 
                      className="bg-transparent outline-none border-none text-xs font-bold text-[#1E1E1E] dark:text-[#F7F9F7]" 
                    />
                  </div>

                  <div className="flex flex-col bg-[#F7F9F7] dark:bg-[#121412] rounded-xl p-2.5">
                    <label className="text-[10px] text-[#757575] font-bold uppercase mb-1">AUTO-LOCK DELAY</label>
                    <select
                      value={editLockTimer}
                      onChange={(e) => setEditLockTimer(Number(e.target.value))}
                      className="bg-transparent outline-none text-xs font-bold text-[#1E1E1E] dark:text-[#F7F9F7] border-none"
                    >
                      <option value={15}>15 Seconds</option>
                      <option value={60}>1 Minute</option>
                      <option value={300}>5 Minutes</option>
                      <option value={99999}>Never Lock</option>
                    </select>
                  </div>

                  {settingsStatusMsg && (
                    <div className="text-xxs text-[#63A66F] font-bold text-center bg-[#63A66F]/10 rounded-xl p-2.5 animate-in fade-in duration-200">
                      {settingsStatusMsg}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    className="w-full py-3 bg-[#607567] text-white text-xs font-bold rounded-xl active:scale-95 transition-all shadow-sm"
                  >
                    Save Settings
                  </button>
                </form>
              </div>

              {/* Storage & Utilities panel */}
              <div className="bg-white dark:bg-[#1E221E] border border-[#ECECEC] dark:border-[#2C322E] rounded-3xl p-5 shadow-sm flex flex-col space-y-4">
                <span className="text-xs font-bold text-[#607567] dark:text-[#8FAF9B] tracking-wider uppercase border-b border-[#ECECEC] dark:border-[#2C322E] pb-2">UTILITIES</span>
                
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-[#1E1E1E] dark:text-[#F7F9F7]">Biometric Bypass</span>
                  <span className="text-xs text-[#8FAF9B]">Configured</span>
                </div>
                
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-[#1E1E1E] dark:text-[#F7F9F7]">Cache Storage</span>
                  <span className="text-xs text-[#63A66F] font-bold">Synchronized</span>
                </div>

                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-[#1E1E1E] dark:text-[#F7F9F7]">Storage Engine</span>
                  <span className="text-[#757575] dark:text-[#9AA09C]">IndexedDB Local</span>
                </div>

                <div className="w-full h-px bg-[#ECECEC] dark:bg-[#2C322E] my-1" />

                <button
                  onClick={async () => {
                    const confirmWipe = window.confirm('Are you sure you want to delete all local data? This will wipe your settings, accounts, and transactions permanently.');
                    if (confirmWipe) {
                      await resetApp();
                    }
                  }}
                  className="w-full py-3 border border-rose-500/20 text-rose-500 hover:bg-rose-500/5 text-xs font-bold rounded-xl active:scale-95 transition-all"
                >
                  Reset Application (Wipe DB)
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-20 right-6 z-30 flex flex-col items-center gap-3">
        <button
          onClick={toggleTheme}
          className="w-12 h-12 rounded-full bg-white dark:bg-[#1E221E] hover:bg-[#F7F9F7] dark:hover:bg-[#2C322E] active:scale-95 transition-all text-[#607567] dark:text-[#8FAF9B] flex items-center justify-center shadow-premium border border-[#ECECEC] dark:border-[#2C322E]"
          title="Toggle Theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-5.5 h-5.5 text-amber-400 fill-amber-400" />
          ) : (
            <Moon className="w-5.5 h-5.5 text-[#607567]" />
          )}
        </button>

        <button
          onClick={() => setTxWizardOpen(true)}
          className="w-14 h-14 rounded-full bg-[#8FAF9B] hover:bg-[#607567] active:scale-95 transition-all text-white flex items-center justify-center shadow-premium-lg border border-[#AFC5B3]"
          title="Add Entry"
        >
          <Plus className="w-7 h-7" />
        </button>
      </div>

      {/* Universal Floating Tab Bar Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/85 dark:bg-[#1E221Ed9] backdrop-blur-xl border-t border-[#ECECEC] dark:border-[#2C322E] py-3 px-6 z-30 flex justify-between items-center safe-bottom shadow-lg">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center space-y-1 ${
            activeTab === 'home' ? 'text-[#8FAF9B]' : 'text-[#757575] dark:text-[#9AA09C] hover:text-[#1E1E1E] dark:hover:text-[#F7F9F7]'
          }`}
        >
          <HomeIcon className="w-5 h-5" />
          <span className="text-[10px] font-bold">Home</span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex flex-col items-center space-y-1 ${
            activeTab === 'timeline' ? 'text-[#8FAF9B]' : 'text-[#757575] dark:text-[#9AA09C] hover:text-[#1E1E1E] dark:hover:text-[#F7F9F7]'
          }`}
        >
          <Clock className="w-5 h-5" />
          <span className="text-[10px] font-bold">Timeline</span>
        </button>

        <button
          onClick={() => setActiveTab('budget')}
          className={`flex flex-col items-center space-y-1 ${
            activeTab === 'budget' ? 'text-[#8FAF9B]' : 'text-[#757575] dark:text-[#9AA09C] hover:text-[#1E1E1E] dark:hover:text-[#F7F9F7]'
          }`}
        >
          <PieChart className="w-5 h-5" />
          <span className="text-[10px] font-bold">Budget</span>
        </button>

        <button
          onClick={() => setActiveTab('goals')}
          className={`flex flex-col items-center space-y-1 ${
            activeTab === 'goals' ? 'text-[#8FAF9B]' : 'text-[#757575] dark:text-[#9AA09C] hover:text-[#1E1E1E] dark:hover:text-[#F7F9F7]'
          }`}
        >
          <Target className="w-5 h-5" />
          <span className="text-[10px] font-bold">Goals</span>
        </button>

        <button
          onClick={() => setActiveTab('islamic')}
          className={`flex flex-col items-center space-y-1 ${
            activeTab === 'islamic' ? 'text-[#8FAF9B]' : 'text-[#757575] dark:text-[#9AA09C] hover:text-[#1E1E1E] dark:hover:text-[#F7F9F7]'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] font-bold">Islamic</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center space-y-1 ${
            activeTab === 'profile' ? 'text-[#8FAF9B]' : 'text-[#757575] dark:text-[#9AA09C] hover:text-[#1E1E1E] dark:hover:text-[#F7F9F7]'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px] font-bold">Health</span>
        </button>
      </nav>

      {/* Transaction Entry Wizard Dialog Sheet */}
      <TransactionWizard isOpen={txWizardOpen} onClose={() => setTxWizardOpen(false)} />

      {/* Payday Wizard Dialog Sheet */}
      <PaydayWizard isOpen={paydayWizardOpen} onClose={() => setPaydayWizardOpen(false)} />

      {/* OVERLAY DIALOGS FOR CREATION FORMS */}
      
      {/* 1. Add Wallet Account Dialog */}
      <AnimatePresence>
        {accountModalOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/45 backdrop-blur-sm z-45"
              onClick={() => setAccountModalOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="fixed bottom-0 left-0 right-0 bg-[#F7F9F7] dark:bg-[#1E221E] border-t border-[#ECECEC] dark:border-[#2C322E] rounded-t-[32px] p-6 z-50 safe-bottom"
            >
              <div className="flex justify-between items-center mb-4 border-b border-[#ECECEC] dark:border-[#2C322E] pb-3">
                <h3 className="text-sm font-bold text-[#1E1E1E] dark:text-[#F7F9F7]">Create New Account</h3>
                <button 
                  onClick={() => setAccountModalOpen(false)}
                  className="text-xs font-bold text-[#757575] dark:text-[#9AA09C]"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!newAccName || !newAccBalance) return;
                const id = 'acc-' + Math.random().toString(36).substring(2, 9);
                await addAccount({
                  id,
                  name: newAccName,
                  type: newAccType,
                  balance: Number(newAccBalance),
                  monthlyChange: 0,
                  color: newAccColor
                });
                setNewAccName('');
                setNewAccBalance('');
                setAccountModalOpen(false);
                confetti({ particleCount: 30, colors: ['#8FAF9B'] });
              }} className="flex flex-col space-y-4">
                
                <div className="flex flex-col bg-white dark:bg-[#2C322E]/30 border border-[#ECECEC] dark:border-[#2C322E] rounded-xl p-3">
                  <label className="text-[10px] text-[#757575] dark:text-[#9AA09C] font-bold uppercase mb-1">Account Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Crypto Wallet" 
                    value={newAccName} 
                    onChange={(e) => setNewAccName(e.target.value)} 
                    required 
                    className="bg-transparent outline-none font-bold text-xs text-[#1E1E1E] dark:text-[#F7F9F7]" 
                  />
                </div>

                <div className="flex flex-col bg-white dark:bg-[#2C322E]/30 border border-[#ECECEC] dark:border-[#2C322E] rounded-xl p-3">
                  <label className="text-[10px] text-[#757575] dark:text-[#9AA09C] font-bold uppercase mb-1">Starting Balance (₹)</label>
                  <input 
                    type="number" 
                    placeholder="0" 
                    value={newAccBalance} 
                    onChange={(e) => setNewAccBalance(e.target.value)} 
                    required 
                    className="bg-transparent outline-none font-bold text-xs text-[#1E1E1E] dark:text-[#F7F9F7]" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col bg-white dark:bg-[#2C322E]/30 border border-[#ECECEC] dark:border-[#2C322E] rounded-xl p-3">
                    <label className="text-[10px] text-[#757575] dark:text-[#9AA09C] font-bold uppercase mb-1">Account Type</label>
                    <select 
                      value={newAccType} 
                      onChange={(e) => setNewAccType(e.target.value as any)} 
                      className="bg-transparent outline-none text-xs font-bold text-[#1E1E1E] dark:text-[#F7F9F7] border-none"
                    >
                      <option value="salary" className="dark:bg-[#1E221E]">Salary</option>
                      <option value="savings" className="dark:bg-[#1E221E]">Savings</option>
                      <option value="upi" className="dark:bg-[#1E221E]">UPI Wallet</option>
                      <option value="cash" className="dark:bg-[#1E221E]">Cash</option>
                      <option value="investment" className="dark:bg-[#1E221E]">Investment</option>
                      <option value="credit" className="dark:bg-[#1E221E]">Credit Card</option>
                    </select>
                  </div>

                  <div className="flex flex-col bg-white dark:bg-[#2C322E]/30 border border-[#ECECEC] dark:border-[#2C322E] rounded-xl p-3">
                    <label className="text-[10px] text-[#757575] dark:text-[#9AA09C] font-bold uppercase mb-1">Theme Color</label>
                    <select 
                      value={newAccColor} 
                      onChange={(e) => setNewAccColor(e.target.value)} 
                      className="bg-transparent outline-none text-xs font-bold text-[#1E1E1E] dark:text-[#F7F9F7] border-none"
                    >
                      <option value="#8FAF9B" className="dark:bg-[#1E221E]">Sage Green</option>
                      <option value="#607567" className="dark:bg-[#1E221E]">Forest Green</option>
                      <option value="#4A7C59" className="dark:bg-[#1E221E]">Emerald</option>
                      <option value="#D5A349" className="dark:bg-[#1E221E]">Amber Gold</option>
                      <option value="#1E221E" className="dark:bg-[#1E221E]">Charcoal</option>
                      <option value="#D66C6C" className="dark:bg-[#1E221E]">Coral Red</option>
                    </select>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full py-3.5 bg-[#8FAF9B] text-white font-bold text-xs rounded-xl active:scale-95 transition-all shadow-md"
                >
                  Create Wallet
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 2. Add Budget Envelope Modal */}
      <AnimatePresence>
        {budgetModalOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/45 backdrop-blur-sm z-45"
              onClick={() => setBudgetModalOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="fixed bottom-0 left-0 right-0 bg-[#F7F9F7] dark:bg-[#1E221E] border-t border-[#ECECEC] dark:border-[#2C322E] rounded-t-[32px] p-6 z-50 safe-bottom"
            >
              <div className="flex justify-between items-center mb-4 border-b border-[#ECECEC] dark:border-[#2C322E] pb-3">
                <h3 className="text-sm font-bold text-[#1E1E1E] dark:text-[#F7F9F7]">Add Custom Budget Envelope</h3>
                <button 
                  onClick={() => setBudgetModalOpen(false)}
                  className="text-xs font-bold text-[#757575] dark:text-[#9AA09C]"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!newBudgetName || !newBudgetLimit) return;
                await addBudgetEnvelope(newBudgetName.trim(), Number(newBudgetLimit));
                setNewBudgetName('');
                setNewBudgetLimit('');
                setBudgetModalOpen(false);
                confetti({ particleCount: 30, colors: ['#8FAF9B'] });
              }} className="flex flex-col space-y-4">
                
                <div className="flex flex-col bg-white dark:bg-[#2C322E]/30 border border-[#ECECEC] dark:border-[#2C322E] rounded-xl p-3">
                  <label className="text-[10px] text-[#757575] dark:text-[#9AA09C] font-bold uppercase mb-1">Envelope Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Wife Support" 
                    value={newBudgetName} 
                    onChange={(e) => setNewBudgetName(e.target.value)} 
                    required 
                    className="bg-transparent outline-none font-bold text-xs text-[#1E1E1E] dark:text-[#F7F9F7]" 
                  />
                </div>

                <div className="flex flex-col bg-white dark:bg-[#2C322E]/30 border border-[#ECECEC] dark:border-[#2C322E] rounded-xl p-3">
                  <label className="text-[10px] text-[#757575] dark:text-[#9AA09C] font-bold uppercase mb-1">Allocated Target (₹)</label>
                  <input 
                    type="number" 
                    placeholder="0" 
                    value={newBudgetLimit} 
                    onChange={(e) => setNewBudgetLimit(e.target.value)} 
                    required 
                    className="bg-transparent outline-none font-bold text-xs text-[#1E1E1E] dark:text-[#F7F9F7]" 
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full py-3.5 bg-[#8FAF9B] text-white font-bold text-xs rounded-xl active:scale-95 transition-all shadow-md"
                >
                  Create Envelope
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 3. Add Goal Modal */}
      <AnimatePresence>
        {goalModalOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/45 backdrop-blur-sm z-45"
              onClick={() => setGoalModalOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="fixed bottom-0 left-0 right-0 bg-[#F7F9F7] dark:bg-[#1E221E] border-t border-[#ECECEC] dark:border-[#2C322E] rounded-t-[32px] p-6 z-50 safe-bottom"
            >
              <div className="flex justify-between items-center mb-4 border-b border-[#ECECEC] dark:border-[#2C322E] pb-3">
                <h3 className="text-sm font-bold text-[#1E1E1E] dark:text-[#F7F9F7]">Create Custom Goal</h3>
                <button 
                  onClick={() => setGoalModalOpen(false)}
                  className="text-xs font-bold text-[#757575] dark:text-[#9AA09C]"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!newGoalTitle || !newGoalTarget || !newGoalTimeline) return;
                await addGoal({
                  title: newGoalTitle.trim(),
                  target: Number(newGoalTarget),
                  saved: 0,
                  category: newGoalCategory,
                  timeline: newGoalTimeline.trim(),
                  icon: 'Target'
                });
                setNewGoalTitle('');
                setNewGoalTarget('');
                setNewGoalTimeline('');
                setGoalModalOpen(false);
                confetti({ particleCount: 30, colors: ['#8FAF9B'] });
              }} className="flex flex-col space-y-4">
                
                <div className="flex flex-col bg-white dark:bg-[#2C322E]/30 border border-[#ECECEC] dark:border-[#2C322E] rounded-xl p-3">
                  <label className="text-[10px] text-[#757575] dark:text-[#9AA09C] font-bold uppercase mb-1">Goal Portfolio Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Umrah Trip" 
                    value={newGoalTitle} 
                    onChange={(e) => setNewGoalTitle(e.target.value)} 
                    required 
                    className="bg-transparent outline-none font-bold text-xs text-[#1E1E1E] dark:text-[#F7F9F7]" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col bg-white dark:bg-[#2C322E]/30 border border-[#ECECEC] dark:border-[#2C322E] rounded-xl p-3">
                    <label className="text-[10px] text-[#757575] dark:text-[#9AA09C] font-bold uppercase mb-1">Target Cost (₹)</label>
                    <input 
                      type="number" 
                      placeholder="400000" 
                      value={newGoalTarget} 
                      onChange={(e) => setNewGoalTarget(e.target.value)} 
                      required 
                      className="bg-transparent outline-none font-bold text-xs text-[#1E1E1E] dark:text-[#F7F9F7]" 
                    />
                  </div>
                  <div className="flex flex-col bg-white dark:bg-[#2C322E]/30 border border-[#ECECEC] dark:border-[#2C322E] rounded-xl p-3">
                    <label className="text-[10px] text-[#757575] dark:text-[#9AA09C] font-bold uppercase mb-1">Target Timeline</label>
                    <input 
                      type="text" 
                      placeholder="e.g. December 2027" 
                      value={newGoalTimeline} 
                      onChange={(e) => setNewGoalTimeline(e.target.value)} 
                      required 
                      className="bg-transparent outline-none font-bold text-xs text-[#1E1E1E] dark:text-[#F7F9F7]" 
                    />
                  </div>
                </div>

                <div className="flex flex-col bg-white dark:bg-[#2C322E]/30 border border-[#ECECEC] dark:border-[#2C322E] rounded-xl p-3">
                  <label className="text-[10px] text-[#757575] dark:text-[#9AA09C] font-bold uppercase mb-1">Category</label>
                  <select 
                    value={newGoalCategory} 
                    onChange={(e) => setNewGoalCategory(e.target.value)} 
                    className="bg-transparent outline-none text-xs font-bold text-[#1E1E1E] dark:text-[#F7F9F7] border-none"
                  >
                    <option value="Hajj" className="dark:bg-[#1E221E]">Hajj</option>
                    <option value="Umrah" className="dark:bg-[#1E221E]">Umrah</option>
                    <option value="Emergency" className="dark:bg-[#1E221E]">Emergency</option>
                    <option value="Savings" className="dark:bg-[#1E221E]">Savings</option>
                    <option value="Other" className="dark:bg-[#1E221E]">Other</option>
                  </select>
                </div>

                <button 
                  type="submit" 
                  className="w-full py-3.5 bg-[#8FAF9B] text-white font-bold text-xs rounded-xl active:scale-95 transition-all shadow-md"
                >
                  Create Goal
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 4. Add Subscription Modal */}
      <AnimatePresence>
        {subModalOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/45 backdrop-blur-sm z-45"
              onClick={() => setSubModalOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="fixed bottom-0 left-0 right-0 bg-[#F7F9F7] dark:bg-[#1E221E] border-t border-[#ECECEC] dark:border-[#2C322E] rounded-t-[32px] p-6 z-50 safe-bottom"
            >
              <div className="flex justify-between items-center mb-4 border-b border-[#ECECEC] dark:border-[#2C322E] pb-3">
                <h3 className="text-sm font-bold text-[#1E1E1E] dark:text-[#F7F9F7]">Add Subscription</h3>
                <button 
                  onClick={() => setSubModalOpen(false)}
                  className="text-xs font-bold text-[#757575] dark:text-[#9AA09C]"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!newSubName || !newSubCost || !newSubRenewal) return;
                await addSubscription({
                  name: newSubName.trim(),
                  cost: Number(newSubCost),
                  renewal: newSubRenewal.trim(),
                  icon: newSubIcon
                });
                setNewSubName('');
                setNewSubCost('');
                setNewSubRenewal('');
                setSubModalOpen(false);
                confetti({ particleCount: 30, colors: ['#8FAF9B'] });
              }} className="flex flex-col space-y-4">
                
                <div className="flex flex-col bg-white dark:bg-[#2C322E]/30 border border-[#ECECEC] dark:border-[#2C322E] rounded-xl p-3">
                  <label className="text-[10px] text-[#757575] dark:text-[#9AA09C] font-bold uppercase mb-1">Subscription Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Netflix" 
                    value={newSubName} 
                    onChange={(e) => setNewSubName(e.target.value)} 
                    required 
                    className="bg-transparent outline-none font-bold text-xs text-[#1E1E1E] dark:text-[#F7F9F7]" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col bg-white dark:bg-[#2C322E]/30 border border-[#ECECEC] dark:border-[#2C322E] rounded-xl p-3">
                    <label className="text-[10px] text-[#757575] dark:text-[#9AA09C] font-bold uppercase mb-1">Monthly Cost (₹)</label>
                    <input 
                      type="number" 
                      placeholder="199" 
                      value={newSubCost} 
                      onChange={(e) => setNewSubCost(e.target.value)} 
                      required 
                      className="bg-transparent outline-none font-bold text-xs text-[#1E1E1E] dark:text-[#F7F9F7]" 
                    />
                  </div>
                  <div className="flex flex-col bg-white dark:bg-[#2C322E]/30 border border-[#ECECEC] dark:border-[#2C322E] rounded-xl p-3">
                    <label className="text-[10px] text-[#757575] dark:text-[#9AA09C] font-bold uppercase mb-1">Renewal Cycle (e.g. 10 July)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 15 July" 
                      value={newSubRenewal} 
                      onChange={(e) => setNewSubRenewal(e.target.value)} 
                      required 
                      className="bg-transparent outline-none font-bold text-xs text-[#1E1E1E] dark:text-[#F7F9F7]" 
                    />
                  </div>
                </div>

                <div className="flex flex-col bg-white dark:bg-[#2C322E]/30 border border-[#ECECEC] dark:border-[#2C322E] rounded-xl p-3">
                  <label className="text-[10px] text-[#757575] dark:text-[#9AA09C] font-bold uppercase mb-1">Select Icon</label>
                  <select 
                    value={newSubIcon} 
                    onChange={(e) => setNewSubIcon(e.target.value)} 
                    className="bg-transparent outline-none text-xs font-bold text-[#1E1E1E] dark:text-[#F7F9F7] border-none"
                  >
                    <option value="☁️">☁️ Cloud Storage</option>
                    <option value="🤖">🤖 Bot / ChatGPT AI</option>
                    <option value="🎬">🎬 Streaming Movie</option>
                    <option value="🎵">🎵 Music Subscription</option>
                    <option value="🕌">🕌 Mosque / Islamic Charity</option>
                    <option value="💡">💡 Utility Bills</option>
                  </select>
                </div>

                <button 
                  type="submit" 
                  className="w-full py-3.5 bg-[#8FAF9B] text-white font-bold text-xs rounded-xl active:scale-95 transition-all shadow-md"
                >
                  Add Subscription
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
