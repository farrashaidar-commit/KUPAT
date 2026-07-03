import { create } from 'zustand';
import { apiFetch } from '../utils/api';
import { useAuthStore } from './useAuthStore';

interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
}

interface Budget {
  id: number;
  category_id: number;
  category?: Category;
  amount: number;
  period: string;
  start_date: string;
  end_date: string;
}

interface Transaction {
  id: number;
  category_id: number | null;
  category?: Category;
  amount: number;
  type: 'income' | 'expense';
  description: string | null;
  transaction_date: string;
}

interface HealthScore {
  score: number;
  status: string;
  color: string;
  total_budget: number;
  total_spent: number;
  details: any[];
}

interface InsightsData {
  health_score: number;
  total_income: number;
  total_expense: number;
  net_savings: number;
  insights: any[];
}

interface FinancialState {
  categories: Category[];
  budgets: Budget[];
  transactions: Transaction[];
  healthScore: HealthScore | null;
  insights: InsightsData | null;
  isLoading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  createCategory: (data: any) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  fetchBudgets: () => Promise<void>;
  createBudget: (data: any) => Promise<void>;
  deleteBudget: (id: number) => Promise<void>;
  fetchTransactions: (filters?: any) => Promise<void>;
  createTransaction: (data: any) => Promise<void>;
  deleteTransaction: (id: number) => Promise<void>;
  fetchHealthScore: () => Promise<void>;
  fetchInsights: () => Promise<void>;
}

export const useFinancialStore = create<FinancialState>((set, get) => ({
  categories: [],
  budgets: [],
  transactions: [],
  healthScore: null,
  insights: null,
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    set({ isLoading: true });
    try {
      const res = await apiFetch('/categories');
      set({ categories: res.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  createCategory: async (data) => {
    set({ isLoading: true });
    try {
      await apiFetch('/categories', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      get().fetchCategories();
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  deleteCategory: async (id) => {
    set({ isLoading: true });
    try {
      await apiFetch(`/categories/${id}`, { method: 'DELETE' });
      get().fetchCategories();
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchBudgets: async () => {
    set({ isLoading: true });
    try {
      const res = await apiFetch('/budgets');
      set({ budgets: res.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  createBudget: async (data) => {
    set({ isLoading: true });
    try {
      await apiFetch('/budgets', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      get().fetchBudgets();
      get().fetchHealthScore();
      get().fetchInsights();
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  deleteBudget: async (id) => {
    set({ isLoading: true });
    try {
      await apiFetch(`/budgets/${id}`, { method: 'DELETE' });
      get().fetchBudgets();
      get().fetchHealthScore();
      get().fetchInsights();
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchTransactions: async (filters = {}) => {
    set({ isLoading: true });
    try {
      const queryString = new URLSearchParams(filters).toString();
      const path = queryString ? `/transactions?${queryString}` : '/transactions';
      const res = await apiFetch(path);
      set({ transactions: res.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  createTransaction: async (data) => {
    set({ isLoading: true });
    try {
      await apiFetch('/transactions', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      get().fetchTransactions();
      useAuthStore.getState().fetchUser();
      get().fetchHealthScore();
      get().fetchInsights();
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  deleteTransaction: async (id) => {
    set({ isLoading: true });
    try {
      await apiFetch(`/transactions/${id}`, { method: 'DELETE' });
      get().fetchTransactions();
      useAuthStore.getState().fetchUser();
      get().fetchHealthScore();
      get().fetchInsights();
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchHealthScore: async () => {
    try {
      const res = await apiFetch('/financial-health');
      set({ healthScore: res.data });
    } catch (err: any) {
      console.error(err);
    }
  },

  fetchInsights: async () => {
    try {
      const res = await apiFetch('/financial-insights');
      set({ insights: res.data });
    } catch (err: any) {
      console.error(err);
    }
  }
}));
