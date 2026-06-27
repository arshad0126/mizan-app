'use client';

import React, { useEffect, useState, useRef } from 'react';
import { formatAmount } from '@/lib/utils';
import { PrivacyMode } from '@/store/useMizanStore';

interface AnimatedCounterProps {
  value: number;
  privacyMode: PrivacyMode;
  className?: string;
}

export default function AnimatedCounter({ value, privacyMode, className = '' }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);

  useEffect(() => {
    // If masked privacy mode, immediately jump to value to prevent flashing text
    if (privacyMode === 'hide-all' || privacyMode === 'hide-amounts') {
      setDisplayValue(value);
      prevValueRef.current = value;
      return;
    }

    const start = prevValueRef.current;
    const end = value;
    if (start === end) {
      setDisplayValue(end);
      return;
    }

    const duration = 750; // ms
    const startTime = performance.now();

    let animationFrameId: number;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      
      // Ease out quad formula
      const ease = progress * (2 - progress);
      const current = start + (end - start) * ease;
      
      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setDisplayValue(end);
        prevValueRef.current = end;
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [value, privacyMode]);

  return (
    <span className={className}>
      {formatAmount(displayValue, privacyMode)}
    </span>
  );
}
