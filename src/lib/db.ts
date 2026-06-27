// Client-side IndexedDB wrapper for Mizan
const DB_NAME = 'mizan_local_db';
const DB_VERSION = 3; // Incremented version to support subscriptions store

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
  category: string;
  date: string;
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
  category: string;
  allocated: number;
  spent: number;
}

export interface Goal {
  id: string;
  title: string;
  target: number;
  saved: number;
  category: string;
  timeline: string;
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

export interface Subscription {
  id: string;
  name: string;
  cost: number;
  icon: string;
  renewal: string;
}

export interface CustomCategory {
  name: string;
  type: 'expense' | 'income' | 'sadaqah';
}

export interface Settings {
  id: string; // 'app_settings'
  userName: string;
  userPin: string;
  isOnboarded: boolean;
  theme: 'light' | 'dark';
  customCategories?: CustomCategory[];
  autoLockDuration?: number;
}

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
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('subscriptions')) {
        db.createObjectStore('subscriptions', { keyPath: 'id' });
      }
    };
  });
}

// Populate the Database with seeded data if it is empty
export async function initSeedData(): Promise<void> {
  try {
    await getDB();
  } catch (e) {
    console.error('Failed to initialize IndexedDB:', e);
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

// Generic delete item helper
function deleteItem(storeName: string, key: string): Promise<void> {
  return getDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.delete(key);
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

export async function deleteAccount(id: string): Promise<void> {
  return deleteItem('accounts', id);
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

export async function deleteBudget(category: string): Promise<void> {
  return deleteItem('budgets', category);
}

export async function getGoals(): Promise<Goal[]> {
  return getAll<Goal>('goals');
}

export async function saveGoal(goal: Goal): Promise<void> {
  return putItem('goals', goal);
}

export async function deleteGoal(id: string): Promise<void> {
  return deleteItem('goals', id);
}

export async function getZakatRecords(): Promise<ZakatRecord[]> {
  return getAll<ZakatRecord>('zakat');
}

export async function saveZakatRecord(record: ZakatRecord): Promise<void> {
  return putItem('zakat', record);
}

export async function getSubscriptions(): Promise<Subscription[]> {
  return getAll<Subscription>('subscriptions');
}

export async function saveSubscription(sub: Subscription): Promise<void> {
  return putItem('subscriptions', sub);
}

export async function deleteSubscription(id: string): Promise<void> {
  return deleteItem('subscriptions', id);
}

export async function getSettings(): Promise<Settings | null> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction('settings', 'readonly');
      const store = tx.objectStore('settings');
      const req = store.get('app_settings');
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    } catch (e) {
      resolve(null);
    }
  });
}

export async function saveSettings(settings: Settings): Promise<void> {
  return putItem('settings', settings);
}

export function wipeDatabase(): Promise<void> {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
  return new Promise((resolve, reject) => {
    const req = indexedDB.deleteDatabase(DB_NAME);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
