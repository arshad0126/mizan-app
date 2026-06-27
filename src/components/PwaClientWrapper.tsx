'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useMizanStore } from '@/store/useMizanStore';
import { Lock, ShieldCheck, UserCheck } from 'lucide-react';
import OnboardingWizard from '@/components/OnboardingWizard';

export default function PwaClientWrapper({ children }: { children: React.ReactNode }) {
  const {
    fetchData,
    isOnboarded,
    userName,
    userPin,
    isLocked,
    setLocked,
    autoLockDuration,
    isLoading
  } = useMizanStore();

  const [pin, setPin] = useState('');
  const [faceIdScanning, setFaceIdScanning] = useState(false);
  const [showFaceIdSuccess, setShowFaceIdSuccess] = useState(false);
  const [pinError, setPinError] = useState(false);
  
  const idleTimer = useRef<NodeJS.Timeout | null>(null);

  // 1. Initial Fetch and Service Worker Registration
  useEffect(() => {
    fetchData();

    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
          (registration) => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
          },
          (err) => {
            console.log('ServiceWorker registration failed: ', err);
          }
        );
      });
    }
  }, [fetchData]);

  // 2. Auto-lock timeout handler
  const resetIdleTimer = useRef(() => {});
  resetIdleTimer.current = () => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    if (isLocked || autoLockDuration === 0 || !isOnboarded) return; // Don't lock if not onboarded yet

    idleTimer.current = setTimeout(() => {
      setLocked(true);
    }, autoLockDuration * 1000);
  };

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    const handleActivity = () => resetIdleTimer.current();

    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    if (isOnboarded) {
      resetIdleTimer.current();
    }

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [isLocked, autoLockDuration, setLocked, isOnboarded]);

  // 3. Pin Entry Actions
  const handlePinClick = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      setPinError(false);

      if (nextPin === userPin) {
        // Correct pin
        setTimeout(() => {
          setLocked(false);
          setPin('');
        }, 300);
      } else if (nextPin.length === 4) {
        // Incorrect pin
        setTimeout(() => {
          setPinError(true);
          setPin('');
        }, 300);
      }
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  // 4. Face ID Emulation (Authenticates using user details)
  const triggerFaceIdScan = () => {
    if (!isOnboarded) return;
    setFaceIdScanning(true);
    setTimeout(() => {
      setFaceIdScanning(false);
      setShowFaceIdSuccess(true);
      setTimeout(() => {
        setLocked(false);
        setShowFaceIdSuccess(false);
      }, 600);
    }, 1500);
  };

  // Initial Face ID request on lock screen mount
  useEffect(() => {
    if (isLocked && isOnboarded) {
      const timeout = setTimeout(() => {
        triggerFaceIdScan();
      }, 800);
      return () => clearTimeout(timeout);
    }
  }, [isLocked, isOnboarded]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#F7F9F7] dark:bg-[#121412] z-50">
        <div className="w-16 h-16 relative flex items-center justify-center">
          <div className="absolute w-full h-full border-4 border-[#8FAF9B] border-t-transparent rounded-full animate-spin"></div>
          <div className="w-8 h-8 bg-[#8FAF9B] rounded-full"></div>
        </div>
        <h1 className="mt-6 text-xl font-semibold text-[#607567] dark:text-[#8FAF9B] tracking-wider animate-pulse">MIZAN</h1>
        <p className="mt-2 text-xs text-[#757575] font-medium tracking-wide">AL-AMANAH • BALANCE</p>
      </div>
    );
  }

  // Force first-time onboarding screen if user has not completed setup
  if (!isOnboarded) {
    return <OnboardingWizard />;
  }

  return (
    <>
      {/* Privacy Mode Overlay */}
      <div className="fixed inset-0 bg-[#F7F9F7]/80 dark:bg-[#121412]/85 backdrop-blur-xl z-40 transition-opacity duration-300 pointer-events-none opacity-0" id="multitask-blur-shield" />

      {/* Security Lock Screen */}
      {isLocked && (
        <div className="fixed inset-0 bg-[#F7F9F7] dark:bg-[#121412] z-50 flex flex-col justify-between items-center px-8 py-16 safe-top safe-bottom">
          <div className="flex flex-col items-center mt-8">
            <div className="w-16 h-16 rounded-full bg-[#8FAF9B]/10 dark:bg-[#8FAF9B]/5 flex items-center justify-center text-[#8FAF9B] mb-4">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-semibold text-[#1E1E1E] dark:text-[#F7F9F7]">Assalamu Alaikum, {userName}</h2>
            <p className="text-xs text-[#757575] mt-1">Enter your security PIN to unlock</p>

            {/* PIN Indicators */}
            <div className="flex space-x-4 mt-8">
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className={`w-4 h-4 rounded-full border border-[#ECECEC] dark:border-[#2C322E] transition-all duration-150 ${
                    pinError
                      ? 'bg-[#D66C6C] border-[#D66C6C] scale-110 animate-bounce'
                      : index < pin.length
                      ? 'bg-[#8FAF9B] scale-110'
                      : 'bg-white dark:bg-[#1E221E]'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Biometrics Face ID Simulation Overlay */}
          {faceIdScanning && (
            <div className="absolute inset-0 bg-[#F7F9F7] dark:bg-[#121412] z-55 flex flex-col items-center justify-center">
              <div className="relative w-32 h-32 border-2 border-dashed border-[#8FAF9B] rounded-3xl flex items-center justify-center animate-pulse">
                <div className="absolute w-28 h-28 border border-[#8FAF9B]/30 rounded-2xl animate-ping animate-duration-1000"></div>
                <UserCheck className="w-16 h-16 text-[#8FAF9B] animate-bounce" />
              </div>
              <p className="mt-8 text-lg font-semibold text-[#607567] dark:text-[#8FAF9B]">Scanning Face ID...</p>
              <p className="text-xs text-[#757575] mt-1">Keep eyes on device</p>
            </div>
          )}

          {showFaceIdSuccess && (
            <div className="absolute inset-0 bg-[#F7F9F7] dark:bg-[#121412] z-55 flex flex-col items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-[#63A66F]/10 border border-[#63A66F] flex items-center justify-center">
                <ShieldCheck className="w-14 h-14 text-[#63A66F]" />
              </div>
              <p className="mt-6 text-lg font-semibold text-[#63A66F]">Face ID Verified</p>
            </div>
          )}

          {/* Numeric Pad */}
          <div className="w-full max-w-xs flex flex-col gap-4 mb-8">
            <div className="grid grid-cols-3 gap-4 justify-items-center">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  onClick={() => handlePinClick(num)}
                  className="w-16 h-16 rounded-full bg-white dark:bg-[#1E221E] border border-[#ECECEC] dark:border-[#2C322E] text-[#1E1E1E] dark:text-[#F7F9F7] text-xl font-semibold flex items-center justify-center active:bg-[#ECECEC] dark:active:bg-[#2C322E] transition-colors shadow-sm"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={triggerFaceIdScan}
                className="w-16 h-16 rounded-full bg-[#8FAF9B]/10 dark:bg-[#8FAF9B]/5 text-[#8FAF9B] flex items-center justify-center text-xs font-semibold active:bg-[#8FAF9B]/20 transition-colors shadow-sm"
              >
                Face ID
              </button>
              <button
                onClick={() => handlePinClick('0')}
                className="w-16 h-16 rounded-full bg-white dark:bg-[#1E221E] border border-[#ECECEC] dark:border-[#2C322E] text-[#1E1E1E] dark:text-[#F7F9F7] text-xl font-semibold flex items-center justify-center active:bg-[#ECECEC] dark:active:bg-[#2C322E] transition-colors shadow-sm"
              >
                0
              </button>
              <button
                onClick={handleBackspace}
                className="w-16 h-16 text-[#757575] flex items-center justify-center text-sm font-medium active:text-[#1E1E1E] dark:active:text-[#F7F9F7]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main app body */}
      <div className={isLocked ? 'blur-md pointer-events-none select-none' : ''}>
        {children}
      </div>
    </>
  );
}
