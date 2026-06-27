import { create } from 'zustand';
import {
  Account,
  Transaction,
  Budget,
  Goal,
  ZakatRecord,
  getAccounts,
  getTransactions,
  getBudgets,
  getGoals,
  getZakatRecords,
  saveAccount,
  saveTransaction,
  saveBudget,
  saveGoal,
  saveZakatRecord,
  initSeedData,
} from '@/lib/db';

export type PrivacyMode = 'normal' | 'hide-all' | 'hide-amounts' | 'approximate';

interface MizanState {
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  zakatRecords: ZakatRecord[];
  
  // App UX States
  isLoading: boolean;
  activeTab: 'home' | 'timeline' | 'budget' | 'goals' | 'islamic' | 'profile';
  privacyMode: PrivacyMode;
  isLocked: boolean;
  autoLockDuration: number; // in seconds, 0 = immediate/manual, 30, 60, 300
  isGuestMode: boolean;
  
  // Actions
  fetchData: () => Promise<void>;
  addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<void>;
  addAccount: (acc: Account) => Promise<void>;
  updateBudget: (category: string, allocated: number) => Promise<void>;
  contributeToGoal: (goalId: string, amount: number, sourceAccountId: string) => Promise<void>;
  setPrivacyMode: (mode: PrivacyMode) => void;
  setActiveTab: (tab: 'home' | 'timeline' | 'budget' | 'goals' | 'islamic' | 'profile') => void;
  setLocked: (locked: boolean) => void;
  setAutoLockDuration: (duration: number) => void;
  setGuestMode: (guest: boolean) => void;
  saveZakatRecord: (record: ZakatRecord) => Promise<void>;
  allocatePaydayWizard: (incomeAmount: number, allocations: { category: string; amount: number; accountId: string }[]) => Promise<void>;
}

export const useMizanStore = create<MizanState>((set, get) => ({
  accounts: [],
  transactions: [],
  budgets: [],
  goals: [],
  zakatRecords: [],
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
      const accounts = await getAccounts();
      const transactions = await getTransactions();
      const budgets = await getBudgets();
      const goals = await getGoals();
      const zakatRecords = await getZakatRecords();
      
      // Sort transactions by date descending
      transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      set({
        accounts,
        transactions,
        budgets,
        goals,
        zakatRecords,
        isLoading: false,
      });
    } catch (e) {
      console.error('Error fetching data from IndexedDB:', e);
      set({ isLoading: false });
    }
  },

  addTransaction: async (txData) => {
    const id = 'tx-' + Math.random().toString(36).substring(2, 9);
    const newTx: Transaction = { ...txData, id };
    
    // Save to DB
    await saveTransaction(newTx);
    
    // Update account balances locally and in DB
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
    
    // If transaction is a transfer, handle destination account adjustment
    if (newTx.type === 'transfer' && newTx.notes.includes('→')) {
      // Notes format: "Transfer → [Dest Account Name]"
      // We will parse destination from account selector in component or handle manually
    }

    // Update budget spent values if expense or sadaqah
    const currentBudgets = [...get().budgets];
    if (newTx.type === 'expense' || newTx.type === 'sadaqah') {
      let budgetCategory = newTx.category;
      
      // Map category to budget group
      // Groups: "Needs", "Parents", "Savings", "Charity", "Wants"
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
      }
      
      const bIndex = currentBudgets.findIndex(b => b.category === budgetGroup);
      if (bIndex > -1) {
        const budget = currentBudgets[bIndex];
        const updatedBudget = { ...budget, spent: budget.spent + newTx.amount };
        currentBudgets[bIndex] = updatedBudget;
        await saveBudget(updatedBudget);
      }
    }

    // Update transactions list in state (sorted descending)
    const updatedTxList = [newTx, ...get().transactions].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    set({
      transactions: updatedTxList,
      accounts: currentAccounts,
      budgets: currentBudgets,
    });
  },

  addAccount: async (acc) => {
    await saveAccount(acc);
    set({ accounts: [...get().accounts, acc] });
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
    // 1. Deduct amount from account balance
    const currentAccounts = [...get().accounts];
    const accIndex = currentAccounts.findIndex(a => a.id === sourceAccountId);
    if (accIndex === -1) return;
    
    const acc = currentAccounts[accIndex];
    if (acc.balance < amount) return; // Prevent overdrawing
    
    const updatedAcc = { ...acc, balance: acc.balance - amount };
    currentAccounts[accIndex] = updatedAcc;
    await saveAccount(updatedAcc);
    
    // 2. Increment goal saved amount
    const currentGoals = [...get().goals];
    const goalIndex = currentGoals.findIndex(g => g.id === goalId);
    if (goalIndex === -1) return;
    
    const goal = currentGoals[goalIndex];
    const updatedGoal = { ...goal, saved: goal.saved + amount };
    currentGoals[goalIndex] = updatedGoal;
    await saveGoal(updatedGoal);
    
    // 3. Create Goal Contribution Transaction
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
    
    // 4. Update budget spent values for "Savings"
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
    // 1. Record the salary income transaction
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
    
    // Update salary account balance
    const currentAccounts = [...get().accounts];
    const salIndex = currentAccounts.findIndex(a => a.id === salaryAcc.id);
    if (salIndex > -1) {
      const acc = currentAccounts[salIndex];
      const updatedAcc = { ...acc, balance: acc.balance + incomeAmount };
      currentAccounts[salIndex] = updatedAcc;
      await saveAccount(updatedAcc);
    }

    // 2. Perform allocations
    // For each allocation, we modify the budget limits (allocated values)
    const currentBudgets = [...get().budgets];
    const currentGoals = [...get().goals];
    const newTxList = [salaryTx];

    for (const alloc of allocations) {
      // Find or create budget category
      const bIndex = currentBudgets.findIndex(b => b.category === alloc.category);
      if (bIndex > -1) {
        const budget = currentBudgets[bIndex];
        // Set new allocation value
        const updated = { ...budget, allocated: alloc.amount, spent: 0 }; // reset monthly spent on new payday wizard allocation
        currentBudgets[bIndex] = updated;
        await saveBudget(updated);
      } else {
        const newB = { category: alloc.category, allocated: alloc.amount, spent: 0 };
        currentBudgets.push(newB);
        await saveBudget(newB);
      }

      // If category is "Savings", distribute to goals as well or keep in savings account
      // Let's create transactions showing these allocations
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

        // If source account is different from salary account, move the balance
        if (alloc.accountId !== salaryAcc.id) {
          // Deduct from salary account
          const salAccIdx = currentAccounts.findIndex(a => a.id === salaryAcc.id);
          if (salAccIdx > -1) {
            currentAccounts[salAccIdx].balance -= alloc.amount;
            await saveAccount(currentAccounts[salAccIdx]);
          }
          // Add to target account
          const tarAccIdx = currentAccounts.findIndex(a => a.id === alloc.accountId);
          if (tarAccIdx > -1) {
            currentAccounts[tarAccIdx].balance += alloc.amount;
            await saveAccount(currentAccounts[tarAccIdx]);
          }
        }
      }
    }

    // Update transactions list in state
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
