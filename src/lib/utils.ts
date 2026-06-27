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

/**
 * Tabular Islamic Calendar Algorithm
 * Converts Gregorian Dates dynamically into Hijri Calendar Dates.
 */
export const getHijriDate = (gregorianDate: Date): string => {
  let y = gregorianDate.getFullYear();
  let m = gregorianDate.getMonth() + 1;
  let d = gregorianDate.getDate();

  if (m < 3) {
    y -= 1;
    m += 12;
  }

  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + b - 1524.5;

  const epoch = 1948439.5;
  const daysSinceEpoch = jd - epoch;

  // Approximate year
  const hYear = Math.floor(daysSinceEpoch / 354.367068);
  
  // Calculate remaining days
  const yearStartJd = Math.floor(hYear * 354.367068) + epoch;
  let daysInYear = jd - yearStartJd;

  const islamicMonths = [
    'Muharram', 'Safar', 'Rabi\' al-Awwal', 'Rabi\' al-Thani',
    'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Sha\'ban',
    'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
  ];

  let hMonth = 0;
  let hDay = 1;
  
  for (let i = 0; i < 12; i++) {
    const isLeap = ((11 * (hYear + 1)) % 30) < 11;
    const mLen = (i % 2 === 0) ? 30 : ((i === 11 && isLeap) ? 30 : 29);
    
    if (daysInYear <= mLen) {
      hMonth = i;
      hDay = Math.max(1, Math.ceil(daysInYear));
      break;
    }
    daysInYear -= mLen;
  }

  return `${hDay} ${islamicMonths[hMonth]} ${hYear + 1} AH`;
};
