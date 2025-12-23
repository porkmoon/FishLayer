import React, { useState, useEffect } from 'react';

function BrowserWindow() {
  const [capturing, setCapturing] = useState(false);
  const [message, setMessage] = useState('');
  const [opacity, setOpacity] = useState(100);

  // 加载透明度设置
  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.getBrowserOpacity().then((savedOpacity) => {
        setOpacity(savedOpacity);
      });
    }
  }, []);

  const handleCapture = async () => {
    console.log('🔵 开始抓取...');
    setCapturing(true);
    setMessage('正在抓取页面内容，请稍候...');

    if (window.electronAPI) {
      try {
        const result = await window.electronAPI.browserCaptureContent();
        console.log('🔵 抓取结果:', result);

        if (result.success) {
          setMessage(`✓ 抓取成功：${result.title}`);

          setTimeout(async () => {
            console.log('🔵 打开小说窗口...');
            try {
              await window.electronAPI.openNovelWindow();
              setMessage('');
            } catch (err) {
              console.error('🔴 打开窗口失败:', err);
              setMessage(`⚠️ 打开窗口失败: ${err.message}`);
            }
          }, 1000);
        } else {
          console.error('🔴 抓取失败:', result.error);
          setMessage(`⚠️ 抓取失败: ${result.error}`);
          // 错误信息保持显示，不自动清除
        }
      } catch (err) {
        console.error('🔴 抓取异常:', err);
        setMessage(`⚠️ 抓取异常: ${err.message}`);
        // 错误信息保持显示，不自动清除
      }
    } else {
      setMessage('⚠️ electronAPI 未找到');
    }

    setCapturing(false);
  };

  const handleOpacityChange = (value) => {
    const newValue = Math.max(30, Math.min(100, parseInt(value)));
    setOpacity(newValue);

    if (window.electronAPI) {
      window.electronAPI.setBrowserOpacity(newValue);
    }
  };

  const handleGoBack = () => {
    if (window.electronAPI) {
      window.electronAPI.browserGoBack();
    }
  };

  const handleGoForward = () => {
    if (window.electronAPI) {
      window.electronAPI.browserGoForward();
    }
  };

  const handleReload = () => {
    if (window.electronAPI) {
      window.electronAPI.browserReload();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-fish-dark text-white">
      {/* 工具栏 */}
      <div className="h-[60px] bg-fish-gray border-b border-fish-green/20 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <button
            onClick={handleGoBack}
            className="px-3 py-2 bg-fish-dark hover:bg-fish-green/10 rounded transition-colors"
            title="后退"
          >
            ←
          </button>
          <button
            onClick={handleGoForward}
            className="px-3 py-2 bg-fish-dark hover:bg-fish-green/10 rounded transition-colors"
            title="前进"
          >
            →
          </button>
          <button
            onClick={handleReload}
            className="px-3 py-2 bg-fish-dark hover:bg-fish-green/10 rounded transition-colors"
            title="刷新"
          >
            ⟳
          </button>
        </div>

        <div className="flex-1 mx-4 flex items-center gap-4">
          <div className="flex-1 px-4 py-2 bg-fish-dark rounded text-sm text-gray-400">
            📖 浏览微信读书，找到章节后点击"抓取"
          </div>

          {/* 透明度控制 */}
          <div className="flex items-center gap-2 px-3 py-2 bg-fish-dark rounded">
            <span className="text-xs text-gray-400">透明度</span>
            <span className="text-xs text-fish-green font-bold w-8">
              {opacity}%
            </span>
            <input
              type="range"
              min="30"
              max="100"
              value={opacity}
              onChange={(e) => handleOpacityChange(e.target.value)}
              className="w-24 h-1"
            />
          </div>
        </div>

        <button
          onClick={handleCapture}
          disabled={capturing}
          className="px-6 py-2 bg-fish-green text-fish-dark font-bold rounded-lg hover:bg-fish-green/80 transition-all disabled:opacity-50"
        >
          {capturing ? '抓取中...' : '📖 抓取当前页'}
        </button>
      </div>

      {/* 消息提示 */}
      {message && (
        <div
          className={`px-4 py-2 flex items-center justify-between text-sm ${
            message.startsWith('✓')
              ? 'bg-fish-green/20 text-fish-green'
              : message.startsWith('正在')
              ? 'bg-blue-500/20 text-blue-400'
              : 'bg-red-500/20 text-red-400'
          }`}
        >
          <span>{message}</span>
          {!capturing && (
            <button
              onClick={() => setMessage('')}
              className="ml-4 px-2 py-1 hover:opacity-70"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* BrowserView显示区域 */}
      <div className="flex-1 bg-white">{/* 这个区域会被BrowserView覆盖 */}</div>
    </div>
  );
}

export default BrowserWindow;
