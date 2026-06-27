'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMizanStore } from '@/store/useMizanStore';
import { formatAmount } from '@/lib/utils';
import { BookOpen, Calculator, Calendar, Heart, ShieldAlert, Sparkles, TrendingUp, HandHelping, Landmark } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function IslamicFinanceModule() {
  const { transactions, privacyMode, addTransaction } = useMizanStore();
  const [subTab, setSubTab] = useState<'sadaqah' | 'zakat'>('sadaqah');

  // --- Zakat Calculator Form State ---
  const [gold, setGold] = useState('10'); // in grams
  const [silver, setSilver] = useState('0'); // in grams
  const [cash, setCash] = useState('45000');
  const [businessAssets, setBusinessAssets] = useState('0');
  const [investments, setInvestments] = useState('15000');
  const [debts, setDebts] = useState('5000');

  // Hardcoded rates for demo validation (standard averages)
  const GOLD_RATE = 6500; // per gram
  const SILVER_RATE = 80;  // per gram

  const totalAssets = (Number(gold) * GOLD_RATE) + 
                      (Number(silver) * SILVER_RATE) + 
                      Number(cash) + 
                      Number(businessAssets) + 
                      Number(investments);
  const netWealth = Math.max(0, totalAssets - Number(debts));

  // Nisab calculations (85g Gold, 595g Silver)
  const goldNisab = 85 * GOLD_RATE;   // ₹5,52,500
  const silverNisab = 595 * SILVER_RATE; // ₹47,600
  
  // Silver Nisab is standard for liquid assets/cash (increases charity beneficiary reach)
  const activeNisab = silverNisab;
  const isEligible = netWealth >= activeNisab;
  const zakatDue = isEligible ? netWealth * 0.025 : 0;

  // --- Sadaqah calculations ---
  const sadaqahTxs = transactions.filter(t => t.type === 'sadaqah');
  const totalSadaqah = sadaqahTxs.reduce((sum, t) => sum + t.amount, 0);

  const handlePayZakat = async () => {
    if (zakatDue <= 0) return;
    
    // Choose first account to pay from
    await addTransaction({
      accountId: 'acc-1',
      type: 'sadaqah',
      amount: zakatDue,
      category: 'Zakat',
      date: new Date().toISOString().split('T')[0],
      notes: `Zakat Payment for 1448 AH`,
      journal: {
        notes: `Paid Zakat of ₹${Math.round(zakatDue).toLocaleString('en-IN')}. Net wealth evaluated at ₹${Math.round(netWealth).toLocaleString('en-IN')}. Alhamdulillah.`,
        isMemory: true,
      }
    });

    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#8FAF9B', '#607567', '#D5A349']
    });
  };

  return (
    <div className="flex flex-col space-y-6">
      {/* Tab Selectors */}
      <div className="flex bg-[#ECECEC]/50 p-1 rounded-2xl">
        <button
          onClick={() => setSubTab('sadaqah')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
            subTab === 'sadaqah'
              ? 'bg-white text-[#1E1E1E] shadow-sm'
              : 'text-[#757575] hover:text-[#1E1E1E]'
          }`}
        >
          <HandHelping className="w-4 h-4" />
          <span>Sadaqah Tracker</span>
        </button>
        <button
          onClick={() => setSubTab('zakat')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
            subTab === 'zakat'
              ? 'bg-white text-[#1E1E1E] shadow-sm'
              : 'text-[#757575] hover:text-[#1E1E1E]'
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>Zakat Calculator</span>
        </button>
      </div>

      {subTab === 'sadaqah' ? (
        <div className="flex flex-col space-y-5">
          {/* Summary Box */}
          <div className="bg-white border border-[#ECECEC] rounded-3xl p-5 shadow-sm flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xxs font-bold text-[#757575] tracking-wider uppercase">TOTAL SADAQAH THIS MONTH</span>
              <span className="text-2xl font-black text-[#607567] mt-1">{formatAmount(totalSadaqah, privacyMode)}</span>
              <span className="text-xxs text-[#757575] mt-1">Goal: ₹5,000 / month</span>
            </div>
            <div className="w-16 h-16 rounded-full bg-[#8FAF9B]/10 flex items-center justify-center text-[#8FAF9B]">
              <Heart className="w-8 h-8 fill-current" />
            </div>
          </div>

          {/* Goal Progress Ring Sim */}
          <div className="bg-white border border-[#ECECEC] rounded-3xl p-5 shadow-sm flex flex-col space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-[#1E1E1E]">Monthly Charity Progress</span>
              <span className="font-bold text-[#607567]">{Math.round((totalSadaqah / 5000) * 100)}% achieved</span>
            </div>
            <div className="w-full h-3 bg-[#ECECEC] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#8FAF9B] rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, (totalSadaqah / 5000) * 100)}%` }}
              />
            </div>
            <p className="text-xxs text-[#757575]">
              "Sadaqah extinguishes sin as water extinguishes fire." (Tirmidhi)
            </p>
          </div>

          {/* History */}
          <div className="flex flex-col space-y-3">
            <span className="text-xs font-bold text-[#607567] tracking-wider uppercase ml-1">SADAQAH LEDGER</span>
            {sadaqahTxs.length === 0 ? (
              <div className="bg-white border border-[#ECECEC] rounded-3xl p-6 text-center text-xs italic text-[#757575]">
                No Sadaqah transactions registered yet. Use the '+' action to record.
              </div>
            ) : (
              <div className="flex flex-col space-y-2">
                {sadaqahTxs.map((t) => (
                  <div key={t.id} className="bg-white border border-[#ECECEC] rounded-2xl p-4 flex justify-between items-center shadow-sm">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-[#1E1E1E]">{t.notes}</span>
                      <span className="text-xxs text-[#757575] mt-0.5">{t.date}</span>
                    </div>
                    <span className="text-xs font-bold text-[#63A66F]">{formatAmount(t.amount, privacyMode)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        // ZAKAT CALCULATOR
        <div className="flex flex-col space-y-5">
          <div className="bg-white border border-[#ECECEC] rounded-3xl p-5 shadow-sm flex flex-col space-y-4">
            <div className="flex justify-between items-center border-b border-[#ECECEC] pb-3">
              <span className="text-xs font-bold text-[#607567] tracking-wider uppercase">ASSET VALUATIONS (1448 AH)</span>
              <span className="text-xxs font-bold text-[#757575]">Nisab threshold: ₹{activeNisab.toLocaleString('en-IN')}</span>
            </div>

            {/* Form grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col bg-[#F7F9F7] rounded-xl p-2.5">
                <label className="text-xxs font-bold text-[#757575] mb-1">GOLD (GRAMS)</label>
                <input
                  type="number"
                  value={gold}
                  onChange={(e) => setGold(e.target.value)}
                  className="bg-transparent outline-none border-none text-sm font-bold text-[#1E1E1E]"
                />
              </div>

              <div className="flex flex-col bg-[#F7F9F7] rounded-xl p-2.5">
                <label className="text-xxs font-bold text-[#757575] mb-1">SILVER (GRAMS)</label>
                <input
                  type="number"
                  value={silver}
                  onChange={(e) => setSilver(e.target.value)}
                  className="bg-transparent outline-none border-none text-sm font-bold text-[#1E1E1E]"
                />
              </div>

              <div className="flex flex-col bg-[#F7F9F7] rounded-xl p-2.5">
                <label className="text-xxs font-bold text-[#757575] mb-1">LIQUID CASH (₹)</label>
                <input
                  type="number"
                  value={cash}
                  onChange={(e) => setCash(e.target.value)}
                  className="bg-transparent outline-none border-none text-sm font-bold text-[#1E1E1E]"
                />
              </div>

              <div className="flex flex-col bg-[#F7F9F7] rounded-xl p-2.5">
                <label className="text-xxs font-bold text-[#757575] mb-1">INVESTMENTS (₹)</label>
                <input
                  type="number"
                  value={investments}
                  onChange={(e) => setInvestments(e.target.value)}
                  className="bg-transparent outline-none border-none text-sm font-bold text-[#1E1E1E]"
                />
              </div>

              <div className="flex flex-col bg-[#F7F9F7] rounded-xl p-2.5">
                <label className="text-xxs font-bold text-[#757575] mb-1">BUSINESS ASSETS (₹)</label>
                <input
                  type="number"
                  value={businessAssets}
                  onChange={(e) => setBusinessAssets(e.target.value)}
                  className="bg-transparent outline-none border-none text-sm font-bold text-[#1E1E1E]"
                />
              </div>

              <div className="flex flex-col bg-[#F7F9F7] rounded-xl p-2.5">
                <label className="text-xxs font-bold text-[#757575] mb-1">DEBTS & LIABILITIES (₹)</label>
                <input
                  type="number"
                  value={debts}
                  onChange={(e) => setDebts(e.target.value)}
                  className="bg-transparent outline-none border-none text-sm font-bold text-[#1E1E1E]"
                />
              </div>
            </div>
          </div>

          {/* Results section */}
          <div className="bg-gradient-to-br from-[#607567] to-[#8FAF9B] rounded-3xl p-5 text-white shadow-premium flex flex-col space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span className="text-xxs text-white/70 font-bold uppercase tracking-wider">NET ZAKATABLE WEALTH</span>
                <span className="text-2xl font-black mt-1">{formatAmount(netWealth, privacyMode)}</span>
              </div>
              <div className="px-2.5 py-1 bg-white/10 rounded-lg text-xxs font-bold">
                Rate: 2.5%
              </div>
            </div>

            <div className="w-full h-px bg-white/20" />

            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-xxs text-white/70 font-bold uppercase tracking-wider">ZAKAT DUE (AL-NISAB)</span>
                <span className="text-xl font-bold mt-0.5">{formatAmount(zakatDue, privacyMode)}</span>
              </div>
              {zakatDue > 0 && (
                <button
                  onClick={handlePayZakat}
                  className="px-4 py-2 bg-white text-[#607567] font-bold text-xs rounded-xl shadow-md active:scale-95 hover:bg-[#F7F9F7] transition-all"
                >
                  Fulfill Zakat
                </button>
              )}
            </div>

            {netWealth > 0 && !isEligible && (
              <div className="flex items-center space-x-2 text-xxs bg-amber-500/20 border border-amber-500/30 rounded-xl p-2.5 text-amber-200">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                <span>Net Wealth is below Silver Nisab threshold. Zakat is not mandatory, but Sadaqah is encouraged.</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
