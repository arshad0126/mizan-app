'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMizanStore } from '@/store/useMizanStore';
import AnimatedCounter from '@/components/AnimatedCounter';
import { formatAmount } from '@/lib/utils';
import { CreditCard, Landmark, Wallet, Banknote, Sparkles } from 'lucide-react';

export default function AccountSwiper() {
  const { accounts, transactions, privacyMode, theme } = useMizanStore();
  const [selectedAccId, setSelectedAccId] = useState<string | null>(null);

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'salary':
        return <Landmark className="w-5 h-5" />;
      case 'savings':
        return <Banknote className="w-5 h-5" />;
      case 'upi':
        return <Sparkles className="w-5 h-5" />;
      case 'cash':
        return <Wallet className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  const selectedAccount = accounts.find(a => a.id === selectedAccId);
  const accountTx = transactions.filter(t => t.accountId === selectedAccId).slice(0, 3);
  const isHiddenMode = privacyMode === 'hide-all';

  return (
    <div className="w-full flex flex-col mt-6">
      <div className="px-6 flex justify-between items-center mb-3">
        <h3 className="text-sm font-bold text-[#607567] dark:text-[#8FAF9B] tracking-wider uppercase">MY WALLET</h3>
        <span className="text-xxs text-[#757575] dark:text-[#9AA09C] font-medium">Swipe to view</span>
      </div>

      {/* Horizontal Carousel */}
      <div className="w-full flex overflow-x-auto snap-x snap-mandatory no-scrollbar px-6 space-x-4 py-2">
        {accounts.map((acc) => {
          const isSelected = selectedAccId === acc.id;
          
          return (
            <motion.div
              key={acc.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedAccId(isSelected ? null : acc.id)}
              className={`snap-center shrink-0 w-[240px] h-[140px] rounded-3xl p-5 cursor-pointer relative overflow-hidden transition-all duration-300 flex flex-col justify-between shadow-premium snap-always ${
                isHiddenMode
                  ? 'bg-white dark:bg-[#1E221E] border border-[#ECECEC] dark:border-[#2C322E]'
                  : ''
              }`}
              style={{
                background: isHiddenMode 
                  ? undefined 
                  : `linear-gradient(135deg, ${acc.color}dd, ${acc.color})`,
                border: isSelected 
                  ? (theme === 'dark' ? '2.5px solid #8FAF9B' : '2.5px solid #1E1E1E') 
                  : '1px solid transparent',
              }}
            >
              <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />
              <div className="absolute right-8 -top-8 w-20 h-20 rounded-full bg-white/5 pointer-events-none" />

              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className={`text-xxs font-bold uppercase tracking-wider ${
                    isHiddenMode ? 'text-[#757575] dark:text-[#9AA09C]' : 'text-white/70'
                  }`}>
                    {acc.type}
                  </span>
                  <span className={`text-sm font-bold mt-0.5 leading-tight ${
                    isHiddenMode ? 'text-[#1E1E1E] dark:text-[#F7F9F7]' : 'text-white'
                  }`}>
                    {acc.name}
                  </span>
                </div>
                <div className={`p-2 rounded-xl ${
                  isHiddenMode ? 'bg-[#F7F9F7] dark:bg-[#121412] text-[#757575] dark:text-[#9AA09C]' : 'bg-white/15 text-white'
                }`}>
                  {getAccountIcon(acc.type)}
                </div>
              </div>

              <div className="flex flex-col">
                <span className={`text-xs font-semibold ${
                  isHiddenMode ? 'text-[#757575] dark:text-[#9AA09C]' : 'text-white/80'
                }`}>
                  Balance
                </span>
                <div className="flex items-baseline justify-between mt-0.5">
                  <span className={`text-xl font-black tracking-tight transition-all duration-300 ${
                    isHiddenMode ? 'text-[#1E1E1E] dark:text-[#F7F9F7] filter blur-xs' : 'text-white'
                  }`}>
                    <AnimatedCounter value={acc.balance} privacyMode={privacyMode} />
                  </span>
                  <span className={`text-xxs font-bold px-1.5 py-0.5 rounded-md ${
                    isHiddenMode
                      ? 'bg-[#F7F9F7] dark:bg-[#121412] text-[#757575] dark:text-[#9AA09C]'
                      : acc.monthlyChange >= 0
                      ? 'bg-[#63A66F]/20 text-[#63A66F]'
                      : 'bg-[#D66C6C]/25 text-[#D66C6C]'
                  }`}>
                    {acc.monthlyChange >= 0 ? '+' : ''}{acc.monthlyChange}%
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Account Details */}
      <AnimatePresence>
        {selectedAccId && selectedAccount && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-6 overflow-hidden w-full"
          >
            <div className="bg-white dark:bg-[#1E221E] border border-[#ECECEC] dark:border-[#2C322E] rounded-3xl p-5 mt-4 flex flex-col shadow-sm">
              <div className="flex justify-between items-center border-b border-[#ECECEC] dark:border-[#2C322E] pb-3 mb-3">
                <span className="text-xs font-bold text-[#607567] dark:text-[#8FAF9B] tracking-wide">ACCOUNT TRANSACTIONS</span>
                <button 
                  onClick={() => setSelectedAccId(null)}
                  className="text-xxs font-bold text-[#757575] dark:text-[#9AA09C] hover:text-[#1E1E1E] dark:hover:text-[#F7F9F7]"
                >
                  Close
                </button>
              </div>

              {accountTx.length === 0 ? (
                <p className="text-xs text-[#757575] dark:text-[#9AA09C] italic py-4 text-center">No recent transactions recorded on this account</p>
              ) : (
                <div className="flex flex-col space-y-3">
                  {accountTx.map((tx) => (
                    <div key={tx.id} className="flex justify-between items-center text-xs">
                      <div className="flex flex-col">
                        <span className="font-semibold text-[#1E1E1E] dark:text-[#F7F9F7]">{tx.notes || tx.category}</span>
                        <span className="text-xxs text-[#757575] dark:text-[#9AA09C]">{tx.date}</span>
                      </div>
                      <span className={`font-bold ${
                        tx.type === 'income' ? 'text-[#63A66F]' : 'text-[#1E1E1E] dark:text-[#F7F9F7]'
                      }`}>
                        {tx.type === 'income' ? '+' : '-'}{formatAmount(tx.amount, privacyMode)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
