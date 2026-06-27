'use client';

import React, { useEffect, useState } from 'react';
import { Eye, EyeOff, Lock, Wifi, WifiOff, Shield } from 'lucide-react';
import { useMizanStore, PrivacyMode } from '@/store/useMizanStore';
import { getHijriDate as calculateHijri } from '@/lib/utils';

export default function Header() {
  const { privacyMode, setPrivacyMode, setLocked, userName } = useMizanStore();
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

  const getGregorianDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getHijriDate = () => {
    return calculateHijri(new Date());
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
    <header className="w-full flex justify-between items-center py-4 px-6 bg-white dark:bg-[#1E221E] border-b border-[#ECECEC] dark:border-[#2C322E] sticky top-0 z-30 safe-top">
      <div className="flex flex-col">
        <span className="text-[10px] text-[#757575] dark:text-[#9AA09C] font-bold tracking-widest">ASSALAMU ALAIKUM</span>
        <h1 className="text-xl font-bold text-[#1E1E1E] dark:text-[#F7F9F7] leading-tight mt-0.5">{userName || 'Arshad'}</h1>
        <div className="flex items-center space-x-2 mt-1">
          <span className="text-xxs text-[#757575] dark:text-[#9AA09C] font-bold">{getGregorianDate()}</span>
          <span className="w-1 h-1 bg-[#ECECEC] dark:bg-[#2C322E] rounded-full"></span>
          <span className="text-xxs text-[#8FAF9B] font-bold tracking-wide">{getHijriDate()}</span>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {/* Offline Badge */}
        <div className={`p-2 rounded-full border transition-all duration-300 ${
          isOnline 
            ? 'border-[#ECECEC] dark:border-[#2C322E] text-[#8FAF9B]' 
            : 'bg-[#D66C6C]/10 border-[#D66C6C] text-[#D66C6C]'
        }`}>
          {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
        </div>

        {/* Privacy Selector */}
        <div className="relative">
          <button
            onClick={() => setShowPrivacyMenu(!showPrivacyMenu)}
            className="p-2 rounded-full border border-[#ECECEC] dark:border-[#2C322E] bg-white dark:bg-[#1E221E] text-[#1E1E1E] dark:text-[#F7F9F7] hover:bg-[#F7F9F7] dark:hover:bg-[#2C322E] active:scale-95 transition-all shadow-sm flex items-center justify-center"
          >
            {getPrivacyIcon()}
          </button>

          {showPrivacyMenu && (
            <>
              <div
                className="fixed inset-0 z-45 bg-transparent"
                onClick={() => setShowPrivacyMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#1E221E] border border-[#ECECEC] dark:border-[#2C322E] rounded-2xl shadow-xl z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-3 py-2 border-b border-[#ECECEC] dark:border-[#2C322E] mb-1">
                  <p className="text-[10px] font-bold text-[#607567] dark:text-[#8FAF9B] tracking-wider">PRIVACY MODES</p>
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
                        ? 'bg-[#8FAF9B]/10 dark:bg-[#8FAF9B]/5 text-[#607567] dark:text-[#8FAF9B]'
                        : 'hover:bg-[#F7F9F7] dark:hover:bg-[#2C322E] text-[#1E1E1E] dark:text-[#F7F9F7]'
                    }`}
                  >
                    <span className="text-sm font-semibold">{opt.label}</span>
                    <span className="text-xxs text-[#757575] dark:text-[#9AA09C] mt-0.5">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Lock App */}
        <button
          onClick={() => setLocked(true)}
          className="p-2 rounded-full border border-[#ECECEC] dark:border-[#2C322E] bg-white dark:bg-[#1E221E] text-[#1E1E1E] dark:text-[#F7F9F7] hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 active:scale-95 transition-all shadow-sm flex items-center justify-center"
        >
          <Lock className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
