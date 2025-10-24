import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Database } from 'lucide-react';
import { FileUpload } from './FileUpload';
import { SpreadsheetView } from './SpreadsheetView';
import { APIConfiguration } from './APIConfiguration';
import { ExecutionControls } from './ExecutionControls';
import {
  projectService,
  spreadsheetService,
  configService,
  Project,
  SpreadsheetRow,
  TaskConfig
} from '../services/database';
import { ParsedData, exportToCSV, exportToExcel } from '../services/fileParser';
import { BatchProcessor, ProcessingStats } from '../services/batchProcessor';

interface ProjectDetailProps {
  projectId: string;
  onBack: () => void;
}

export const ProjectDetail = ({ projectId, onBack }: ProjectDetailProps) => {
  const [project, setProject] = useState<Project | null>(null);
  const [rows, setRows] = useState<SpreadsheetRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [config, setConfig] = useState<TaskConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ProcessingStats>({
    total: 0,
    completed: 0,
    failed: 0,
    processing: 0,
    queued: 0
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const processorRef = useRef<BatchProcessor | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadProjectData();

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [projectId]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      const [projectData, rowsData, configData] = await Promise.all([
        projectService.getById(projectId),
        spreadsheetService.getByProjectId(projectId),
        configService.getByProjectId(projectId)
      ]);

      setProject(projectData);
      setRows(rowsData);
      setConfig(configData);

      if (projectData && projectData.column_order && projectData.column_order.length > 0) {
        setHeaders(projectData.column_order);
      } else if (rowsData.length > 0 && rowsData[0].columns) {
        setHeaders(Object.keys(rowsData[0].columns));
      }

      updateStats(rowsData);
    } catch (error) {
      console.error('Failed to load project data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (rowsData: SpreadsheetRow[]) => {
    setStats({
      total: rowsData.length,
      completed: rowsData.filter(r => r.status === 'completed').length,
      failed: rowsData.filter(r => r.status === 'failed').length,
      processing: rowsData.filter(r => r.status === 'processing').length,
      queued: rowsData.filter(r => r.status === 'pending' || r.status === 'failed').length
    });
  };

  const startRefreshInterval = () => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    refreshIntervalRef.current = setInterval(async () => {
      const rowsData = await spreadsheetService.getByProjectId(projectId);
      setRows(prevRows => {
        const hasChanges = JSON.stringify(prevRows) !== JSON.stringify(rowsData);
        return hasChanges ? rowsData : prevRows;
      });
    }, 1000);
  };

  const stopRefreshInterval = () => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  };

  const handleDataParsed = async (data: ParsedData) => {
    try {
      await spreadsheetService.deleteByProjectId(projectId);

      const rowsToInsert = data.rows.map((row, idx) => ({
        project_id: projectId,
        row_number: idx + 1,
        columns: row
      }));

      const insertedRows = await spreadsheetService.bulkInsert(rowsToInsert);

      await projectService.update(projectId, {
        column_order: data.headers
      });

      setRows(insertedRows);
      setHeaders(data.headers);
      updateStats(insertedRows);
    } catch (error) {
      console.error('Failed to save spreadsheet data:', error);
      alert('保存表格数据失败');
    }
  };

  const handleSaveConfig = async (configUpdate: Partial<TaskConfig>) => {
    try {
      const savedConfig = await configService.createOrUpdate({
        ...configUpdate,
        project_id: projectId
      });
      setConfig(savedConfig);
    } catch (error) {
      console.error('Failed to save configuration:', error);
      alert('Failed to save configuration');
    }
  };

  const handleGenerate = async (count?: number) => {
    if (!config) {
      alert('请先配置 API 设置');
      return;
    }

    if (!config.api_key) {
      alert('请输入 API 密钥');
      return;
    }

    if (!config.prompt_template) {
      alert('请输入提示词模板');
      return;
    }

    try {
      setIsProcessing(true);
      setIsPaused(false);

      processorRef.current = new BatchProcessor(config, (newStats) => {
        setStats(newStats);
      });

      startRefreshInterval();

      await processorRef.current.processRows(rows, count);

      stopRefreshInterval();
      const rowsData = await spreadsheetService.getByProjectId(projectId);
      setRows(rowsData);
      updateStats(rowsData);
    } catch (error) {
      console.error('Processing error:', error);
      alert('处理错误：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsProcessing(false);
      setIsPaused(false);
      processorRef.current = null;
    }
  };

  const handlePause = () => {
    if (processorRef.current) {
      processorRef.current.pause();
      setIsPaused(true);
    }
  };

  const handleResume = () => {
    if (processorRef.current) {
      processorRef.current.resume();
      setIsPaused(false);
    }
  };

  const handleCancel = async () => {
    if (processorRef.current) {
      await processorRef.current.cancel();
      setIsProcessing(false);
      setIsPaused(false);
      processorRef.current = null;
      stopRefreshInterval();
      const rowsData = await spreadsheetService.getByProjectId(projectId);
      setRows(rowsData);
      updateStats(rowsData);
    }
  };

  const handleResetProcessing = async () => {
    if (!confirm('确定要重置所有"处理中"状态的任务吗？这些任务将被标记为"待处理"。')) return;

    try {
      await spreadsheetService.resetProcessingTasks(projectId);
      const rowsData = await spreadsheetService.getByProjectId(projectId);
      setRows(rowsData);
      updateStats(rowsData);
    } catch (error) {
      console.error('Failed to reset processing tasks:', error);
      alert('重置任务失败');
    }
  };

  const handleResetSelectedTasks = async (ids: string[]) => {
    try {
      await spreadsheetService.resetSelectedTasks(ids);
      const rowsData = await spreadsheetService.getByProjectId(projectId);
      setRows(rowsData);
      updateStats(rowsData);
    } catch (error) {
      console.error('Failed to reset selected tasks:', error);
      alert('重置选中任务失败');
    }
  };

  const handleUpdateCell = async (rowId: string, field: string, value: string) => {
    try {
      const row = rows.find(r => r.id === rowId);
      if (!row) return;

      if (field === 'result') {
        await spreadsheetService.updateRowData(rowId, { result: value });
      } else if (field === 'error_message') {
        await spreadsheetService.updateRowData(rowId, { error_message: value });
      } else if (field.startsWith('column_')) {
        const columnName = field.replace('column_', '');
        const updatedColumns = { ...row.columns, [columnName]: value };
        await spreadsheetService.updateRowData(rowId, { columns: updatedColumns });
      }

      const rowsData = await spreadsheetService.getByProjectId(projectId);
      setRows(rowsData);
    } catch (error) {
      console.error('Failed to update cell:', error);
      alert('更新单元格失败');
    }
  };

  const handleExport = () => {
    if (rows.length === 0) return;

    const allHeaders = [...headers, 'result', 'status', 'error_message'];
    const exportRows = rows.map(row => ({
      ...row.columns,
      result: row.result,
      status: row.status,
      error_message: row.error_message
    }));

    const filename = `${project?.name || 'export'}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    exportToExcel(allHeaders, exportRows, filename);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">项目未找到</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full px-6 py-8">
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            返回项目列表
          </button>
          <div className="flex items-center gap-3">
            <Database size={32} className="text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
              {project.description && (
                <p className="text-gray-600 mt-1">{project.description}</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {rows.length === 0 ? (
            <FileUpload onDataParsed={handleDataParsed} />
          ) : (
            <>
              <ExecutionControls
                stats={stats}
                isProcessing={isProcessing}
                isPaused={isPaused}
                onGenerate={handleGenerate}
                onPause={handlePause}
                onResume={handleResume}
                onCancel={handleCancel}
                onExport={handleExport}
                onResetProcessing={handleResetProcessing}
                hasData={rows.length > 0}
              />

              <APIConfiguration
                config={config}
                headers={headers}
                onSave={handleSaveConfig}
              />

              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    表格数据 ({rows.length} 行)
                  </h2>
                  <button
                    onClick={() => {
                      if (confirm('这将删除所有当前数据。确定吗？')) {
                        handleDataParsed({ headers: [], rows: [] });
                      }
                    }}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    上传新文件
                  </button>
                </div>
                <SpreadsheetView
                  rows={rows}
                  headers={headers}
                  onResetSelected={handleResetSelectedTasks}
                  onUpdateCell={handleUpdateCell}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
