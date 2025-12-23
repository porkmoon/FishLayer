import React, { useState, useEffect } from 'react';

function StealthReader() {
  const [novel, setNovel] = useState(null);
  const [paragraphs, setParagraphs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (window.novelAPI) {
      window.novelAPI
        .getCurrentNovel()
        .then((data) => {
          if (data) {
            setNovel(data);
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = data.content;
            const text = tempDiv.innerText;
            const paras = text.split('\n').filter((p) => p.trim().length > 10);
            setParagraphs(paras);
          }
        })
        .catch((err) => console.error('加载失败:', err));
    }
  }, []);

  useEffect(() => {
    if (!isPlaying || paragraphs.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= paragraphs.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 3000);

    return () => clearInterval(timer);
  }, [isPlaying, paragraphs.length]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        setCurrentIndex((prev) => Math.min(prev + 1, paragraphs.length - 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        setIsPlaying(!isPlaying);
      } else if (e.key === 'Escape') {
        if (window.novelAPI) {
          window.novelAPI.closeWindow();
        }
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isPlaying, paragraphs.length]);

  if (!novel || paragraphs.length === 0) {
    return (
      <div
        style={{
          width: '100%',
          height: '100vh',
          background: '#0a0a0a',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div>📖 加载中...</div>
      </div>
    );
  }

  const progress = Math.round((currentIndex / paragraphs.length) * 100);

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        background: '#0a0a0a',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          height: '25px',
          background: '#1a1a1a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 10px',
          borderBottom: '1px solid #4ade80',
          WebkitAppRegion: 'drag',
        }}
      >
        <div style={{ fontSize: '10px', color: '#4ade80' }}>
          📖 {novel.title}
        </div>
        <div
          style={{ display: 'flex', gap: '5px', WebkitAppRegion: 'no-drag' }}
        >
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              background: 'none',
              border: 'none',
              color: '#999',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button
            onClick={() => window.novelAPI?.closeWindow()}
            style={{
              background: 'none',
              border: 'none',
              color: '#999',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 20px',
          fontSize: '14px',
          textAlign: 'center',
        }}
      >
        {paragraphs[currentIndex]}
      </div>

      <div
        style={{
          height: '18px',
          background: '#1a1a1a',
          position: 'relative',
          borderTop: '1px solid #4ade80',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: '#4ade80',
            transition: 'width 0.3s',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '9px',
          }}
        >
          {currentIndex + 1} / {paragraphs.length}
        </div>
      </div>

      <div
        style={{
          height: '15px',
          background: '#1a1a1a',
          fontSize: '8px',
          color: '#666',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        空格/→ 下一句 | ← 上一句 | P 播放 | Esc 关闭
      </div>
    </div>
  );
}

export default StealthReader;
