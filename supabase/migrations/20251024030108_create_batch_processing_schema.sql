/*
  # Batch Processing System Schema

  ## Overview
  This migration creates the complete database schema for an Excel/CSV batch processing system
  that uses OpenAI API for automated data processing.

  ## New Tables

  ### 1. projects
  Stores project metadata and settings
  - `id` (uuid, primary key) - Unique project identifier
  - `name` (text) - Project name
  - `description` (text) - Optional project description
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  - `user_id` (uuid) - Owner of the project (for future auth integration)

  ### 2. spreadsheet_data
  Stores imported Excel/CSV data with flexible column structure
  - `id` (uuid, primary key) - Unique row identifier
  - `project_id` (uuid, foreign key) - Reference to projects table
  - `row_number` (integer) - Original row number in the spreadsheet
  - `columns` (jsonb) - Flexible JSON structure to store all column data
  - `result` (text) - API response result
  - `status` (text) - Processing status: queued, processing, completed, failed
  - `error_message` (text) - Error details if processing failed
  - `created_at` (timestamptz) - Import timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. task_configurations
  Stores API configuration and processing settings per project
  - `id` (uuid, primary key) - Unique configuration identifier
  - `project_id` (uuid, foreign key) - Reference to projects table
  - `base_url` (text) - OpenAI API base URL
  - `api_key` (text) - API key (encrypted in production)
  - `model_name` (text) - Model to use (e.g., gpt-4, gpt-3.5-turbo)
  - `prompt_template` (text) - Prompt with column placeholders (e.g., "Analyze {A} company's {B} info")
  - `concurrency` (integer) - Number of concurrent requests (1-10)
  - `retry_count` (integer) - Number of retries on failure (0-5)
  - `timeout_seconds` (integer) - Request timeout in seconds
  - `is_streaming` (boolean) - Whether to use streaming mode
  - `result_column` (text) - Column name/letter to save results
  - `status_column` (text) - Column name/letter to save status
  - `error_column` (text) - Column name/letter to save errors
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 4. task_executions
  Tracks batch execution sessions
  - `id` (uuid, primary key) - Unique execution identifier
  - `project_id` (uuid, foreign key) - Reference to projects table
  - `status` (text) - Execution status: running, paused, completed, cancelled
  - `total_tasks` (integer) - Total number of tasks in this execution
  - `completed_tasks` (integer) - Number of completed tasks
  - `failed_tasks` (integer) - Number of failed tasks
  - `started_at` (timestamptz) - Execution start time
  - `completed_at` (timestamptz) - Execution completion time
  - `created_at` (timestamptz) - Creation timestamp

  ## Security
  - Enable RLS on all tables
  - Add policies for authenticated users to manage their own data
  - Note: For initial development, we'll use permissive policies
        In production, these should be restricted based on user_id

  ## Indexes
  - Add indexes on foreign keys for better query performance
  - Add index on spreadsheet_data.status for filtering
  - Add index on task_executions.status for active execution queries
*/

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid
);

-- Create spreadsheet_data table
CREATE TABLE IF NOT EXISTS spreadsheet_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  row_number integer NOT NULL,
  columns jsonb NOT NULL DEFAULT '{}'::jsonb,
  result text DEFAULT '',
  status text DEFAULT 'pending',
  error_message text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create task_configurations table
CREATE TABLE IF NOT EXISTS task_configurations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  base_url text DEFAULT 'https://api.openai.com/v1',
  api_key text DEFAULT '',
  model_name text DEFAULT 'gpt-3.5-turbo',
  prompt_template text DEFAULT '',
  concurrency integer DEFAULT 3,
  retry_count integer DEFAULT 2,
  timeout_seconds integer DEFAULT 120,
  is_streaming boolean DEFAULT true,
  result_column text DEFAULT 'result',
  status_column text DEFAULT 'status',
  error_column text DEFAULT 'error',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create task_executions table
CREATE TABLE IF NOT EXISTS task_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  status text DEFAULT 'running',
  total_tasks integer DEFAULT 0,
  completed_tasks integer DEFAULT 0,
  failed_tasks integer DEFAULT 0,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_spreadsheet_data_project_id ON spreadsheet_data(project_id);
CREATE INDEX IF NOT EXISTS idx_spreadsheet_data_status ON spreadsheet_data(status);
CREATE INDEX IF NOT EXISTS idx_task_configurations_project_id ON task_configurations(project_id);
CREATE INDEX IF NOT EXISTS idx_task_executions_project_id ON task_executions(project_id);
CREATE INDEX IF NOT EXISTS idx_task_executions_status ON task_executions(status);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE spreadsheet_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_executions ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for development (should be restricted in production)
-- Projects policies
CREATE POLICY "Allow all operations on projects"
  ON projects
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Spreadsheet data policies
CREATE POLICY "Allow all operations on spreadsheet_data"
  ON spreadsheet_data
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Task configurations policies
CREATE POLICY "Allow all operations on task_configurations"
  ON task_configurations
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Task executions policies
CREATE POLICY "Allow all operations on task_executions"
  ON task_executions
  FOR ALL
  USING (true)
  WITH CHECK (true);