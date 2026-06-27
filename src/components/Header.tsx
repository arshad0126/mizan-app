'use client';

import React, { useEffect, useState } from 'react';
import { Eye, EyeOff, Lock, Wifi, WifiOff, Shield } from 'lucide-react';
import { useMizanStore, PrivacyMode } from '@/store/useMizanStore';

export default function Header() {
  const { privacyMode, setPrivacyMode, setLocked } = useMizanStore();
  const [isOnline, setIsOnline] = useState(true);
  const [showPrivacyMenu, setShowPrivacyMenu] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  // Format date: e.g. "Sunday, 28 June 2026"
  const getGregorianDate = () => {
    // Return standard formatted date matching current date context
    return 'Sunday, 28 June 2026';
  };

  const getHijriDate = () => {
    // Specifically return 3 Muharram 1448 AH as specified in the PRD for Sunday, 28 June 2026
    return '3 Muharram 1448 AH';
  };

  const privacyOptions: { value: PrivacyMode; label: string; desc: string }[] = [
    { value: 'normal', label: 'Visible', desc: 'Show all transaction values' },
    { value: 'hide-amounts', label: 'Mask Amounts', desc: 'Replace currency digits with asterisks' },
    { value: 'approximate', label: 'Approximate', desc: 'Round values (e.g. ₹5,000 → ~₹5K)' },
    { value: 'hide-all', label: 'Hide Everything', desc: 'Obscure all values, accounts and charts' },
  ];

  const getPrivacyIcon = () => {
    switch (privacyMode) {
      case 'normal':
        return <Eye className="w-4 h-4" />;
      case 'hide-amounts':
        return <EyeOff className="w-4 h-4 text-amber-500" />;
      case 'approximate':
        return <Shield className="w-4 h-4 text-emerald-500" />;
      case 'hide-all':
        return <EyeOff className="w-4 h-4 text-rose-500" />;
    }
  };

  return (
    <header className="w-full flex justify-between items-center py-4 px-6 bg-white border-b border-[#ECECEC] sticky top-0 z-30 safe-top">
      <div className="flex flex-col">
        <span className="text-xs text-[#757575] font-medium tracking-wide">ASSALAMU ALAIKUM</span>
        <h1 className="text-xl font-bold text-[#1E1E1E] leading-tight">Arshad</h1>
        <div className="flex items-center space-x-2 mt-1">
          <span className="text-xs text-[#757575] font-medium">{getGregorianDate()}</span>
          <span className="w-1 h-1 bg-[#ECECEC] rounded-full"></span>
          <span className="text-xs text-[#8FAF9B] font-semibold tracking-wide">{getHijriDate()}</span>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {/* Offline Badge */}
        <div className={`p-2 rounded-full border transition-all duration-300 ${
          isOnline ? 'border-[#ECECEC] text-[#8FAF9B]' : 'bg-[#D66C6C]/10 border-[#D66C6C] text-[#D66C6C]'
        }`}>
          {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
        </div>

        {/* Privacy Selector */}
        <div className="relative">
          <button
            onClick={() => setShowPrivacyMenu(!showPrivacyMenu)}
            className="p-2 rounded-full border border-[#ECECEC] bg-white text-[#1E1E1E] hover:bg-[#F7F9F7] active:scale-95 transition-all shadow-sm flex items-center justify-center"
            title="Privacy Settings"
          >
            {getPrivacyIcon()}
          </button>

          {showPrivacyMenu && (
            <>
              <div
                className="fixed inset-0 z-40 bg-transparent"
                onClick={() => setShowPrivacyMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-64 bg-white border border-[#ECECEC] rounded-2xl shadow-xl z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-3 py-2 border-b border-[#ECECEC] mb-1">
                  <p className="text-xs font-bold text-[#607567] tracking-wider">PRIVACY MODES</p>
                </div>
                {privacyOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setPrivacyMode(opt.value);
                      setShowPrivacyMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl flex flex-col transition-colors ${
                      privacyMode === opt.value
                        ? 'bg-[#8FAF9B]/10 text-[#607567]'
                        : 'hover:bg-[#F7F9F7] text-[#1E1E1E]'
                    }`}
                  >
                    <span className="text-sm font-semibold">{opt.label}</span>
                    <span className="text-xxs text-[#757575] mt-0.5">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Lock App */}
        <button
          onClick={() => setLocked(true)}
          className="p-2 rounded-full border border-[#ECECEC] bg-white text-[#1E1E1E] hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 active:scale-95 transition-all shadow-sm flex items-center justify-center"
          title="Lock App"
        >
          <Lock className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
