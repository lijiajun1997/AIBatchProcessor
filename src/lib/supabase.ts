import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          name: string;
          description: string;
          created_at: string;
          updated_at: string;
          user_id: string | null;
          column_order: string[];
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          created_at?: string;
          updated_at?: string;
          user_id?: string | null;
          column_order?: string[];
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          created_at?: string;
          updated_at?: string;
          user_id?: string | null;
          column_order?: string[];
        };
      };
      spreadsheet_data: {
        Row: {
          id: string;
          project_id: string;
          row_number: number;
          columns: Record<string, string>;
          result: string;
          status: string;
          error_message: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          row_number: number;
          columns: Record<string, string>;
          result?: string;
          status?: string;
          error_message?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          row_number?: number;
          columns?: Record<string, string>;
          result?: string;
          status?: string;
          error_message?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      task_configurations: {
        Row: {
          id: string;
          project_id: string;
          base_url: string;
          api_key: string;
          model_name: string;
          prompt_template: string;
          concurrency: number;
          retry_count: number;
          timeout_seconds: number;
          is_streaming: boolean;
          result_column: string;
          status_column: string;
          error_column: string;
          filter_think_tags: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          base_url?: string;
          api_key?: string;
          model_name?: string;
          prompt_template?: string;
          concurrency?: number;
          retry_count?: number;
          timeout_seconds?: number;
          is_streaming?: boolean;
          result_column?: string;
          status_column?: string;
          error_column?: string;
          filter_think_tags?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          base_url?: string;
          api_key?: string;
          model_name?: string;
          prompt_template?: string;
          concurrency?: number;
          retry_count?: number;
          timeout_seconds?: number;
          is_streaming?: boolean;
          result_column?: string;
          status_column?: string;
          error_column?: string;
          filter_think_tags?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      task_executions: {
        Row: {
          id: string;
          project_id: string;
          status: string;
          total_tasks: number;
          completed_tasks: number;
          failed_tasks: number;
          started_at: string;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          status?: string;
          total_tasks?: number;
          completed_tasks?: number;
          failed_tasks?: number;
          started_at?: string;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          status?: string;
          total_tasks?: number;
          completed_tasks?: number;
          failed_tasks?: number;
          started_at?: string;
          completed_at?: string | null;
          created_at?: string;
        };
      };
    };
  };
}
