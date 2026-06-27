import { PrivacyMode } from '@/store/useMizanStore';

/**
 * Formats a currency amount with respect to the user's selected privacy level.
 */
export const formatAmount = (amount: number, mode: PrivacyMode): string => {
  if (mode === 'hide-all') {
    return '••••';
  }
  if (mode === 'hide-amounts') {
    return '₹ ••••';
  }
  if (mode === 'approximate') {
    const isNegative = amount < 0;
    const absVal = Math.abs(amount);
    let approxStr = '';

    if (absVal >= 10000000) {
      approxStr = `₹${(absVal / 10000000).toFixed(1)}Cr`;
    } else if (absVal >= 100000) {
      approxStr = `₹${(absVal / 100000).toFixed(1)}L`;
    } else if (absVal >= 1000) {
      approxStr = `₹${Math.round(absVal / 1000)}K`;
    } else {
      approxStr = `₹${Math.round(absVal)}`;
    }

    return (isNegative ? '-' : '') + '~' + approxStr;
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Standard date formatting
 */
export const formatDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch (e) {
    return dateStr;
  }
};
