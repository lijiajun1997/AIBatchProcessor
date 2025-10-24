import { Play, Pause, Square, Download, RotateCcw } from 'lucide-react';
import { ProcessingStats } from '../services/batchProcessor';

interface ExecutionControlsProps {
  stats: ProcessingStats;
  isProcessing: boolean;
  isPaused: boolean;
  onGenerate: (count?: number) => void;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
  onExport: () => void;
  onResetProcessing: () => void;
  hasData: boolean;
}

export const ExecutionControls = ({
  stats,
  isProcessing,
  isPaused,
  onGenerate,
  onPause,
  onResume,
  onCancel,
  onExport,
  onResetProcessing,
  hasData
}: ExecutionControlsProps) => {
  const remaining = stats.total - stats.completed - stats.failed;
  const completionRate = stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(1) : '0';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">执行控制</h3>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">总计</div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-xs text-green-700 mb-1">已完成</div>
              <div className="text-2xl font-bold text-green-700">{stats.completed}</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-xs text-blue-700 mb-1">处理中</div>
              <div className="text-2xl font-bold text-blue-700">{stats.processing}</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3">
              <div className="text-xs text-yellow-700 mb-1">排队中</div>
              <div className="text-2xl font-bold text-yellow-700">{stats.queued}</div>
            </div>
            <div className="bg-red-50 rounded-lg p-3">
              <div className="text-xs text-red-700 mb-1">失败</div>
              <div className="text-2xl font-bold text-red-700">{stats.failed}</div>
            </div>
          </div>

          <div className="mb-2">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>进度</span>
              <span>{completionRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:min-w-[200px]">
          {!isProcessing ? (
            <>
              <button
                onClick={() => onGenerate(1)}
                disabled={!hasData || remaining === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Play size={16} />
                生成 1 个结果
              </button>
              <button
                onClick={() => onGenerate(5)}
                disabled={!hasData || remaining === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Play size={16} />
                生成 5 个结果
              </button>
              <button
                onClick={() => onGenerate(remaining)}
                disabled={!hasData || remaining === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Play size={16} />
                生成剩余结果 ({remaining})
              </button>
              <button
                onClick={() => onGenerate()}
                disabled={!hasData || stats.total === 0}
                className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Play size={16} />
                生成全部结果
              </button>
            </>
          ) : (
            <>
              {!isPaused ? (
                <button
                  onClick={onPause}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Pause size={16} />
                  暂停
                </button>
              ) : (
                <button
                  onClick={onResume}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Play size={16} />
                  继续
                </button>
              )}
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <Square size={16} />
                取消
              </button>
            </>
          )}
          <button
            onClick={onExport}
            disabled={!hasData}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Download size={16} />
            导出
          </button>
          {stats.processing > 0 && !isProcessing && (
            <button
              onClick={onResetProcessing}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
              title="重置卡住的处理中任务"
            >
              <RotateCcw size={16} />
              重置卡住任务
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
