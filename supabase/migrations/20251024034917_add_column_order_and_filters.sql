/*
  # 添加列顺序和思考内容过滤配置

  ## 变更说明
  
  1. 更新 projects 表
    - 添加 `column_order` (jsonb) - 存储列的顺序数组
  
  2. 更新 task_configurations 表  
    - 添加 `filter_think_tags` (boolean) - 是否过滤 <think> 标签，默认为 true
  
  3. 更新 spreadsheet_data 表
    - 添加索引以优化查询性能
*/

-- 为 projects 表添加列顺序字段
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'column_order'
  ) THEN
    ALTER TABLE projects ADD COLUMN column_order jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- 为 task_configurations 表添加思考内容过滤字段
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'task_configurations' AND column_name = 'filter_think_tags'
  ) THEN
    ALTER TABLE task_configurations ADD COLUMN filter_think_tags boolean DEFAULT true;
  END IF;
END $$;