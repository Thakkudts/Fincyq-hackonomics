import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface Expense {
  id: string;
  userId: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  createdAt: string;
}

export function useExpenses(userId?: string) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadExpenses = async (userIdToLoad: string) => {
    if (!userIdToLoad || !isSupabaseConfigured) return { success: false, error: 'Configuration error' };

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userIdToLoad)
        .order('date', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      const formattedExpenses: Expense[] = (data || []).map(expense => ({
        id: expense.id,
        userId: expense.user_id,
        amount: expense.amount,
        description: expense.description,
        category: expense.category,
        date: expense.date,
        createdAt: expense.created_at
      }));

      setExpenses(formattedExpenses);
      return { success: true, expenses: formattedExpenses };

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load expenses';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (expense: Omit<Expense, 'id' | 'createdAt'>) => {
    if (!isSupabaseConfigured) return { success: false, error: 'Supabase not configured' };

    setLoading(true);
    setError(null);

    try {
      const { data, error: insertError } = await supabase
        .from('expenses')
        .insert({
          user_id: expense.userId,
          amount: expense.amount,
          description: expense.description,
          category: expense.category,
          date: expense.date
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      const newExpense: Expense = {
        id: data.id,
        userId: data.user_id,
        amount: data.amount,
        description: data.description,
        category: data.category,
        date: data.date,
        createdAt: data.created_at
      };

      setExpenses(prev => [newExpense, ...prev]);
      return { success: true, expense: newExpense };

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to add expense';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updateExpense = async (expenseId: string, updates: Partial<Omit<Expense, 'id' | 'userId' | 'createdAt'>>) => {
    if (!isSupabaseConfigured) return { success: false, error: 'Supabase not configured' };

    setLoading(true);
    setError(null);

    try {
      const { data, error: updateError } = await supabase
        .from('expenses')
        .update({
          amount: updates.amount,
          description: updates.description,
          category: updates.category,
          date: updates.date
        })
        .eq('id', expenseId)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      const updatedExpense: Expense = {
        id: data.id,
        userId: data.user_id,
        amount: data.amount,
        description: data.description,
        category: data.category,
        date: data.date,
        createdAt: data.created_at
      };

      setExpenses(prev => prev.map(expense => 
        expense.id === expenseId ? updatedExpense : expense
      ));

      return { success: true, expense: updatedExpense };

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update expense';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const deleteExpense = async (expenseId: string) => {
    if (!isSupabaseConfigured) return { success: false, error: 'Supabase not configured' };

    setLoading(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId);

      if (deleteError) {
        throw deleteError;
      }

      setExpenses(prev => prev.filter(expense => expense.id !== expenseId));
      return { success: true };

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete expense';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const getMonthlyTotal = (month?: string) => {
    const targetMonth = month || new Date().toISOString().slice(0, 7); // YYYY-MM format
    return expenses
      .filter(expense => expense.date.startsWith(targetMonth))
      .reduce((total, expense) => total + expense.amount, 0);
  };

  const getCategoryTotals = (month?: string) => {
    const targetMonth = month || new Date().toISOString().slice(0, 7);
    const monthlyExpenses = expenses.filter(expense => expense.date.startsWith(targetMonth));
    
    return monthlyExpenses.reduce((totals, expense) => {
      totals[expense.category] = (totals[expense.category] || 0) + expense.amount;
      return totals;
    }, {} as Record<string, number>);
  };

  // Auto-load expenses when userId changes
  useEffect(() => {
    if (userId && isSupabaseConfigured) {
      loadExpenses(userId);
    } else {
      setExpenses([]);
    }
  }, [userId]);

  return {
    expenses,
    loading,
    error,
    addExpense,
    updateExpense,
    deleteExpense,
    loadExpenses,
    getMonthlyTotal,
    getCategoryTotals,
  };
}