import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Project, SpreadsheetRow, TaskConfig, TaskExecution } from './database';

interface BatchProcessorDB extends DBSchema {
  projects: {
    key: string;
    value: Project;
  };
  spreadsheet_data: {
    key: string;
    value: SpreadsheetRow;
    indexes: {
      'by-project': string;
      'by-status': string;
    };
  };
  task_configurations: {
    key: string;
    value: TaskConfig;
    indexes: {
      'by-project': string;
    };
  };
  task_executions: {
    key: string;
    value: TaskExecution;
    indexes: {
      'by-project': string;
    };
  };
}

let dbInstance: IDBPDatabase<BatchProcessorDB> | null = null;

async function getDB(): Promise<IDBPDatabase<BatchProcessorDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<BatchProcessorDB>('batch-processor-db', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('projects')) {
        db.createObjectStore('projects', { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('spreadsheet_data')) {
        const spreadsheetStore = db.createObjectStore('spreadsheet_data', { keyPath: 'id' });
        spreadsheetStore.createIndex('by-project', 'project_id');
        spreadsheetStore.createIndex('by-status', 'status');
      }

      if (!db.objectStoreNames.contains('task_configurations')) {
        const configStore = db.createObjectStore('task_configurations', { keyPath: 'id' });
        configStore.createIndex('by-project', 'project_id');
      }

      if (!db.objectStoreNames.contains('task_executions')) {
        const executionStore = db.createObjectStore('task_executions', { keyPath: 'id' });
        executionStore.createIndex('by-project', 'project_id');
      }
    },
  });

  return dbInstance;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export const localProjectService = {
  async getAll(): Promise<Project[]> {
    const db = await getDB();
    return db.getAll('projects');
  },

  async getById(id: string): Promise<Project | null> {
    const db = await getDB();
    const project = await db.get('projects', id);
    return project || null;
  },

  async create(data: { name: string; description?: string; column_order?: string[] }): Promise<Project> {
    const db = await getDB();
    const now = new Date().toISOString();
    const project: Project = {
      id: generateId(),
      name: data.name,
      description: data.description || '',
      column_order: data.column_order || [],
      created_at: now,
      updated_at: now
    };
    await db.put('projects', project);
    return project;
  },

  async update(id: string, updates: { name?: string; description?: string; column_order?: string[] }): Promise<Project> {
    const db = await getDB();
    const project = await db.get('projects', id);
    if (!project) throw new Error('Project not found');

    const updated: Project = {
      ...project,
      ...updates,
      updated_at: new Date().toISOString()
    };
    await db.put('projects', updated);
    return updated;
  },

  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('projects', id);
  }
};

export const localSpreadsheetService = {
  async getByProjectId(projectId: string): Promise<SpreadsheetRow[]> {
    const db = await getDB();
    const rows = await db.getAllFromIndex('spreadsheet_data', 'by-project', projectId);
    return rows.sort((a, b) => a.row_number - b.row_number);
  },

  async bulkInsert(rows: Array<{ project_id: string; row_number: number; columns: Record<string, string> }>): Promise<SpreadsheetRow[]> {
    const db = await getDB();
    const now = new Date().toISOString();
    const insertedRows: SpreadsheetRow[] = [];

    for (const row of rows) {
      const spreadsheetRow: SpreadsheetRow = {
        id: generateId(),
        project_id: row.project_id,
        row_number: row.row_number,
        columns: row.columns,
        result: '',
        status: 'pending',
        error_message: '',
        created_at: now,
        updated_at: now
      };
      await db.put('spreadsheet_data', spreadsheetRow);
      insertedRows.push(spreadsheetRow);
    }

    return insertedRows;
  },

  async updateRow(id: string, updates: { result?: string; status?: string; error_message?: string }): Promise<void> {
    const db = await getDB();
    const row = await db.get('spreadsheet_data', id);
    if (!row) throw new Error('Row not found');

    const updated: SpreadsheetRow = {
      ...row,
      ...updates,
      updated_at: new Date().toISOString()
    };
    await db.put('spreadsheet_data', updated);
  },

  async deleteByProjectId(projectId: string): Promise<void> {
    const db = await getDB();
    const rows = await db.getAllFromIndex('spreadsheet_data', 'by-project', projectId);
    for (const row of rows) {
      await db.delete('spreadsheet_data', row.id);
    }
  },

  async resetProcessingTasks(projectId: string): Promise<void> {
    const db = await getDB();
    const rows = await db.getAllFromIndex('spreadsheet_data', 'by-project', projectId);

    for (const row of rows) {
      if (row.status === 'processing') {
        await db.put('spreadsheet_data', {
          ...row,
          status: 'pending',
          error_message: '',
          updated_at: new Date().toISOString()
        });
      }
    }
  },

  async resetSelectedTasks(ids: string[]): Promise<void> {
    const db = await getDB();

    for (const id of ids) {
      const row = await db.get('spreadsheet_data', id);
      if (row) {
        await db.put('spreadsheet_data', {
          ...row,
          status: 'pending',
          result: '',
          error_message: '',
          updated_at: new Date().toISOString()
        });
      }
    }
  },

  async updateRowData(id: string, updates: {
    columns?: Record<string, string>;
    result?: string;
    error_message?: string
  }): Promise<void> {
    const db = await getDB();
    const row = await db.get('spreadsheet_data', id);
    if (!row) throw new Error('Row not found');

    const updated: SpreadsheetRow = {
      ...row,
      ...updates,
      updated_at: new Date().toISOString()
    };
    await db.put('spreadsheet_data', updated);
  }
};

export const localConfigService = {
  async getByProjectId(projectId: string): Promise<TaskConfig | null> {
    const db = await getDB();
    const configs = await db.getAllFromIndex('task_configurations', 'by-project', projectId);
    return configs[0] || null;
  },

  async createOrUpdate(data: Partial<TaskConfig> & { project_id: string }): Promise<TaskConfig> {
    const db = await getDB();
    const existing = await this.getByProjectId(data.project_id);
    const now = new Date().toISOString();

    const config: TaskConfig = {
      id: existing?.id || generateId(),
      project_id: data.project_id,
      base_url: data.base_url || 'https://api.openai.com/v1',
      api_key: data.api_key || '',
      model_name: data.model_name || 'gpt-3.5-turbo',
      prompt_template: data.prompt_template || '',
      concurrency: data.concurrency ?? 3,
      retry_count: data.retry_count ?? 2,
      timeout_seconds: data.timeout_seconds ?? 120,
      is_streaming: data.is_streaming ?? true,
      result_column: data.result_column || 'result',
      status_column: data.status_column || 'status',
      error_column: data.error_column || 'error',
      filter_think_tags: data.filter_think_tags ?? true,
      created_at: existing?.created_at || now,
      updated_at: now
    };

    await db.put('task_configurations', config);
    return config;
  }
};

export const localExecutionService = {
  async getByProjectId(projectId: string): Promise<TaskExecution[]> {
    const db = await getDB();
    return db.getAllFromIndex('task_executions', 'by-project', projectId);
  },

  async create(data: Partial<TaskExecution> & { project_id: string }): Promise<TaskExecution> {
    const db = await getDB();
    const now = new Date().toISOString();

    const execution: TaskExecution = {
      id: generateId(),
      project_id: data.project_id,
      status: data.status || 'pending',
      total_tasks: data.total_tasks || 0,
      completed_tasks: data.completed_tasks || 0,
      failed_tasks: data.failed_tasks || 0,
      started_at: data.started_at || now,
      completed_at: data.completed_at || null
    };

    await db.put('task_executions', execution);
    return execution;
  },

  async update(id: string, updates: Partial<TaskExecution>): Promise<TaskExecution> {
    const db = await getDB();
    const execution = await db.get('task_executions', id);
    if (!execution) throw new Error('Execution not found');

    const updated: TaskExecution = {
      ...execution,
      ...updates
    };

    await db.put('task_executions', updated);
    return updated;
  }
};
