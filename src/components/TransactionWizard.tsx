'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMizanStore } from '@/store/useMizanStore';
import { X, Mic, Camera, Check, Heart, ArrowDownLeft, ArrowUpRight, HeartHandshake } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TransactionWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TransactionWizard({ isOpen, onClose }: TransactionWizardProps) {
  const { accounts, addTransaction } = useMizanStore();

  const [type, setType] = useState<'expense' | 'income' | 'sadaqah'>('expense');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Journal fields
  const [isJournalMemory, setIsJournalMemory] = useState(false);
  const [journalNotes, setJournalNotes] = useState('');
  const [voiceRecorded, setVoiceRecorded] = useState(false);
  const [photoAttached, setPhotoAttached] = useState(false);

  // Category Options
  const categoriesMap = {
    expense: [
      { name: 'Food', group: 'Needs' },
      { name: 'Rent', group: 'Needs' },
      { name: 'Medical', group: 'Needs' },
      { name: 'Utilities', group: 'Needs' },
      { name: 'Transport', group: 'Needs' },
      { name: 'Education', group: 'Needs' },
      { name: 'Shopping', group: 'Wants' },
      { name: 'Coffee', group: 'Wants' },
      { name: 'Restaurants', group: 'Wants' },
      { name: 'Entertainment', group: 'Wants' },
      { name: 'Travel', group: 'Wants' },
      { name: 'Luxury', group: 'Wants' },
      { name: 'Parents', group: 'Parents' },
    ],
    income: [
      { name: 'Salary', group: 'Income' },
      { name: 'Freelance', group: 'Income' },
      { name: 'Business', group: 'Income' },
      { name: 'Bonus', group: 'Income' },
      { name: 'Gift', group: 'Income' },
      { name: 'Rental', group: 'Income' },
      { name: 'Other', group: 'Income' },
    ],
    sadaqah: [
      { name: 'Sadaqah', group: 'Islamic' },
      { name: 'Zakat', group: 'Islamic' },
      { name: 'Masjid', group: 'Islamic' },
      { name: 'Qurbani', group: 'Islamic' },
      { name: 'Community', group: 'Islamic' },
    ],
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
    if (!category) return;

    const parsedAmount = Number(amount);

    const txPayload = {
      accountId,
      type,
      amount: parsedAmount,
      category,
      date,
      notes: notes || category,
      journal: isJournalMemory || journalNotes || voiceRecorded || photoAttached
        ? {
            notes: journalNotes || notes || `Recorded ${category} transaction.`,
            isMemory: true,
            photoUrl: photoAttached ? '/icons/icon-192.png' : undefined,
            voiceUrl: voiceRecorded ? 'mock-voice.mp3' : undefined,
          }
        : undefined,
    };

    await addTransaction(txPayload);

    if (type === 'sadaqah') {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#8FAF9B', '#AFC5B3', '#63A66F', '#607567']
      });
    }

    setAmount('');
    setCategory('');
    setNotes('');
    setIsJournalMemory(false);
    setJournalNotes('');
    setVoiceRecorded(false);
    setPhotoAttached(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#1E1E1E]/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="fixed bottom-0 left-0 right-0 max-h-[92vh] overflow-y-auto bg-[#F7F9F7] dark:bg-[#121412] text-[#1E1E1E] dark:text-[#F7F9F7] rounded-t-[32px] shadow-premium-lg z-50 px-6 pt-5 pb-8 safe-bottom"
      >
        {/* Notch Handler */}
        <div className="w-12 h-1.5 bg-[#ECECEC] dark:bg-[#2C322E] rounded-full mx-auto mb-5 cursor-pointer" onClick={onClose} />

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-[#1E1E1E] dark:text-[#F7F9F7]">New Transaction</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full border border-[#ECECEC] dark:border-[#2C322E] bg-white dark:bg-[#1E221E] text-[#757575] dark:text-[#9AA09C] active:scale-95 transition-all shadow-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex flex-col space-y-5">
          {/* Type Toggles */}
          <div className="grid grid-cols-3 gap-2 bg-[#ECECEC]/50 dark:bg-[#2C322E]/40 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => { setType('expense'); setCategory(''); }}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                type === 'expense'
                  ? 'bg-white dark:bg-[#1E221E] text-[#1E1E1E] dark:text-[#F7F9F7] shadow-sm'
                  : 'text-[#757575] dark:text-[#9AA09C] hover:text-[#1E1E1E] dark:hover:text-[#F7F9F7]'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-rose-500" />
              <span>Expense</span>
            </button>
            
            <button
              type="button"
              onClick={() => { setType('income'); setCategory(''); }}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                type === 'income'
                  ? 'bg-white dark:bg-[#1E221E] text-[#1E1E1E] dark:text-[#F7F9F7] shadow-sm'
                  : 'text-[#757575] dark:text-[#9AA09C] hover:text-[#1E1E1E] dark:hover:text-[#F7F9F7]'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-500" />
              <span>Income</span>
            </button>

            <button
              type="button"
              onClick={() => { setType('sadaqah'); setCategory('Sadaqah'); }}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                type === 'sadaqah'
                  ? 'bg-[#8FAF9B] text-white shadow-sm'
                  : 'text-[#757575] dark:text-[#9AA09C] hover:text-[#1E1E1E] dark:hover:text-[#F7F9F7]'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Sadaqah</span>
            </button>
          </div>

          {/* Amount input */}
          <div className="flex flex-col bg-white dark:bg-[#1E221E] border border-[#ECECEC] dark:border-[#2C322E] rounded-2xl p-4 shadow-sm relative">
            <label className="text-xxs font-bold text-[#757575] dark:text-[#9AA09C] tracking-wider uppercase mb-1">AMOUNT</label>
            <div className="flex items-center">
              <span className="text-2xl font-bold text-[#607567] dark:text-[#8FAF9B] mr-1.5">₹</span>
              <input
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full text-2xl font-black outline-none border-none text-[#1E1E1E] dark:text-[#F7F9F7] bg-transparent"
              />
            </div>
          </div>

          {/* Account Selector */}
          <div className="flex flex-col bg-white dark:bg-[#1E221E] border border-[#ECECEC] dark:border-[#2C322E] rounded-2xl p-4 shadow-sm">
            <label className="text-xxs font-bold text-[#757575] dark:text-[#9AA09C] tracking-wider uppercase mb-2">SOURCE ACCOUNT</label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full bg-transparent outline-none text-sm font-semibold text-[#1E1E1E] dark:text-[#F7F9F7] border-none"
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id} className="dark:bg-[#1E221E]">
                  {acc.name} (Balance: ₹{acc.balance.toLocaleString('en-IN')})
                </option>
              ))}
            </select>
          </div>

          {/* Categories Selector */}
          <div className="flex flex-col">
            <label className="text-xxs font-bold text-[#757575] dark:text-[#9AA09C] tracking-wider uppercase mb-2 ml-1">CATEGORY</label>
            <div className="grid grid-cols-3 gap-2">
              {categoriesMap[type].map((catOpt) => (
                <button
                  key={catOpt.name}
                  type="button"
                  onClick={() => setCategory(catOpt.name)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                    category === catOpt.name
                      ? 'bg-[#8FAF9B]/10 border-[#8FAF9B] text-[#607567] dark:text-[#8FAF9B] scale-[1.03]'
                      : 'bg-white dark:bg-[#1E221E] border-[#ECECEC] dark:border-[#2C322E] text-[#1E1E1E] dark:text-[#F7F9F7] hover:border-[#8FAF9B]'
                  }`}
                >
                  {catOpt.name}
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col bg-white dark:bg-[#1E221E] border border-[#ECECEC] dark:border-[#2C322E] rounded-2xl p-3.5 shadow-sm">
              <label className="text-xxs font-bold text-[#757575] dark:text-[#9AA09C] tracking-wider uppercase mb-1">DATE</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-transparent outline-none text-xs font-semibold text-[#1E1E1E] dark:text-[#F7F9F7] border-none"
              />
            </div>
            <div className="flex flex-col bg-white dark:bg-[#1E221E] border border-[#ECECEC] dark:border-[#2C322E] rounded-2xl p-3.5 shadow-sm">
              <label className="text-xxs font-bold text-[#757575] dark:text-[#9AA09C] tracking-wider uppercase mb-1">NOTES</label>
              <input
                type="text"
                placeholder="Details..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-transparent outline-none text-xs font-semibold text-[#1E1E1E] dark:text-[#F7F9F7] border-none"
              />
            </div>
          </div>

          {/* Journal Section */}
          <div className="border border-[#ECECEC] dark:border-[#2C322E] rounded-2xl p-4 bg-white dark:bg-[#1E221E] shadow-sm flex flex-col">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Heart className={`w-4 h-4 ${isJournalMemory ? 'text-[#8FAF9B]' : 'text-[#757575] dark:text-[#9AA09C]'}`} />
                <span className="text-xs font-bold text-[#1E1E1E] dark:text-[#F7F9F7]">Save to Financial Journal</span>
              </div>
              <input
                type="checkbox"
                checked={isJournalMemory}
                onChange={(e) => setIsJournalMemory(e.target.checked)}
                className="w-4 h-4 rounded text-[#8FAF9B] focus:ring-[#8FAF9B] border-[#ECECEC] dark:border-[#2C322E] bg-transparent"
              />
            </div>

            {isJournalMemory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 pt-3 border-t border-[#ECECEC] dark:border-[#2C322E] flex flex-col space-y-3"
              >
                <textarea
                  placeholder="Record thoughts..."
                  value={journalNotes}
                  onChange={(e) => setJournalNotes(e.target.value)}
                  className="w-full p-3 bg-[#F7F9F7] dark:bg-[#121412] rounded-xl text-xs font-medium border border-[#ECECEC] dark:border-[#2C322E] text-[#1E1E1E] dark:text-[#F7F9F7] focus:outline-none focus:border-[#8FAF9B]"
                  rows={3}
                />

                <div className="flex items-center justify-between">
                  <span className="text-xxs text-[#757575] dark:text-[#9AA09C] font-semibold">ATTACH MEMORIES</span>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setVoiceRecorded(!voiceRecorded)}
                      className={`p-2 rounded-lg border text-xxs font-bold flex items-center space-x-1 transition-all ${
                        voiceRecorded 
                          ? 'bg-[#8FAF9B]/10 border-[#8FAF9B] text-[#607567] dark:text-[#8FAF9B]' 
                          : 'bg-white dark:bg-[#1E221E] border-[#ECECEC] dark:border-[#2C322E] text-[#757575] dark:text-[#9AA09C]'
                      }`}
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>{voiceRecorded ? 'Recorded' : 'Voice Memo'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPhotoAttached(!photoAttached)}
                      className={`p-2 rounded-lg border text-xxs font-bold flex items-center space-x-1 transition-all ${
                        photoAttached 
                          ? 'bg-[#8FAF9B]/10 border-[#8FAF9B] text-[#607567] dark:text-[#8FAF9B]' 
                          : 'bg-white dark:bg-[#1E221E] border-[#ECECEC] dark:border-[#2C322E] text-[#757575] dark:text-[#9AA09C]'
                      }`}
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{photoAttached ? 'Receipt Attached' : 'Scan Receipt'}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Action Button */}
          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-[#607567] text-white font-bold hover:bg-[#8FAF9B] active:scale-98 transition-all flex items-center justify-center space-x-2 shadow-premium"
          >
            <Check className="w-5 h-5" />
            <span>Record transaction</span>
          </button>
        </form>
      </motion.div>
    </>
  );
}
