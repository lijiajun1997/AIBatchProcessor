import { useState } from 'react';
import { SpreadsheetRow } from '../services/database';
import { CheckCircle, Clock, XCircle, Loader, RotateCcw } from 'lucide-react';
import { CellEditModal } from './CellEditModal';

interface SpreadsheetViewProps {
  rows: SpreadsheetRow[];
  headers: string[];
  onResetSelected: (ids: string[]) => void;
  onUpdateCell: (rowId: string, field: string, value: string) => void;
}

interface EditState {
  rowId: string;
  field: string;
  value: string;
  title: string;
}

export const SpreadsheetView = ({ rows, headers, onResetSelected, onUpdateCell }: SpreadsheetViewProps) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editState, setEditState] = useState<EditState | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'processing':
        return <Loader size={16} className="text-blue-600 animate-spin" />;
      case 'failed':
        return <XCircle size={16} className="text-red-600" />;
      default:
        return <Clock size={16} className="text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1";

    switch (status) {
      case 'completed':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>
          {getStatusIcon(status)} 已完成
        </span>;
      case 'processing':
        return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>
          {getStatusIcon(status)} 处理中
        </span>;
      case 'failed':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>
          {getStatusIcon(status)} 失败
        </span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>
          {getStatusIcon(status)} 待处理
        </span>;
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(rows.map(row => row.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleResetSelected = () => {
    if (selectedIds.size === 0) {
      alert('请先选择要重置的行');
      return;
    }

    if (!confirm(`确定要重置选中的 ${selectedIds.size} 个任务吗？这将清空结果并重新标记为待处理。`)) {
      return;
    }

    onResetSelected(Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  const handleCellClick = (row: SpreadsheetRow, field: string, header?: string) => {
    let value = '';
    let title = '';

    if (field === 'result') {
      value = row.result || '';
      title = '编辑结果';
    } else if (field === 'error_message') {
      value = row.error_message || '';
      title = '编辑错误信息';
    } else if (header) {
      value = row.columns[header] || '';
      title = `编辑 ${header}`;
    }

    setEditState({
      rowId: row.id,
      field,
      value,
      title
    });
  };

  const handleSaveCell = (value: string) => {
    if (!editState) return;
    onUpdateCell(editState.rowId, editState.field, value);
    setEditState(null);
  };

  if (rows.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-gray-500">暂无数据。请上传文件以开始使用。</p>
      </div>
    );
  }

  const allSelected = rows.length > 0 && selectedIds.size === rows.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < rows.length;

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700">
              已选择 <span className="font-semibold">{selectedIds.size}</span> / {rows.length} 行
            </span>
            {selectedIds.size > 0 && (
              <button
                onClick={handleResetSelected}
                className="px-3 py-1.5 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
              >
                <RotateCcw size={14} />
                重置选中任务
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500">点击单元格可查看和编辑内容</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left w-12">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={input => {
                      if (input) {
                        input.indeterminate = someSelected;
                      }
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap w-20">
                  行号
                </th>
                {headers.map((header, idx) => (
                  <th
                    key={idx}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {header}
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[300px]">
                  结果
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap w-32">
                  状态
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[200px]">
                  错误信息
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(row.id)}
                      onChange={(e) => handleSelectRow(row.id, e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                    {row.row_number}
                  </td>
                  {headers.map((header, idx) => (
                    <td
                      key={idx}
                      className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap cursor-pointer hover:bg-blue-50"
                      onClick={() => handleCellClick(row, `column_${header}`, header)}
                      title={`点击编辑: ${row.columns[header] || ''}`}
                    >
                      <div className="max-w-[200px] truncate">
                        {row.columns[header] || '-'}
                      </div>
                    </td>
                  ))}
                  <td
                    className="px-4 py-3 text-sm text-gray-900 cursor-pointer hover:bg-blue-50"
                    onClick={() => handleCellClick(row, 'result')}
                    title="点击编辑结果"
                  >
                    <div className="max-w-[400px] line-clamp-3">
                      {row.result || '-'}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                    {getStatusBadge(row.status)}
                  </td>
                  <td
                    className="px-4 py-3 text-sm text-red-600 cursor-pointer hover:bg-blue-50"
                    onClick={() => handleCellClick(row, 'error_message')}
                    title="点击编辑错误信息"
                  >
                    <div className="max-w-[300px] truncate">
                      {row.error_message || '-'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CellEditModal
        isOpen={editState !== null}
        onClose={() => setEditState(null)}
        onSave={handleSaveCell}
        title={editState?.title || ''}
        initialValue={editState?.value || ''}
      />
    </>
  );
};
