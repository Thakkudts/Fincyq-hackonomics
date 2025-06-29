export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          age: number;
          income: number;
          monthly_expenses: number;
          monthly_savings: number;
          current_savings: number;
          risk_tolerance: 'conservative' | 'moderate' | 'aggressive';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          age: number;
          income: number;
          monthly_expenses: number;
          monthly_savings: number;
          current_savings: number;
          risk_tolerance: 'conservative' | 'moderate' | 'aggressive';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          age?: number;
          income?: number;
          monthly_expenses?: number;
          monthly_savings?: number;
          current_savings?: number;
          risk_tolerance?: 'conservative' | 'moderate' | 'aggressive';
          created_at?: string;
          updated_at?: string;
        };
      };
      financial_goals: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          target_amount: number;
          target_year: number;
          priority: 'high' | 'medium' | 'low';
          category: 'home' | 'education' | 'travel' | 'retirement' | 'business' | 'other';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          target_amount: number;
          target_year: number;
          priority: 'high' | 'medium' | 'low';
          category: 'home' | 'education' | 'travel' | 'retirement' | 'business' | 'other';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          target_amount?: number;
          target_year?: number;
          priority?: 'high' | 'medium' | 'low';
          category?: 'home' | 'education' | 'travel' | 'retirement' | 'business' | 'other';
          created_at?: string;
          updated_at?: string;
        };
      };
      expenses: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          description: string;
          category: string;
          date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          description: string;
          category: string;
          date: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          description?: string;
          category?: string;
          date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      risk_tolerance: 'conservative' | 'moderate' | 'aggressive';
      goal_priority: 'high' | 'medium' | 'low';
      goal_category: 'home' | 'education' | 'travel' | 'retirement' | 'business' | 'other';
    };
  };
}