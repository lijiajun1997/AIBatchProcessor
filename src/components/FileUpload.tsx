import { useRef, useState } from 'react';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { parseCSV, parseExcel, ParsedData } from '../services/fileParser';

interface FileUploadProps {
  onDataParsed: (data: ParsedData) => void;
}

export const FileUpload = ({ onDataParsed }: FileUploadProps) => {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const isCSV = fileName.endsWith('.csv');
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

    if (!isCSV && !isExcel) {
      alert('请上传 CSV 或 Excel 文件');
      return;
    }

    try {
      setUploading(true);
      const data = isCSV ? await parseCSV(file) : await parseExcel(file);
      onDataParsed(data);
    } catch (error) {
      console.error('Failed to parse file:', error);
      alert('文件解析失败。请检查文件格式。');
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
        dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={handleFileSelect}
        className="hidden"
      />

      <FileSpreadsheet size={48} className="mx-auto text-gray-400 mb-4" />

      {uploading ? (
        <p className="text-gray-600 mb-4">正在处理文件...</p>
      ) : (
        <>
          <p className="text-gray-600 mb-2">将 Excel 或 CSV 文件拖放到此处</p>
          <p className="text-gray-400 text-sm mb-4">或</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Upload size={20} />
            浏览文件
          </button>
          <p className="text-gray-400 text-xs mt-4">支持格式：CSV、XLSX、XLS</p>
        </>
      )}
    </div>
  );
};
