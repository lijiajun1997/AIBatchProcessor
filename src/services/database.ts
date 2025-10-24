import { supabase } from '../lib/supabase';
import {
  localProjectService,
  localSpreadsheetService,
  localConfigService,
  localExecutionService
} from './localStorage';

const getStorageMode = (): 'local' | 'supabase' => {
  const mode = import.meta.env.VITE_STORAGE_MODE?.toLowerCase();

  if (mode === 'supabase') {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (url && key && url.trim() && key.trim()) {
      return 'supabase';
    } else {
      console.warn('VITE_STORAGE_MODE is set to "supabase" but Supabase credentials are missing. Falling back to local storage.');
      return 'local';
    }
  }

  return 'local';
};

const USE_SUPABASE = getStorageMode() === 'supabase';

export interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  column_order: string[];
}

export interface SpreadsheetRow {
  id: string;
  project_id: string;
  row_number: number;
  columns: Record<string, string>;
  result: string;
  status: string;
  error_message: string;
  created_at: string;
  updated_at: string;
}

export interface TaskConfig {
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
}

export interface TaskExecution {
  id: string;
  project_id: string;
  status: string;
  total_tasks: number;
  completed_tasks: number;
  failed_tasks: number;
  started_at: string;
  completed_at: string | null;
}

export const projectService = {
  async getAll(): Promise<Project[]> {
    if (USE_SUPABASE) {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } else {
      return localProjectService.getAll();
    }
  },

  async getById(id: string): Promise<Project | null> {
    if (USE_SUPABASE) {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    } else {
      return localProjectService.getById(id);
    }
  },

  async create(name: string, description: string = ''): Promise<Project> {
    if (USE_SUPABASE) {
      const { data, error } = await supabase
        .from('projects')
        .insert({ name, description })
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      return localProjectService.create({ name, description });
    }
  },

  async update(id: string, updates: { name?: string; description?: string; column_order?: string[] }): Promise<Project> {
    if (USE_SUPABASE) {
      const { data, error } = await supabase
        .from('projects')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      return localProjectService.update(id, updates);
    }
  },

  async delete(id: string): Promise<void> {
    if (USE_SUPABASE) {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } else {
      return localProjectService.delete(id);
    }
  }
};

export const spreadsheetService = {
  async getByProjectId(projectId: string): Promise<SpreadsheetRow[]> {
    if (USE_SUPABASE) {
      const { data, error } = await supabase
        .from('spreadsheet_data')
        .select('*')
        .eq('project_id', projectId)
        .order('row_number', { ascending: true });

      if (error) throw error;
      return data || [];
    } else {
      return localSpreadsheetService.getByProjectId(projectId);
    }
  },

  async bulkInsert(rows: Array<{ project_id: string; row_number: number; columns: Record<string, string> }>): Promise<SpreadsheetRow[]> {
    if (USE_SUPABASE) {
      const { data, error } = await supabase
        .from('spreadsheet_data')
        .insert(rows)
        .select();

      if (error) throw error;
      return data;
    } else {
      return localSpreadsheetService.bulkInsert(rows);
    }
  },

  async updateRow(id: string, updates: { result?: string; status?: string; error_message?: string }): Promise<void> {
    if (USE_SUPABASE) {
      const { error } = await supabase
        .from('spreadsheet_data')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    } else {
      return localSpreadsheetService.updateRow(id, updates);
    }
  },

  async deleteByProjectId(projectId: string): Promise<void> {
    if (USE_SUPABASE) {
      const { error } = await supabase
        .from('spreadsheet_data')
        .delete()
        .eq('project_id', projectId);

      if (error) throw error;
    } else {
      return localSpreadsheetService.deleteByProjectId(projectId);
    }
  },

  async resetProcessingTasks(projectId: string): Promise<void> {
    if (USE_SUPABASE) {
      const { error } = await supabase
        .from('spreadsheet_data')
        .update({
          status: 'pending',
          error_message: '',
          updated_at: new Date().toISOString()
        })
        .eq('project_id', projectId)
        .eq('status', 'processing');

      if (error) throw error;
    } else {
      return localSpreadsheetService.resetProcessingTasks(projectId);
    }
  },

  async resetSelectedTasks(ids: string[]): Promise<void> {
    if (USE_SUPABASE) {
      const { error } = await supabase
        .from('spreadsheet_data')
        .update({
          status: 'pending',
          result: '',
          error_message: '',
          updated_at: new Date().toISOString()
        })
        .in('id', ids);

      if (error) throw error;
    } else {
      return localSpreadsheetService.resetSelectedTasks(ids);
    }
  },

  async updateRowData(id: string, updates: {
    columns?: Record<string, string>;
    result?: string;
    error_message?: string
  }): Promise<void> {
    if (USE_SUPABASE) {
      const { error } = await supabase
        .from('spreadsheet_data')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    } else {
      return localSpreadsheetService.updateRowData(id, updates);
    }
  }
};

export const configService = {
  async getByProjectId(projectId: string): Promise<TaskConfig | null> {
    if (USE_SUPABASE) {
      const { data, error } = await supabase
        .from('task_configurations')
        .select('*')
        .eq('project_id', projectId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } else {
      return localConfigService.getByProjectId(projectId);
    }
  },

  async createOrUpdate(config: Partial<TaskConfig> & { project_id: string }): Promise<TaskConfig> {
    if (USE_SUPABASE) {
      const existing = await this.getByProjectId(config.project_id);

      if (existing) {
        const { data, error } = await supabase
          .from('task_configurations')
          .update({ ...config, updated_at: new Date().toISOString() })
          .eq('project_id', config.project_id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('task_configurations')
          .insert(config)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } else {
      return localConfigService.createOrUpdate(config);
    }
  }
};

export const executionService = {
  async create(projectId: string, totalTasks: number): Promise<TaskExecution> {
    if (USE_SUPABASE) {
      const { data, error } = await supabase
        .from('task_executions')
        .insert({ project_id: projectId, total_tasks: totalTasks })
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      return localExecutionService.create({ project_id: projectId, total_tasks: totalTasks });
    }
  },

  async update(id: string, updates: Partial<Omit<TaskExecution, 'id' | 'project_id' | 'created_at'>>): Promise<void> {
    if (USE_SUPABASE) {
      const { error } = await supabase
        .from('task_executions')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    } else {
      await localExecutionService.update(id, updates);
    }
  },

  async getLatestByProjectId(projectId: string): Promise<TaskExecution | null> {
    if (USE_SUPABASE) {
      const { data, error } = await supabase
        .from('task_executions')
        .select('*')
        .eq('project_id', projectId)
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    } else {
      const executions = await localExecutionService.getByProjectId(projectId);
      if (executions.length === 0) return null;
      return executions.sort((a, b) =>
        new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
      )[0];
    }
  }
};
