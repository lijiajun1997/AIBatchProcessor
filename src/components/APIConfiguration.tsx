import { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { TaskConfig } from '../services/database';

interface APIConfigurationProps {
  config: TaskConfig | null;
  headers: string[];
  onSave: (config: Partial<TaskConfig>) => void;
}

export const APIConfiguration = ({ config, headers, onSave }: APIConfigurationProps) => {
  const [baseUrl, setBaseUrl] = useState(
    import.meta.env.VITE_DEFAULT_API_BASE_URL || 'https://api.openai.com/v1'
  );
  const [apiKey, setApiKey] = useState(
    import.meta.env.VITE_DEFAULT_API_KEY || ''
  );
  const [modelName, setModelName] = useState(
    import.meta.env.VITE_DEFAULT_MODEL || 'gpt-3.5-turbo'
  );
  const [promptTemplate, setPromptTemplate] = useState(
    import.meta.env.VITE_DEFAULT_PROMPT_TEMPLATE || ''
  );
  const [concurrency, setConcurrency] = useState(3);
  const [retryCount, setRetryCount] = useState(2);
  const [timeoutSeconds, setTimeoutSeconds] = useState(120);
  const [isStreaming, setIsStreaming] = useState(true);
  const [filterThinkTags, setFilterThinkTags] = useState(true);

  useEffect(() => {
    if (config) {
      setBaseUrl(config.base_url);
      setApiKey(config.api_key);
      setModelName(config.model_name);
      setPromptTemplate(config.prompt_template);
      setConcurrency(config.concurrency);
      setRetryCount(config.retry_count);
      setTimeoutSeconds(config.timeout_seconds);
      setIsStreaming(config.is_streaming);
      setFilterThinkTags(config.filter_think_tags);
    }
  }, [config]);

  const handleSave = () => {
    onSave({
      base_url: baseUrl,
      api_key: apiKey,
      model_name: modelName,
      prompt_template: promptTemplate,
      concurrency,
      retry_count: retryCount,
      timeout_seconds: timeoutSeconds,
      is_streaming: isStreaming,
      filter_think_tags: filterThinkTags
    });
  };

  const insertPlaceholder = (header: string) => {
    const textarea = document.getElementById('prompt-template') as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = promptTemplate;
    const before = text.substring(0, start);
    const after = text.substring(end);
    const newText = before + `{${header}}` + after;
    setPromptTemplate(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + header.length + 2, start + header.length + 2);
    }, 0);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings size={24} className="text-gray-700" />
        <h2 className="text-xl font-bold text-gray-900">API 配置</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            基础 URL
          </label>
          <input
            type="text"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://api.openai.com/v1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            API 密钥
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="sk-..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            模型名称
          </label>
          <input
            type="text"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="gpt-3.5-turbo"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            超时时间（秒）
          </label>
          <input
            type="number"
            value={timeoutSeconds}
            onChange={(e) => setTimeoutSeconds(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="10"
            max="300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            并发数 (1-10)
          </label>
          <input
            type="range"
            value={concurrency}
            onChange={(e) => setConcurrency(Number(e.target.value))}
            className="w-full"
            min="1"
            max="10"
          />
          <div className="text-center text-sm text-gray-600 mt-1">{concurrency}</div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            重试次数 (0-5)
          </label>
          <input
            type="range"
            value={retryCount}
            onChange={(e) => setRetryCount(Number(e.target.value))}
            className="w-full"
            min="0"
            max="5"
          />
          <div className="text-center text-sm text-gray-600 mt-1">{retryCount}</div>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center gap-4 mb-2">
          <label className="block text-sm font-medium text-gray-700">
            提示词模板
          </label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isStreaming}
                onChange={(e) => setIsStreaming(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">使用流式模式</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={filterThinkTags}
                onChange={(e) => setFilterThinkTags(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">过滤思考内容 (&lt;think&gt;)</span>
            </label>
          </div>
        </div>
        <textarea
          id="prompt-template"
          value={promptTemplate}
          onChange={(e) => setPromptTemplate(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          rows={6}
          placeholder="输入您的提示词模板。使用 {列名} 来插入表格中的值。"
        />
        {headers.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-gray-500 mb-2">
              点击插入列占位符：
            </p>
            <div className="flex flex-wrap gap-2">
              {headers.map((header) => (
                <button
                  key={header}
                  onClick={() => insertPlaceholder(header)}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-md transition-colors"
                >
                  {`{${header}}`}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          保存配置
        </button>
      </div>
    </div>
  );
};
