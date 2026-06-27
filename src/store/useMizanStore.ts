import { create } from 'zustand';
import {
  Account,
  Transaction,
  Budget,
  Goal,
  ZakatRecord,
  Settings,
  CustomCategory,
  Subscription,
  getAccounts,
  getTransactions,
  getBudgets,
  getGoals,
  getZakatRecords,
  getSettings,
  getSubscriptions,
  saveAccount,
  saveTransaction,
  saveBudget,
  saveGoal,
  saveZakatRecord,
  saveSettings,
  saveSubscription,
  deleteAccount,
  deleteGoal,
  deleteBudget,
  deleteSubscription,
  initSeedData,
  wipeDatabase,
} from '@/lib/db';

export type PrivacyMode = 'normal' | 'hide-all' | 'hide-amounts' | 'approximate';

interface MizanState {
  // Database Tables
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  zakatRecords: ZakatRecord[];
  subscriptions: Subscription[];
  
  // Settings & User States
  isOnboarded: boolean;
  userName: string;
  userPin: string;
  theme: 'light' | 'dark';
  customCategories: CustomCategory[];
  
  // App UX States
  isLoading: boolean;
  activeTab: 'home' | 'timeline' | 'budget' | 'goals' | 'islamic' | 'profile';
  privacyMode: PrivacyMode;
  isLocked: boolean;
  autoLockDuration: number; // in seconds
  isGuestMode: boolean;
  
  // Actions
  fetchData: () => Promise<void>;
  completeOnboarding: (
    name: string,
    pin: string,
    initialAccounts: { name: string; type: Account['type']; balance: number; color: string }[]
  ) => Promise<void>;
  toggleTheme: () => Promise<void>;
  addCustomCategory: (name: string, type: 'expense' | 'income' | 'sadaqah') => Promise<void>;
  addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<void>;
  
  // CRUD Actions
  addAccount: (acc: Account) => Promise<void>;
  removeAccount: (id: string) => Promise<void>;
  
  addSubscription: (sub: Omit<Subscription, 'id'>) => Promise<void>;
  removeSubscription: (id: string) => Promise<void>;
  
  addGoal: (goal: Omit<Goal, 'id'>) => Promise<void>;
  removeGoal: (id: string) => Promise<void>;
  
  addBudgetEnvelope: (category: string, allocated: number) => Promise<void>;
  removeBudgetEnvelope: (category: string) => Promise<void>;
  
  updateBudget: (category: string, allocated: number) => Promise<void>;
  contributeToGoal: (goalId: string, amount: number, sourceAccountId: string) => Promise<void>;
  
  updateSettings: (name: string, pin: string, autoLockDuration: number) => Promise<void>;
  resetApp: () => Promise<void>;
  
  setPrivacyMode: (mode: PrivacyMode) => void;
  setActiveTab: (tab: 'home' | 'timeline' | 'budget' | 'goals' | 'islamic' | 'profile') => void;
  setLocked: (locked: boolean) => void;
  setAutoLockDuration: (duration: number) => void;
  setGuestMode: (isGuestMode: boolean) => void;
  saveZakatRecord: (record: ZakatRecord) => Promise<void>;
  allocatePaydayWizard: (incomeAmount: number, allocations: { category: string; amount: number; accountId: string }[]) => Promise<void>;
}

export const useMizanStore = create<MizanState>((set, get) => ({
  accounts: [],
  transactions: [],
  budgets: [],
  goals: [],
  zakatRecords: [],
  subscriptions: [],
  
  isOnboarded: false,
  userName: '',
  userPin: '',
  theme: 'light',
  customCategories: [],
  
  isLoading: true,
  activeTab: 'home',
  privacyMode: 'normal',
  isLocked: false,
  autoLockDuration: 60,
  isGuestMode: false,

  fetchData: async () => {
    set({ isLoading: true });
    try {
      await initSeedData();
      
      const settings = await getSettings();
      let isOnboarded = false;
      let userName = 'Guest';
      let userPin = '';
      let theme: 'light' | 'dark' = 'light';
      let customCategories: CustomCategory[] = [];
      let autoLockDuration = 60;

      if (settings) {
        isOnboarded = settings.isOnboarded;
        userName = settings.userName;
        userPin = settings.userPin;
        theme = settings.theme;
        customCategories = settings.customCategories || [];
        autoLockDuration = settings.autoLockDuration || 60;

        if (typeof document !== 'undefined') {
          if (theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      }

      const accounts = await getAccounts();
      const transactions = await getTransactions();
      const budgets = await getBudgets();
      const goals = await getGoals();
      const zakatRecords = await getZakatRecords();
      const subscriptions = await getSubscriptions();
      
      transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      const isLocked = isOnboarded && userPin !== '';

      set({
        accounts,
        transactions,
        budgets,
        goals,
        zakatRecords,
        subscriptions,
        isOnboarded,
        userName,
        userPin,
        theme,
        customCategories,
        isLocked,
        autoLockDuration,
        isLoading: false,
      });
    } catch (e) {
      console.error('Error fetching data from IndexedDB:', e);
      set({ isLoading: false });
    }
  },

  completeOnboarding: async (name, pin, initialAccounts) => {
    set({ isLoading: true });
    try {
      const currentTheme = get().theme;
      const settingsObj = {
        id: 'app_settings',
        userName: name,
        userPin: pin,
        isOnboarded: true,
        theme: currentTheme,
        autoLockDuration: 60,
        customCategories: [],
      };
      await saveSettings(settingsObj);

      const mappedAccounts: Account[] = initialAccounts.map((acc, index) => ({
        id: `acc-${index + 1}`,
        name: acc.name,
        type: acc.type,
        balance: acc.balance,
        monthlyChange: 0,
        color: acc.color,
      }));

      for (const acc of mappedAccounts) {
        await saveAccount(acc);
      }

      // Pre-seed Hajj and Emergency goals
      const defaultGoals: Goal[] = [
        { id: 'goal-1', title: 'Emergency Fund', target: 100000, saved: 0, category: 'Emergency', timeline: 'October 2026', icon: 'ShieldCheck' },
        { id: 'goal-2', title: 'Hajj Portfolio', target: 400000, saved: 0, category: 'Hajj', timeline: 'June 2028', icon: 'Milestone' },
      ];

      for (const g of defaultGoals) {
        await saveGoal(g);
      }

      // Pre-seed a starting subscription
      const defaultSubs: Subscription[] = [
        { id: 'sub-1', name: 'iCloud Storage', cost: 75, icon: '☁️', renewal: '02 July' },
        { id: 'sub-2', name: 'ChatGPT Plus', cost: 1999, icon: '🤖', renewal: '10 July' },
        { id: 'sub-3', name: 'Netflix Premium', cost: 649, icon: '🎬', renewal: '18 July' },
      ];
      for (const sub of defaultSubs) {
        await saveSubscription(sub);
      }

      const defaultBudgets: Budget[] = [
        { category: 'Needs', allocated: 0, spent: 0 },
        { category: 'Parents', allocated: 0, spent: 0 },
        { category: 'Savings', allocated: 0, spent: 0 },
        { category: 'Charity', allocated: 0, spent: 0 },
        { category: 'Wants', allocated: 0, spent: 0 },
      ];

      for (const b of defaultBudgets) {
        await saveBudget(b);
      }

      set({
        isOnboarded: true,
        userName: name,
        userPin: pin,
        accounts: mappedAccounts,
        goals: defaultGoals,
        budgets: defaultBudgets,
        subscriptions: defaultSubs,
        transactions: [],
        zakatRecords: [],
        customCategories: [],
        isLocked: false,
        isLoading: false,
      });
    } catch (e) {
      console.error('Failed to complete onboarding:', e);
      set({ isLoading: false });
    }
  },

  toggleTheme: async () => {
    const currentTheme = get().theme;
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    const settings = await getSettings();
    if (settings) {
      await saveSettings({ ...settings, theme: newTheme });
    } else {
      await saveSettings({
        id: 'app_settings',
        userName: get().userName || 'Arshad',
        userPin: get().userPin || '',
        isOnboarded: get().isOnboarded,
        theme: newTheme,
        autoLockDuration: 60,
      });
    }

    if (typeof document !== 'undefined') {
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }

    set({ theme: newTheme });
  },

  addCustomCategory: async (name, type) => {
    const settings = await getSettings();
    const currentCats = settings?.customCategories || [];
    
    if (currentCats.some(c => c.name.toLowerCase() === name.trim().toLowerCase() && c.type === type)) {
      return;
    }

    const newCat = { name: name.trim(), type };
    const updatedCats = [...currentCats, newCat];

    if (settings) {
      await saveSettings({ ...settings, customCategories: updatedCats });
    } else {
      await saveSettings({
        id: 'app_settings',
        userName: get().userName || 'Arshad',
        userPin: get().userPin || '',
        isOnboarded: get().isOnboarded,
        theme: get().theme,
        customCategories: updatedCats,
        autoLockDuration: 60,
      });
    }

    set({ customCategories: updatedCats });
  },

  updateSettings: async (name, pin, autoLockDuration) => {
    const settings = await getSettings();
    const updatedSettings = {
      id: 'app_settings',
      userName: name.trim(),
      userPin: pin.trim(),
      isOnboarded: true,
      theme: get().theme,
      customCategories: get().customCategories,
      autoLockDuration: autoLockDuration,
    };
    await saveSettings(updatedSettings);
    set({ userName: name.trim(), userPin: pin.trim(), autoLockDuration });
  },

  resetApp: async () => {
    set({ isLoading: true });
    await wipeDatabase();
    set({
      accounts: [],
      transactions: [],
      budgets: [],
      goals: [],
      zakatRecords: [],
      subscriptions: [],
      isOnboarded: false,
      userName: '',
      userPin: '',
      isLocked: false,
      activeTab: 'home',
      isLoading: false,
    });
  },

  // Account actions
  addAccount: async (acc) => {
    await saveAccount(acc);
    set({ accounts: [...get().accounts, acc] });
  },

  removeAccount: async (id) => {
    await deleteAccount(id);
    set({ accounts: get().accounts.filter(a => a.id !== id) });
  },

  // Subscription Actions
  addSubscription: async (subData) => {
    const id = 'sub-' + Math.random().toString(36).substring(2, 9);
    const newSub = { ...subData, id };
    await saveSubscription(newSub);
    set({ subscriptions: [...get().subscriptions, newSub] });
  },

  removeSubscription: async (id) => {
    await deleteSubscription(id);
    set({ subscriptions: get().subscriptions.filter(s => s.id !== id) });
  },

  // Goals actions
  addGoal: async (goalData) => {
    const id = 'goal-' + Math.random().toString(36).substring(2, 9);
    const newGoal = { ...goalData, id };
    await saveGoal(newGoal);
    set({ goals: [...get().goals, newGoal] });
  },

  removeGoal: async (id) => {
    await deleteGoal(id);
    set({ goals: get().goals.filter(g => g.id !== id) });
  },

  // Budget actions
  addBudgetEnvelope: async (category, allocated) => {
    const newBudget = { category, allocated, spent: 0 };
    await saveBudget(newBudget);
    set({ budgets: [...get().budgets, newBudget] });
  },

  removeBudgetEnvelope: async (category) => {
    await deleteBudget(category);
    set({ budgets: get().budgets.filter(b => b.category !== category) });
  },

  addTransaction: async (txData) => {
    const id = 'tx-' + Math.random().toString(36).substring(2, 9);
    const newTx: Transaction = { ...txData, id };
    
    await saveTransaction(newTx);
    
    const currentAccounts = [...get().accounts];
    const accountIndex = currentAccounts.findIndex(a => a.id === newTx.accountId);
    
    if (accountIndex > -1) {
      const acc = currentAccounts[accountIndex];
      let updatedBalance = acc.balance;
      
      if (newTx.type === 'income') {
        updatedBalance += newTx.amount;
      } else if (newTx.type === 'expense' || newTx.type === 'sadaqah') {
        updatedBalance -= newTx.amount;
      }
      
      const updatedAcc = { ...acc, balance: updatedBalance };
      currentAccounts[accountIndex] = updatedAcc;
      await saveAccount(updatedAcc);
    }
    
    const currentBudgets = [...get().budgets];
    if (newTx.type === 'expense' || newTx.type === 'sadaqah') {
      let budgetCategory = newTx.category;
      let budgetGroup = 'Wants';
      
      const needsCats = ['Food', 'Rent', 'Medical', 'Utilities', 'Transport', 'Education'];
      const wantsCats = ['Shopping', 'Coffee', 'Restaurants', 'Entertainment', 'Travel', 'Luxury'];
      const islamicCats = ['Sadaqah', 'Zakat', 'Qurbani', 'Masjid', 'Community'];
      
      if (needsCats.includes(budgetCategory)) {
        budgetGroup = 'Needs';
      } else if (budgetCategory === 'Parents') {
        budgetGroup = 'Parents';
      } else if (islamicCats.includes(budgetCategory) || budgetCategory === 'Sadaqah' || budgetCategory === 'Zakat') {
        budgetGroup = 'Charity';
      } else if (budgetCategory === 'Savings' || budgetCategory === 'Investment') {
        budgetGroup = 'Savings';
      } else {
        // Fallback for custom categories: check settings custom mapping or default to wants
        // To be smart, we can search if there's a custom mapping, or search budgets
        // Let's check if the category name itself matches a budget category directly
        const matchedBudget = currentBudgets.find(b => b.category.toLowerCase() === budgetCategory.toLowerCase());
        if (matchedBudget) {
          budgetGroup = matchedBudget.category;
        }
      }
      
      const bIndex = currentBudgets.findIndex(b => b.category === budgetGroup);
      if (bIndex > -1) {
        const budget = currentBudgets[bIndex];
        const updatedBudget = { ...budget, spent: budget.spent + newTx.amount };
        currentBudgets[bIndex] = updatedBudget;
        await saveBudget(updatedBudget);
      }
    }

    const updatedTxList = [newTx, ...get().transactions].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    set({
      transactions: updatedTxList,
      accounts: currentAccounts,
      budgets: currentBudgets,
    });
  },

  updateBudget: async (category, allocated) => {
    const currentBudgets = [...get().budgets];
    const bIndex = currentBudgets.findIndex(b => b.category === category);
    
    if (bIndex > -1) {
      const updated = { ...currentBudgets[bIndex], allocated };
      currentBudgets[bIndex] = updated;
      await saveBudget(updated);
    } else {
      const newBudget = { category, allocated, spent: 0 };
      currentBudgets.push(newBudget);
      await saveBudget(newBudget);
    }
    
    set({ budgets: currentBudgets });
  },

  contributeToGoal: async (goalId, amount, sourceAccountId) => {
    const currentAccounts = [...get().accounts];
    const accIndex = currentAccounts.findIndex(a => a.id === sourceAccountId);
    if (accIndex === -1) return;
    
    const acc = currentAccounts[accIndex];
    if (acc.balance < amount) return;
    
    const updatedAcc = { ...acc, balance: acc.balance - amount };
    currentAccounts[accIndex] = updatedAcc;
    await saveAccount(updatedAcc);
    
    const currentGoals = [...get().goals];
    const goalIndex = currentGoals.findIndex(g => g.id === goalId);
    if (goalIndex === -1) return;
    
    const goal = currentGoals[goalIndex];
    const updatedGoal = { ...goal, saved: goal.saved + amount };
    currentGoals[goalIndex] = updatedGoal;
    await saveGoal(updatedGoal);
    
    const txId = 'tx-' + Math.random().toString(36).substring(2, 9);
    const tx: Transaction = {
      id: txId,
      accountId: sourceAccountId,
      type: 'expense',
      amount: amount,
      category: 'Savings',
      date: new Date().toISOString().split('T')[0],
      notes: `Goal contribution to ${goal.title}`,
      journal: {
        notes: `Saved ₹${amount.toLocaleString('en-IN')} towards "${goal.title}". Progress: ${Math.round((updatedGoal.saved / updatedGoal.target) * 100)}%.`,
      }
    };
    await saveTransaction(tx);
    
    const currentBudgets = [...get().budgets];
    const bIndex = currentBudgets.findIndex(b => b.category === 'Savings');
    if (bIndex > -1) {
      const budget = currentBudgets[bIndex];
      const updatedBudget = { ...budget, spent: budget.spent + amount };
      currentBudgets[bIndex] = updatedBudget;
      await saveBudget(updatedBudget);
    }

    set({
      accounts: currentAccounts,
      goals: currentGoals,
      transactions: [tx, ...get().transactions],
      budgets: currentBudgets,
    });
  },

  setPrivacyMode: (privacyMode) => set({ privacyMode }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setLocked: (isLocked) => set({ isLocked }),
  setAutoLockDuration: (autoLockDuration) => set({ autoLockDuration }),
  setGuestMode: (isGuestMode) => set({ isGuestMode }),

  saveZakatRecord: async (record) => {
    await saveZakatRecord(record);
    const currentRecords = [...get().zakatRecords];
    const index = currentRecords.findIndex(r => r.id === record.id);
    if (index > -1) {
      currentRecords[index] = record;
    } else {
      currentRecords.push(record);
    }
    set({ zakatRecords: currentRecords });
  },

  allocatePaydayWizard: async (incomeAmount, allocations) => {
    const salaryAcc = get().accounts.find(a => a.type === 'salary') || get().accounts[0];
    const salaryTxId = 'tx-' + Math.random().toString(36).substring(2, 9);
    const salaryTx: Transaction = {
      id: salaryTxId,
      accountId: salaryAcc.id,
      type: 'income',
      amount: incomeAmount,
      category: 'Salary',
      date: new Date().toISOString().split('T')[0],
      notes: `Payday Wizard Allocation (₹${incomeAmount.toLocaleString('en-IN')})`,
    };
    await saveTransaction(salaryTx);
    
    const currentAccounts = [...get().accounts];
    const salIndex = currentAccounts.findIndex(a => a.id === salaryAcc.id);
    if (salIndex > -1) {
      const acc = currentAccounts[salIndex];
      const updatedAcc = { ...acc, balance: acc.balance + incomeAmount };
      currentAccounts[salIndex] = updatedAcc;
      await saveAccount(updatedAcc);
    }

    const currentBudgets = [...get().budgets];
    const newTxList = [salaryTx];

    for (const alloc of allocations) {
      const bIndex = currentBudgets.findIndex(b => b.category === alloc.category);
      if (bIndex > -1) {
        const budget = currentBudgets[bIndex];
        const updated = { ...budget, allocated: alloc.amount, spent: 0 };
        currentBudgets[bIndex] = updated;
        await saveBudget(updated);
      } else {
        const newB = { category: alloc.category, allocated: alloc.amount, spent: 0 };
        currentBudgets.push(newB);
        await saveBudget(newB);
      }

      if (alloc.amount > 0) {
        const allocTxId = 'tx-' + Math.random().toString(36).substring(2, 9);
        const allocTx: Transaction = {
          id: allocTxId,
          accountId: alloc.accountId,
          type: 'transfer',
          amount: alloc.amount,
          category: alloc.category,
          date: new Date().toISOString().split('T')[0],
          notes: `Allocated to ${alloc.category} budget`,
        };
        await saveTransaction(allocTx);
        newTxList.push(allocTx);

        if (alloc.accountId !== salaryAcc.id) {
          const salAccIdx = currentAccounts.findIndex(a => a.id === salaryAcc.id);
          if (salAccIdx > -1) {
            currentAccounts[salAccIdx].balance -= alloc.amount;
            await saveAccount(currentAccounts[salAccIdx]);
          }
          const tarAccIdx = currentAccounts.findIndex(a => a.id === alloc.accountId);
          if (tarAccIdx > -1) {
            currentAccounts[tarAccIdx].balance += alloc.amount;
            await saveAccount(currentAccounts[tarAccIdx]);
          }
        }
      }
    }

    const finalTxList = [...newTxList, ...get().transactions].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    set({
      accounts: currentAccounts,
      budgets: currentBudgets,
      transactions: finalTxList,
    });
  }
}));
