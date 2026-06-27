// Client-side IndexedDB wrapper for Mizan
const DB_NAME = 'mizan_local_db';
const DB_VERSION = 1;

export interface Account {
  id: string;
  name: string;
  type: 'salary' | 'savings' | 'cash' | 'upi' | 'investment' | 'credit';
  balance: number;
  monthlyChange: number;
  color: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  type: 'income' | 'expense' | 'transfer' | 'sadaqah';
  amount: number;
  category: string; // e.g. "Food", "Rent", "Sadaqah", "Parents", "Salary"
  date: string; // ISO date YYYY-MM-DD
  notes: string;
  isSplit?: boolean;
  journal?: {
    notes?: string;
    photoUrl?: string;
    voiceUrl?: string;
    isMemory?: boolean;
  };
}

export interface Budget {
  category: string; // "Needs", "Parents", "Savings", "Charity", "Wants"
  allocated: number;
  spent: number;
}

export interface Goal {
  id: string;
  title: string;
  target: number;
  saved: number;
  category: string;
  timeline: string; // e.g. "October 2026"
  icon: string;
}

export interface ZakatRecord {
  id: string;
  date: string;
  goldValue: number;
  silverValue: number;
  cashValue: number;
  businessAssets: number;
  investments: number;
  debts: number;
  netWorth: number;
  zakatDue: number;
  nisabValue: number;
  isPaid: boolean;
}

const DEFAULT_ACCOUNTS: Account[] = [
  { id: 'acc-1', name: 'Salary Account', type: 'salary', balance: 45000, monthlyChange: 12.5, color: '#8FAF9B' },
  { id: 'acc-2', name: 'Savings Account', type: 'savings', balance: 15000, monthlyChange: 4.2, color: '#607567' },
  { id: 'acc-3', name: 'UPI Wallet', type: 'upi', balance: 8000, monthlyChange: -2.1, color: '#AFC5B3' },
  { id: 'acc-4', name: 'Cash', type: 'cash', balance: 2000, monthlyChange: -1.5, color: '#B3C8B9' },
];

const DEFAULT_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    accountId: 'acc-1',
    type: 'income',
    amount: 70000,
    category: 'Salary',
    date: '2026-06-01',
    notes: 'June Monthly Salary',
  },
  {
    id: 'tx-2',
    accountId: 'acc-1',
    type: 'expense',
    amount: 15000,
    category: 'Rent',
    date: '2026-06-02',
    notes: 'Apartment Rent',
  },
  {
    id: 'tx-3',
    accountId: 'acc-1',
    type: 'expense',
    amount: 10000,
    category: 'Parents',
    date: '2026-06-03',
    notes: 'Monthly support for Ammi and Abbu',
    journal: {
      notes: 'Transfer for household expenditures and medicines.',
      isMemory: true,
    }
  },
  {
    id: 'tx-4',
    accountId: 'acc-3',
    type: 'sadaqah',
    amount: 1000,
    category: 'Sadaqah',
    date: '2026-06-05',
    notes: 'Friday Charity to Local Masjid',
  },
  {
    id: 'tx-5',
    accountId: 'acc-3',
    type: 'expense',
    amount: 350,
    category: 'Coffee',
    date: '2026-06-12',
    notes: 'Coffee with classmates',
  },
  {
    id: 'tx-6',
    accountId: 'acc-4',
    type: 'expense',
    amount: 1500,
    category: 'Food',
    date: '2026-06-15',
    notes: 'Groceries from local market',
  },
  {
    id: 'tx-7',
    accountId: 'acc-3',
    type: 'sadaqah',
    amount: 5000,
    category: 'Sadaqah',
    date: '2026-06-20',
    notes: 'Bought Ammi a brand new phone',
    journal: {
      notes: 'Bought Ammi a phone. Her smile was priceless. Alhamdulillah.',
      isMemory: true,
    }
  }
];

const DEFAULT_BUDGETS: Budget[] = [
  { category: 'Needs', allocated: 25000, spent: 16500 },
  { category: 'Parents', allocated: 10000, spent: 10000 },
  { category: 'Savings', allocated: 20000, spent: 5000 },
  { category: 'Charity', allocated: 5000, spent: 6000 },
  { category: 'Wants', allocated: 10000, spent: 1850 },
];

const DEFAULT_GOALS: Goal[] = [
  { id: 'goal-1', title: 'Emergency Fund', target: 100000, saved: 35000, category: 'Emergency', timeline: 'October 2026', icon: 'ShieldCheck' },
  { id: 'goal-2', title: 'Hajj Portfolio', target: 400000, saved: 80000, category: 'Hajj', timeline: 'June 2028', icon: 'Milestone' },
  { id: 'goal-3', title: 'Parents Hajj/Umrah', target: 200000, saved: 60000, category: 'Umrah', timeline: 'December 2027', icon: 'Heart' },
];

let dbInstance: IDBDatabase | null = null;

function getDB(): Promise<IDBDatabase> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('IndexedDB is not available on server-side'));
  }

  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = request.result;

      // Create Object Stores
      if (!db.objectStoreNames.contains('accounts')) {
        db.createObjectStore('accounts', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('transactions')) {
        db.createObjectStore('transactions', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('budgets')) {
        db.createObjectStore('budgets', { keyPath: 'category' });
      }
      if (!db.objectStoreNames.contains('goals')) {
        db.createObjectStore('goals', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('zakat')) {
        db.createObjectStore('zakat', { keyPath: 'id' });
      }
    };
  });
}

// Populate the Database with seeded data if it is empty
export async function initSeedData(): Promise<void> {
  try {
    const db = await getDB();
    
    const checkEmpty = (storeName: string): Promise<boolean> => {
      return new Promise((resolve) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const countReq = store.count();
        countReq.onsuccess = () => resolve(countReq.result === 0);
        countReq.onerror = () => resolve(true);
      });
    };

    const isAccountsEmpty = await checkEmpty('accounts');
    if (isAccountsEmpty) {
      const tx = db.transaction(['accounts', 'transactions', 'budgets', 'goals'], 'readwrite');
      
      DEFAULT_ACCOUNTS.forEach(acc => tx.objectStore('accounts').put(acc));
      DEFAULT_TRANSACTIONS.forEach(t => tx.objectStore('transactions').put(t));
      DEFAULT_BUDGETS.forEach(b => tx.objectStore('budgets').put(b));
      DEFAULT_GOALS.forEach(g => tx.objectStore('goals').put(g));

      await new Promise<void>((resolve) => {
        tx.oncomplete = () => resolve();
      });
    }
  } catch (e) {
    console.error('Failed to seed IndexedDB:', e);
  }
}

// Generic get all items helper
function getAll<T>(storeName: string): Promise<T[]> {
  return getDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  });
}

// Generic put item helper
function putItem<T>(storeName: string, item: T): Promise<void> {
  return getDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.put(item);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => resolve();
    });
  });
}

// API methods
export async function getAccounts(): Promise<Account[]> {
  return getAll<Account>('accounts');
}

export async function saveAccount(account: Account): Promise<void> {
  return putItem('accounts', account);
}

export async function getTransactions(): Promise<Transaction[]> {
  return getAll<Transaction>('transactions');
}

export async function saveTransaction(tx: Transaction): Promise<void> {
  return putItem('transactions', tx);
}

export async function getBudgets(): Promise<Budget[]> {
  return getAll<Budget>('budgets');
}

export async function saveBudget(budget: Budget): Promise<void> {
  return putItem('budgets', budget);
}

export async function getGoals(): Promise<Goal[]> {
  return getAll<Goal>('goals');
}

export async function saveGoal(goal: Goal): Promise<void> {
  return putItem('goals', goal);
}

export async function getZakatRecords(): Promise<ZakatRecord[]> {
  return getAll<ZakatRecord>('zakat');
}

export async function saveZakatRecord(record: ZakatRecord): Promise<void> {
  return putItem('zakat', record);
}
