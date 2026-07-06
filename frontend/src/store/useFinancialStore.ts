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

interface FinancialGoal {
  id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  remaining_amount: number;
  deadline: string | null;
  description: string | null;
  status: 'active' | 'completed';
  progress: number;
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

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  priority: string;
}

interface DashboardData {
  header: Record<string, any>;
  statistics: Record<string, any>;
  cashflow: any[];
  expense_categories: any[];
  budget_progress: Record<string, any>;
  financial_health: Record<string, any>;
  ai_insights: any[];
  recent_transactions: any[];
  notifications: NotificationItem[];
  quick_actions: any[];
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface FinancialState {
  categories: Category[];
  budgets: Budget[];
  financialGoals: FinancialGoal[];
  transactions: Transaction[];
  transactionPagination: PaginationMeta | null;
  healthScore: HealthScore | null;
  insights: InsightsData | null;
  dashboardData: DashboardData | null;
  notifications: NotificationItem[];
  searchResults: Transaction[];
  dashboardRequestPromise: Promise<void> | null;
  isLoading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  createCategory: (data: any) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  fetchBudgets: () => Promise<void>;
  createBudget: (data: any) => Promise<void>;
  deleteBudget: (id: number) => Promise<void>;
  fetchFinancialGoals: () => Promise<void>;
  createFinancialGoal: (data: any) => Promise<void>;
  updateFinancialGoal: (id: number, data: any) => Promise<void>;
  deleteFinancialGoal: (id: number) => Promise<void>;
  fetchTransactions: (filters?: any) => Promise<void>;
  createTransaction: (data: any, filters?: any) => Promise<void>;
  updateTransaction: (id: number, data: any, filters?: any) => Promise<void>;
  deleteTransaction: (id: number, filters?: any) => Promise<void>;
  fetchDashboard: (force?: boolean) => Promise<void>;
  clearDashboardCache: () => void;
  searchTransactions: (query: string) => Promise<void>;
  fetchHealthScore: () => Promise<void>;
  fetchInsights: () => Promise<void>;
}

export const useFinancialStore = create<FinancialState>((set, get) => ({
  categories: [],
  budgets: [],
  financialGoals: [],
  transactions: [],
  transactionPagination: null,
  healthScore: null,
  insights: null,
  dashboardData: null,
  notifications: [],
  searchResults: [],
  dashboardRequestPromise: null,
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
      // Invalidate dashboard cache to ensure fresh data
      get().clearDashboardCache();
      await Promise.all([
        get().fetchBudgets(),
        get().fetchDashboard(true),
        get().fetchHealthScore(),
        get().fetchInsights(),
      ]);
      set({ isLoading: false, error: null });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  deleteBudget: async (id) => {
    set({ isLoading: true });
    try {
      await apiFetch(`/budgets/${id}`, { method: 'DELETE' });
      // Invalidate dashboard cache to ensure fresh data
      get().clearDashboardCache();
      await Promise.all([
        get().fetchBudgets(),
        get().fetchDashboard(true),
        get().fetchHealthScore(),
        get().fetchInsights(),
      ]);
      set({ isLoading: false, error: null });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchFinancialGoals: async () => {
    set({ isLoading: true });
    try {
      const res = await apiFetch('/financial-goals');
      set({ financialGoals: res.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  createFinancialGoal: async (data) => {
    set({ isLoading: true });
    try {
      await apiFetch('/financial-goals', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      await get().fetchFinancialGoals();
      set({ isLoading: false, error: null });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  updateFinancialGoal: async (id, data) => {
    set({ isLoading: true });
    try {
      await apiFetch(`/financial-goals/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      await get().fetchFinancialGoals();
      set({ isLoading: false, error: null });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  deleteFinancialGoal: async (id) => {
    set({ isLoading: true });
    try {
      await apiFetch(`/financial-goals/${id}`, { method: 'DELETE' });
      await get().fetchFinancialGoals();
      set({ isLoading: false, error: null });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchTransactions: async (filters = {}) => {
    set({ isLoading: true });
    try {
      const normalizedFilters = Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== '' && value !== null && value !== undefined)
      );
      const queryString = new URLSearchParams(normalizedFilters as Record<string, string>).toString();
      const path = queryString ? `/transactions?${queryString}` : '/transactions';
      const res = await apiFetch(path);
      const transactionData = Array.isArray(res.data) ? res.data : res.data.data ?? [];
      const paginationMeta = res.meta ?? null;
      set({ transactions: transactionData, transactionPagination: paginationMeta, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  createTransaction: async (data, filters = {}) => {
    set({ isLoading: true });
    try {
      await apiFetch('/transactions', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      // Refresh all related data after successful transaction creation
      const refreshPromises = [
        get().fetchTransactions(filters),
        useAuthStore.getState().fetchUser(),
      ];
      
      // Also invalidate dashboard cache to ensure fresh data
      get().clearDashboardCache();
      refreshPromises.push(
        get().fetchDashboard(true),
        get().fetchHealthScore(),
        get().fetchInsights(),
      );

      await Promise.all(refreshPromises);
      set({ isLoading: false, error: null });
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to create transaction';
      set({ error: errorMsg, isLoading: false });
      throw err;
    }
  },

  updateTransaction: async (id, data, filters = {}) => {
    set({ isLoading: true });
    try {
      await apiFetch(`/transactions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      // Refresh all related data after successful transaction update
      const refreshPromises = [
        get().fetchTransactions(filters),
        useAuthStore.getState().fetchUser(),
      ];
      
      // Also invalidate dashboard cache to ensure fresh data
      get().clearDashboardCache();
      refreshPromises.push(
        get().fetchDashboard(true),
        get().fetchHealthScore(),
        get().fetchInsights(),
      );

      await Promise.all(refreshPromises);
      set({ isLoading: false, error: null });
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to update transaction';
      set({ error: errorMsg, isLoading: false });
      throw err;
    }
  },

  deleteTransaction: async (id, filters = {}) => {
    set({ isLoading: true });
    try {
      await apiFetch(`/transactions/${id}`, { method: 'DELETE' });
      // Refresh all related data after successful transaction deletion
      const refreshPromises = [
        get().fetchTransactions(filters),
        useAuthStore.getState().fetchUser(),
      ];
      
      // Also invalidate dashboard cache to ensure fresh data
      get().clearDashboardCache();
      refreshPromises.push(
        get().fetchDashboard(true),
        get().fetchHealthScore(),
        get().fetchInsights(),
      );

      await Promise.all(refreshPromises);
      set({ isLoading: false, error: null });
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to delete transaction';
      set({ error: errorMsg, isLoading: false });
      throw err;
    }
  },

  searchTransactions: async (query: string) => {
    if (!query.trim()) {
      set({ searchResults: [] });
      return;
    }

    set({ isLoading: true });
    try {
      const encodedQuery = encodeURIComponent(query.trim());
      const res = await apiFetch(`/transactions?search=${encodedQuery}`);
      const transactionData = Array.isArray(res.data) ? res.data : res.data.data ?? [];
      set({ searchResults: transactionData, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchDashboard: async (force = false) => {
    // If not forcing refresh and data exists, return immediately
    if (!force && get().dashboardData) {
      return Promise.resolve();
    }

    // If already fetching, return existing promise to avoid duplicate requests
    const existingPromise = get().dashboardRequestPromise;
    if (!force && existingPromise) {
      return existingPromise;
    }

    // Create new request
    const request = (async () => {
      set({ isLoading: true, error: null });
      try {
        const res = await apiFetch('/dashboard');
        const dashboard = res.data;
        const previousTransactions = get().transactions;
        set({
          dashboardData: dashboard,
          notifications: dashboard.notifications || [],
          transactions: previousTransactions,
          isLoading: false,
          error: null
        });
      } catch (err: any) {
        set({ error: err.message, isLoading: false });
        throw err; // Re-throw so caller knows about the error
      } finally {
        // Clear the promise reference when done (success or error)
        set({ dashboardRequestPromise: null });
      }
    })();

    // Store the promise for deduplication
    set({ dashboardRequestPromise: request });
    return request;
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
  },

  clearDashboardCache: () => {
    // Clear all cached dashboard-related data to force fresh fetch
    set({
      dashboardData: null,
      dashboardRequestPromise: null,
      healthScore: null,
      insights: null,
      error: null
    });
  }
}));
