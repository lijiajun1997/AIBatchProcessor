# AI 批量处理器

<div align="center">

一款功能强大的 AI 数据批量处理 Web 应用。上传 Excel/CSV 文件，配置 API 设置，让 AI 逐行处理您的数据，支持流式响应、重试逻辑、断点续传和实时监控等高级功能。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff)](https://vitejs.dev/)

</div>

---

## 目录

- [功能特性](#功能特性)
- [对比其他工具](#对比其他工具)
- [使用场景](#使用场景)
- [技术栈](#技术栈)
- [快速开始](#快速开始)
- [配置说明](#配置说明)
- [使用指南](#使用指南)
- [项目结构](#项目结构)
- [二次开发指南](#二次开发指南)
- [API 文档](#api-文档)
- [故障排除](#故障排除)
- [许可证](#许可证)

---

## 功能特性

### 核心功能

- **文件上传与处理** - 支持 Excel (.xlsx, .xls) 和 CSV 文件，自动解析表头和数据
- **AI 集成** - 兼容 OpenAI API 和任何 OpenAI 兼容的 API 端点（包括本地模型）
- **批量处理** - 支持可配置并发数的多行并行处理，大幅提升处理效率
- **实时监控** - 实时进度跟踪，包含统计信息和状态更新
- **智能重试逻辑** - 失败请求的自动重试机制，支持指数退避策略
- **流式响应支持** - 启用流式模式以获得实时 AI 响应，边生成边显示
- **数据导出** - 将处理结果导出为 Excel 格式，保持原始列顺序
<img width="2937" height="1460" alt="image" src="https://github.com/user-attachments/assets/a07f0134-0482-4316-897e-31f7f7213655" />

### 高级功能

- **断点续传** - 随时暂停、恢复和取消处理，支持中断后继续处理
- **本地存储模式** - 默认使用浏览器 IndexedDB，完全离线工作，无需账号
- **云同步选项** - 可选 Supabase 集成，支持多设备数据同步
- **多选与重置** - 选择多行并批量重置以重新处理
- **单元格编辑** - 点击任意单元格查看和编辑完整内容
- **思考标签过滤** - 可选择过滤 AI 响应中的 `<think>...</think>` 标签
- **提示词模板** - 在提示词中使用 `{列名}` 等变量占位符，灵活构建提示
- **行级状态追踪** - 每行独立状态管理（待处理、处理中、成功、失败）
- **错误追踪** - 失败任务的详细错误信息记录
- **列顺序保持** - 保持原始文件的列顺序不变

---

## 对比其他工具

### vs. 飞书多维表格

| 功能 | AI 批量处理器 | 飞书多维表格 |
|---------|-------------------|-------------------|
| **断点续传** | ✅ 随时暂停、恢复、取消 | ❌ 无中断控制 |
| **自定义模型** | ✅ 任何 OpenAI 兼容 API | ❌ 仅限内置模型 |
| **本地模式** | ✅ 离线工作，无需账号 | ❌ 需要账号和网络 |
| **API 控制** | ✅ 完全控制端点、密钥 | ❌ 仅平台管理 |
| **重试逻辑** | ✅ 可配置自动重试 | ❌ 仅手动重试 |
| **流式响应** | ✅ 实时流式响应 | ❌ 不支持 |
| **开源** | ✅ MIT 许可证，可自托管 | ❌ 专有平台 |
| **成本** | ✅ 仅 AI API 成本 | ❌ 平台 + AI 成本 |
| **隐私** | ✅ 你的数据，你的服务器 | ❌ 数据在平台服务器 |

---

## 使用场景

### 1. 内容生成与翻译

为营销、文档或本地化项目批量生成或翻译内容。

- **示例**：将 1000 条产品描述从中文翻译成英文、日文、韩文等多种语言
- **优势**：支持断点续传，长时间翻译任务可暂停/恢复；自动重试失败项

### 2. 数据丰富与研究

使用 AI 生成的洞察或外部研究增强现有数据集。

- **示例**：使用联网搜索模型（如 Perplexity、Tavily）研究 500 家公司的最新信息
- **优势**：支持联网模型获取实时数据，不限于训练数据

### 3. 批量分类与分析

自动分类或分析大型数据集。

- **示例**：按情感和主题分类 10,000 张客户支持工单
- **优势**：可配置并发以更快处理，带详细错误追踪

### 4. 搜索与检索任务

通过具有网络访问权限的 AI 模型执行批量搜索查询。

- **示例**：收集 100 个热门话题的最新资讯和趋势分析
- **优势**：连接到具有实时互联网访问的模型（不限于训练数据截止日期）

### 5. 自定义 API 处理

通过任何自定义 AI 端点或服务处理数据。

- **示例**：使用本地部署的 LLM、专有 API 或专业 AI 服务
- **优势**：API 配置和提示工程的完全灵活性，支持任何 OpenAI 兼容接口

---

## 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite 5
- **UI 框架**: Tailwind CSS
- **存储方案**: IndexedDB (本地模式) / Supabase (云端模式，可选)
- **图标库**: Lucide React
- **文件处理**: XLSX (Excel), PapaParse (CSV)
- **HTTP 客户端**: Fetch API (支持流式响应)

---

## 快速开始

### 环境要求

- Node.js 18+ 和 npm
- （可选）Supabase 账号，用于云同步功能

### 1. 克隆仓库

```bash
git clone https://github.com/yourusername/ai-batch-processor.git
cd ai-batch-processor
```

### 2. 安装依赖

```bash
npm install
```

### 3. 启动开发服务器

```bash
npm run dev
```

应用程序将在 `http://localhost:5173` 运行

**就这样！** 应用开箱即用，默认使用本地存储（IndexedDB），你的数据完全存储在浏览器中。

---

## 配置说明

### 环境变量配置

创建 `.env` 文件来自定义应用行为（可选）：

```env
# ==================== 存储模式配置 ====================
# 选项：'local' (默认) 或 'supabase'
# - local: 使用浏览器 IndexedDB，数据存储在本地，支持离线工作
# - supabase: 使用 Supabase 云存储，支持多设备同步
VITE_STORAGE_MODE=local

# ==================== Supabase 配置 ====================
# 仅当 VITE_STORAGE_MODE=supabase 时需要
# 在 https://app.supabase.com/project/_/settings/api 获取
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# ==================== 默认 API 配置 ====================
# 这些值将预填充到 API 配置表单中，用户仍可在界面中修改
# 适合团队统一配置，节省重复配置时间

# API 端点地址
VITE_DEFAULT_API_BASE_URL=https://api.openai.com/v1

# API 密钥
VITE_DEFAULT_API_KEY=

# 默认模型名称
VITE_DEFAULT_MODEL=gpt-3.5-turbo

# 默认提示词模板（支持 {列名} 占位符）
VITE_DEFAULT_PROMPT_TEMPLATE=
```

### 存储模式详解

#### 本地模式 (local) - 默认推荐

- **数据存储**: 浏览器 IndexedDB
- **优势**:
  - 完全离线工作
  - 无需账号注册
  - 数据完全本地化，隐私性最高
  - 零配置，开箱即用
- **限制**:
  - 数据仅存储在当前浏览器
  - 清除浏览器数据会丢失
  - 不支持多设备同步

#### 云端模式 (supabase)

- **数据存储**: Supabase 云数据库
- **优势**:
  - 多设备数据同步
  - 数据持久化存储
  - 支持团队协作
- **配置步骤**:
  1. 在 [supabase.com](https://supabase.com) 创建项目（免费套餐可用）
  2. 复制项目 URL 和 Anon Key
  3. 在 Supabase 控制台 > SQL 编辑器中执行迁移文件：
     - `supabase/migrations/20251024030108_create_batch_processing_schema.sql`
     - `supabase/migrations/20251024034917_add_column_order_and_filters.sql`
  4. 在 `.env` 中配置 `VITE_STORAGE_MODE=supabase`

### 默认 API 配置说明

配置默认 API 参数可以：

1. **节省时间** - 新建项目时自动填充常用配置
2. **团队标准化** - 确保团队使用统一的 API 配置
3. **保持灵活性** - 用户仍可在界面中随时修改

示例配置：

```env
# 使用 OpenAI GPT-4
VITE_DEFAULT_API_BASE_URL=https://api.openai.com/v1
VITE_DEFAULT_API_KEY=sk-your-openai-key
VITE_DEFAULT_MODEL=gpt-4
VITE_DEFAULT_PROMPT_TEMPLATE=请将以下内容翻译成英文：{content}

# 或使用本地 Ollama
VITE_DEFAULT_API_BASE_URL=http://localhost:11434/v1
VITE_DEFAULT_MODEL=llama2
VITE_DEFAULT_PROMPT_TEMPLATE=Summarize: {text}
```

---

## 使用指南

### 1. 创建项目

1. 点击"创建新项目"按钮
2. 输入项目名称（必填）和描述（可选）
3. 点击确认创建
<img width="2913" height="1512" alt="image" src="https://github.com/user-attachments/assets/8aaa8a47-13fb-4095-b493-50c2eab09e8f" />

### 2. 上传数据文件

1. 在项目详情页，点击"上传文件"
2. 选择 Excel (.xlsx, .xls) 或 CSV 文件
3. 系统自动解析文件：
   - 第一行作为表头（列名）
   - 后续行作为数据行
4. 数据显示在表格视图中，可以查看和编辑

**文件格式要求**：
- Excel: `.xlsx` 或 `.xls` 格式
- CSV: UTF-8 编码，逗号分隔
- 第一行必须是表头
- 建议单次上传不超过 10000 行

### 3. 配置 API 设置

点击"API 配置"，填写以下信息：

#### 基础配置

- **基础 URL**: API 端点地址
  - OpenAI: `https://api.openai.com/v1`
  - Azure OpenAI: `https://your-resource.openai.azure.com/openai/deployments/your-deployment`
  - 本地 Ollama: `http://localhost:11434/v1`
  - 自定义端点: 任何 OpenAI 兼容的 API

- **API 密钥**: 认证密钥（如使用本地模型可留空）

- **模型名称**: 要使用的模型
  - OpenAI: `gpt-4`, `gpt-3.5-turbo`
  - Ollama: `llama2`, `mistral`
  - 自定义模型名称

- **提示词模板**: 使用 `{列名}` 引用表格列的值
  - 示例 1: `将以下内容翻译成英文：{content}`
  - 示例 2: `请分析以下公司的业务模式：公司名称：{company_name}，行业：{industry}`
  - 示例 3: `根据以下信息生成产品描述：标题：{title}，特点：{features}`

#### 高级配置

- **并发数** (1-10): 同时处理的任务数量
  - 建议值: 3-5（取决于 API 速率限制）
  - 较高值 = 更快处理，但可能触发速率限制

- **重试次数** (0-5): 请求失败时的重试次数
  - 建议值: 2-3
  - 使用指数退避策略自动延迟重试

- **超时时间** (秒): 单个请求的最大等待时间
  - 默认: 120 秒
  - 根据模型响应速度调整（复杂任务可增加）

- **流式模式**: 启用后实时显示 AI 生成内容
  - 推荐开启，获得更好的用户体验

- **过滤思考标签**: 自动移除 `<think>...</think>` 内容
  - 某些模型（如 DeepSeek）会生成思考过程标签

### 4. 开始处理

有两种处理方式：

#### 方式 1: 全量处理

点击"全量处理"按钮，处理所有"待处理"状态的行

#### 方式 2: 部分处理

1. 点击"生成 X 个结果"按钮
2. 输入要处理的行数
3. 系统按顺序处理指定数量的待处理行

#### 处理过程中

- **实时进度**: 显示已完成/总任务数、成功/失败数
- **控制按钮**:
  - **暂停**: 暂停当前处理，可稍后恢复
  - **恢复**: 继续处理剩余任务
  - **取消**: 停止处理，重置所有"处理中"状态

### 5. 查看和编辑结果

- **查看结果**: 每行的处理结果显示在 `result` 列
- **查看错误**: 失败的行显示错误信息在 `error` 列
- **编辑单元格**: 点击任意单元格可查看和编辑完整内容
- **状态标识**:
  - 🟡 待处理
  - 🔵 处理中
  - 🟢 成功
  - 🔴 失败

### 6. 重新处理失败任务

1. 选择要重新处理的行（可多选）
2. 点击"重置选中行"按钮
3. 选中行的状态重置为"待处理"，结果和错误信息清空
4. 重新开始处理

### 7. 处理卡住的任务

如果任务意外中断，导致某些行卡在"处理中"状态：

1. 点击"重置卡住任务"按钮
2. 所有"处理中"状态的行自动重置为"待处理"
3. 重新开始处理

### 8. 导出结果

点击"导出"按钮，将处理结果下载为 Excel 文件：
- 保持原始列顺序
- 包含所有原始列和结果列
- 文件名格式: `项目名称_导出_时间戳.xlsx`

---

## 项目结构

```
ai-batch-processor/
├── src/
│   ├── components/              # React 组件
│   │   ├── APIConfiguration.tsx    # API 配置表单
│   │   ├── CellEditModal.tsx       # 单元格编辑弹窗
│   │   ├── ExecutionControls.tsx   # 执行控制（开始/暂停/取消）
│   │   ├── FileUpload.tsx          # 文件上传组件
│   │   ├── ProjectDetail.tsx       # 项目详情页
│   │   ├── ProjectList.tsx         # 项目列表页
│   │   └── SpreadsheetView.tsx     # 表格视图组件
│   │
│   ├── services/                # 业务逻辑服务
│   │   ├── batchProcessor.ts       # 批处理核心逻辑
│   │   ├── database.ts             # 数据库服务接口
│   │   ├── localStorage.ts         # IndexedDB 本地存储实现
│   │   ├── fileParser.ts           # 文件解析（Excel/CSV）
│   │   └── openaiClient.ts         # OpenAI API 客户端
│   │
│   ├── lib/                     # 工具函数库
│   │   └── supabase.ts             # Supabase 客户端配置
│   │
│   ├── App.tsx                  # 主应用组件
│   ├── main.tsx                 # 应用入口
│   └── index.css                # 全局样式
│
├── supabase/
│   └── migrations/              # 数据库迁移文件
│       ├── 20251024030108_create_batch_processing_schema.sql
│       └── 20251024034917_add_column_order_and_filters.sql
│
├── public/                      # 静态资源
├── .env.example                 # 环境变量示例
├── package.json                 # 项目依赖
├── tsconfig.json                # TypeScript 配置
├── vite.config.ts               # Vite 配置
└── tailwind.config.js           # Tailwind CSS 配置
```

---

## 二次开发指南

### 开发环境搭建

```bash
# 克隆项目
git clone https://github.com/yourusername/ai-batch-processor.git
cd ai-batch-processor

# 安装依赖
npm install

# 启动开发服务器（带热更新）
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# TypeScript 类型检查
npm run typecheck

# ESLint 代码检查
npm run lint
```

### 核心模块说明

#### 1. 数据存储服务 (`services/database.ts`)

提供统一的数据存储接口，自动根据配置切换本地/云端存储：

```typescript
// 项目服务
projectService.getAll()          // 获取所有项目
projectService.getById(id)       // 获取单个项目
projectService.create(name, desc) // 创建项目
projectService.update(id, data)  // 更新项目
projectService.delete(id)        // 删除项目

// 表格数据服务
spreadsheetService.getByProjectId(projectId)  // 获取项目数据
spreadsheetService.bulkInsert(rows)           // 批量插入
spreadsheetService.updateRow(id, updates)     // 更新单行
spreadsheetService.resetProcessingTasks()     // 重置处理中任务

// 配置服务
configService.getByProjectId(projectId)       // 获取配置
configService.createOrUpdate(config)          // 创建或更新配置

// 执行记录服务
executionService.create(projectId, total)     // 创建执行记录
executionService.update(id, updates)          // 更新执行记录
```

#### 2. 批处理器 (`services/batchProcessor.ts`)

核心批处理逻辑，支持并发控制、重试、流式响应：

```typescript
class BatchProcessor {
  // 启动批处理
  async start(
    rows: SpreadsheetRow[],
    config: TaskConfig,
    onProgress: (stats: ProcessingStats) => void
  ): Promise<void>

  // 暂停处理
  pause(): void

  // 恢复处理
  resume(): void

  // 取消处理
  cancel(): void

  // 获取当前状态
  getStatus(): ProcessingStatus
}
```

**关键特性**：
- 并发控制：使用信号量限制同时执行的任务数
- 自动重试：指数退避策略
- 流式处理：支持 Server-Sent Events (SSE)
- 状态管理：实时更新处理进度

#### 3. OpenAI 客户端 (`services/openaiClient.ts`)

封装 OpenAI API 调用，支持流式和非流式模式：

```typescript
interface OpenAIClientConfig {
  baseUrl: string
  apiKey: string
  modelName: string
  timeout: number
  isStreaming: boolean
}

class OpenAIClient {
  // 发送聊天请求
  async chat(
    messages: ChatMessage[],
    onChunk?: (chunk: string) => void
  ): Promise<string>
}
```

#### 4. 文件解析器 (`services/fileParser.ts`)

解析 Excel 和 CSV 文件：

```typescript
interface ParsedData {
  headers: string[]
  rows: Record<string, string>[]
}

// 解析 Excel
async function parseExcel(file: File): Promise<ParsedData>

// 解析 CSV
async function parseCSV(file: File): Promise<ParsedData>
```

### 扩展功能示例

#### 添加新的 AI 提供商

1. 在 `services/` 下创建新的客户端文件（如 `anthropicClient.ts`）
2. 实现统一的接口：

```typescript
export class AnthropicClient {
  async chat(messages: ChatMessage[]): Promise<string> {
    // 实现 Anthropic API 调用
  }
}
```

3. 在 `batchProcessor.ts` 中添加提供商选择逻辑

#### 添加自定义数据转换

在 `services/dataTransform.ts` 中添加转换逻辑：

```typescript
export function transformData(
  row: Record<string, string>,
  template: string
): string {
  // 自定义数据转换逻辑
  return template.replace(/{(\w+)}/g, (_, key) => row[key] || '')
}
```

#### 添加新的存储后端

1. 在 `services/` 下创建新的存储实现（如 `mongoStorage.ts`）
2. 实现 database.ts 中定义的接口
3. 在 `database.ts` 中添加存储模式选择

### 数据库架构（Supabase 模式）

#### projects 表

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  column_order TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### spreadsheet_data 表

```sql
CREATE TABLE spreadsheet_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  row_number INTEGER NOT NULL,
  columns JSONB NOT NULL,
  result TEXT DEFAULT '',
  status TEXT DEFAULT 'pending',
  error_message TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### task_configurations 表

```sql
CREATE TABLE task_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  base_url TEXT DEFAULT 'https://api.openai.com/v1',
  api_key TEXT DEFAULT '',
  model_name TEXT DEFAULT 'gpt-3.5-turbo',
  prompt_template TEXT DEFAULT '',
  concurrency INTEGER DEFAULT 3,
  retry_count INTEGER DEFAULT 2,
  timeout_seconds INTEGER DEFAULT 120,
  is_streaming BOOLEAN DEFAULT true,
  filter_think_tags BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### task_executions 表

```sql
CREATE TABLE task_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  total_tasks INTEGER DEFAULT 0,
  completed_tasks INTEGER DEFAULT 0,
  failed_tasks INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);
```

---

## API 文档

### OpenAI 兼容接口说明

本应用使用标准的 OpenAI Chat Completion API 格式，支持任何兼容该格式的服务。

#### 请求格式

```http
POST {base_url}/chat/completions
Content-Type: application/json
Authorization: Bearer {api_key}

{
  "model": "gpt-3.5-turbo",
  "messages": [
    {
      "role": "user",
      "content": "你的提示词"
    }
  ],
  "stream": true  // 可选，启用流式响应
}
```

#### 响应格式（非流式）

```json
{
  "id": "chatcmpl-123",
  "object": "chat.completion",
  "created": 1677652288,
  "model": "gpt-3.5-turbo",
  "choices": [{
    "index": 0,
    "message": {
      "role": "assistant",
      "content": "AI 生成的响应内容"
    },
    "finish_reason": "stop"
  }]
}
```

#### 响应格式（流式）

```
data: {"choices":[{"delta":{"content":"Hello"}}]}
data: {"choices":[{"delta":{"content":" World"}}]}
data: [DONE]
```

### 兼容的 API 提供商

- **OpenAI**: `https://api.openai.com/v1`
- **Azure OpenAI**: `https://{resource}.openai.azure.com/openai/deployments/{deployment}`
- **Ollama**: `http://localhost:11434/v1`
- **LocalAI**: `http://localhost:8080/v1`
- **LM Studio**: `http://localhost:1234/v1`
- **vLLM**: 自定义部署地址
- **其他兼容服务**: 任何实现 OpenAI API 格式的服务

---

## 故障排除

### 1. 应用无法启动

**问题**: 运行 `npm run dev` 后无法访问

**解决方案**:
- 检查端口 5173 是否被占用
- 确保 Node.js 版本 >= 18
- 删除 `node_modules` 和 `package-lock.json`，重新 `npm install`

### 2. 本地存储数据丢失

**问题**: 刷新页面后数据消失

**解决方案**:
- 检查浏览器是否开启了"隐私模式"或"无痕模式"（这些模式不保存 IndexedDB）
- 确认没有清除浏览器数据
- 考虑切换到 Supabase 云存储模式

### 3. Supabase 连接失败

**问题**: 配置 Supabase 后无法连接

**解决方案**:
- 验证 `.env` 中的 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY` 是否正确
- 确认已执行数据库迁移文件
- 检查 Supabase 项目是否处于暂停状态
- 在浏览器控制台查看具体错误信息

### 4. API 请求失败

**问题**: 处理任务时大量失败

**解决方案**:
- **401 Unauthorized**: 检查 API 密钥是否正确
- **429 Too Many Requests**: 降低并发数，或等待速率限制重置
- **超时错误**: 增加超时时间设置
- **网络错误**: 检查 API 端点地址是否可访问
- **CORS 错误**: 确保 API 服务器支持跨域请求

### 5. 文件上传失败

**问题**: 无法上传 Excel 或 CSV 文件

**解决方案**:
- 确保文件格式正确（.xlsx, .xls, .csv）
- 检查文件第一行是否包含表头
- 确认文件不为空
- 尝试重新保存文件（某些文件可能损坏）
- 检查文件大小（建议 < 10MB，< 10000 行）

### 6. 流式响应不工作

**问题**: 启用流式模式后没有实时显示

**解决方案**:
- 确认 API 端点支持 SSE（Server-Sent Events）
- 检查网络环境是否限制了 SSE
- 某些反向代理可能缓冲响应，导致流式失效
- 尝试关闭流式模式使用非流式模式

### 7. 任务卡在"处理中"

**问题**: 部分任务一直显示"处理中"状态

**解决方案**:
- 点击"重置卡住任务"按钮
- 检查是否有网络中断
- 检查浏览器是否进入睡眠状态
- 适当增加超时时间

### 8. 导出功能报错

**问题**: 点击导出后没有响应或报错

**解决方案**:
- 检查浏览器是否阻止了下载
- 确认有足够的磁盘空间
- 尝试使用其他浏览器
- 如果数据量很大，可能需要等待较长时间

### 9. 性能问题

**问题**: 处理大量数据时界面卡顿

**解决方案**:
- 减少并发数（降低浏览器负载）
- 分批处理数据（不要一次处理数万行）
- 使用性能更好的浏览器（推荐 Chrome/Edge）
- 关闭不必要的浏览器标签页

---

## 开发命令

```bash
# 开发
npm run dev              # 启动开发服务器
npm run build            # 构建生产版本
npm run preview          # 预览生产构建

# 代码质量
npm run lint             # ESLint 检查
npm run typecheck        # TypeScript 类型检查

# 依赖管理
npm install              # 安装依赖
npm update               # 更新依赖
npm audit fix            # 修复安全漏洞
```

---

## 常见问题 (FAQ)

### Q: 支持哪些文件格式？

A: 支持 Excel (.xlsx, .xls) 和 CSV (.csv) 文件。CSV 文件需要使用 UTF-8 编码。

### Q: 可以处理多少行数据？

A: 理论上没有限制，但建议：
- 本地模式：< 5000 行（受浏览器内存限制）
- Supabase 模式：< 50000 行（受数据库性能影响）
- 对于更大数据集，建议分批处理

### Q: API 密钥安全吗？

A:
- 本地模式：密钥存储在浏览器 IndexedDB，仅你可访问
- Supabase 模式：密钥存储在数据库，受 RLS 策略保护
- 建议使用具有速率限制的 API 密钥

### Q: 是否支持自定义模型？

A: 支持！只要 API 兼容 OpenAI 格式即可，包括：
- 本地部署的开源模型（Ollama, LocalAI 等）
- 云服务商的模型（Azure, AWS Bedrock 等）
- 自建的 API 服务

### Q: 可以同时处理多个项目吗？

A: 可以创建多个项目，但同一时间只能处理一个项目的任务。

### Q: 如何备份数据？

A:
- 本地模式：使用浏览器的"导出"功能定期备份
- Supabase 模式：数据自动保存在云端，可通过 Supabase 控制台导出

### Q: 支持哪些浏览器？

A: 推荐使用现代浏览器：
- Chrome / Edge 90+
- Firefox 88+
- Safari 14+

---

## 贡献指南

欢迎贡献代码、报告问题或提出建议！

### 报告 Bug

在 [Issues](https://github.com/yourusername/ai-batch-processor/issues) 页面创建新 Issue，请包含：

1. 问题描述
2. 复现步骤
3. 预期行为
4. 实际行为
5. 环境信息（浏览器版本、操作系统等）
6. 截图或错误日志

### 提交代码

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 开发规范

- 使用 TypeScript 类型注解
- 遵循 ESLint 规则
- 组件使用函数式组件 + Hooks
- 提交信息使用清晰的描述

---

## 路线图

### 近期计划 (v1.1)

- [ ] 批量编辑单元格
- [ ] 数据过滤和排序
- [ ] 导出为 CSV 格式
- [ ] 更多列类型支持

### 中期计划 (v1.5)

- [ ] 用户认证系统
- [ ] 团队协作功能
- [ ] API 使用统计和成本估算
- [ ] 定时任务支持
- [ ] Webhook 通知

### 长期计划 (v2.0)

- [ ] 插件系统
- [ ] 更多 AI 提供商集成
- [ ] 数据可视化
- [ ] API 速率限制智能调度
- [ ] 移动端适配

---

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

MIT 许可证允许你：
- ✅ 商业使用
- ✅ 修改源代码
- ✅ 分发
- ✅ 私用

唯一要求：保留原作者的版权声明。

---

## 致谢

本项目使用以下优秀的开源技术：

- [React](https://reactjs.org/) - UI 框架
- [TypeScript](https://www.typescriptlang.org/) - 类型安全
- [Vite](https://vitejs.dev/) - 构建工具
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [Supabase](https://supabase.com/) - 后端服务
- [Lucide](https://lucide.dev/) - 图标库
- [XLSX](https://sheetjs.com/) - Excel 处理
- [PapaParse](https://www.papaparse.com/) - CSV 解析

---

## 支持

如需帮助或有任何疑问：

1. 📖 查看[使用指南](#使用指南)和[故障排除](#故障排除)
2. 🔍 搜索[已有 Issues](https://github.com/lijiajun1997/AIBatchProcessor/issues)
3. 💬 创建[新 Issue](https://github.com/lijiajun1997/AIBatchProcessor/issues/new)
4. 📧 发送邮件至: lijiajun@zhituxueban.com

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给个 Star！⭐**

用 ❤️ 打造 | [报告 Bug](https://github.com/lijiajun1997/AIBatchProcessor/issues) · [请求功能](https://github.com/lijiajun1997/AIBatchProcessor/issues)

</div>
