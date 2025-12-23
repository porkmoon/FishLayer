import React, { useState, useEffect } from 'react';

function NovelWindow() {
  const [novel, setNovel] = useState(null);
  const [opacity, setOpacity] = useState(80);
  const [fontSize, setFontSize] = useState(16);

  useEffect(() => {
    if (window.novelAPI) {
      // 加载小说内容
      window.novelAPI
        .getCurrentNovel()
        .then((data) => {
          console.log('加载小说数据:', data);
          if (data) {
            setNovel(data);
          } else {
            console.error('没有小说数据');
          }
        })
        .catch((err) => {
          console.error('加载小说失败:', err);
        });
    } else {
      console.error('novelAPI 不存在');
    }
  }, []);

  const handleClose = () => {
    if (window.novelAPI) {
      window.novelAPI.closeWindow();
    }
  };

  const handleOpacityChange = (value) => {
    const newValue = Math.max(30, Math.min(100, parseInt(value)));
    setOpacity(newValue);
    if (window.novelAPI) {
      window.novelAPI.setOpacity(newValue);
    }
  };

  if (!novel) {
    return (
      <div
        style={{
          width: '100%',
          height: '100vh',
          background: 'rgba(10, 10, 10, 0.95)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>📖</div>
          <div>加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        background: 'rgba(10, 10, 10, 0.95)',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Microsoft YaHei, sans-serif',
      }}
    >
      {/* 顶部工具栏 */}
      <div
        style={{
          height: '40px',
          background: 'rgba(30, 30, 30, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 15px',
          borderBottom: '1px solid rgba(74, 222, 128, 0.2)',
          cursor: 'move',
          WebkitAppRegion: 'drag',
        }}
      >
        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#4ade80' }}>
          📖 {novel.title}
        </div>
        <button
          onClick={handleClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#999',
            fontSize: '20px',
            cursor: 'pointer',
            WebkitAppRegion: 'no-drag',
          }}
          onMouseEnter={(e) => (e.target.style.color = '#fff')}
          onMouseLeave={(e) => (e.target.style.color = '#999')}
        >
          ×
        </button>
      </div>

      {/* 内容区域 */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          fontSize: fontSize + 'px',
          lineHeight: '1.8',
        }}
      >
        <div
          dangerouslySetInnerHTML={{ __html: novel.content }}
          style={{ color: '#e5e7eb' }}
        />
      </div>

      {/* 底部控制栏 */}
      <div
        style={{
          height: '50px',
          background: 'rgba(30, 30, 30, 0.8)',
          borderTop: '1px solid rgba(74, 222, 128, 0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          padding: '0 15px',
          fontSize: '12px',
        }}
      >
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}
        >
          <span>字号</span>
          <button
            onClick={() => setFontSize(Math.max(12, fontSize - 2))}
            style={{
              background: 'rgba(74, 222, 128, 0.2)',
              border: 'none',
              color: '#4ade80',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            A-
          </button>
          <button
            onClick={() => setFontSize(Math.min(24, fontSize + 2))}
            style={{
              background: 'rgba(74, 222, 128, 0.2)',
              border: 'none',
              color: '#4ade80',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            A+
          </button>
        </div>

        <div
          style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}
        >
          <span>透明度</span>
          <input
            type="range"
            min="30"
            max="100"
            value={opacity}
            onChange={(e) => handleOpacityChange(e.target.value)}
            style={{ flex: 1, accentColor: '#4ade80' }}
          />
          <span>{opacity}%</span>
        </div>
      </div>
    </div>
  );
}

export default NovelWindow;
