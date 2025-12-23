import React, { useState, useEffect, useRef } from 'react';

function FakeWorkModal({ isOpen, onClose }) {
  const [code, setCode] = useState('');
  const [index, setIndex] = useState(0);
  const [fullCode, setFullCode] = useState(''); // ← 改成状态
  const containerRef = useRef(null);

  // 默认代码
  const getDefaultCode = () => {
    return `import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart } from 'chart.js/auto';

/**
 * 销售数据分析模块
 * @author 开发团队
 * @version 2.0.1
 */
class SalesAnalyzer {
  constructor(config) {
    this.apiEndpoint = config.apiEndpoint;
    this.refreshInterval = config.refreshInterval || 30000;
    this.cache = new Map();
  }

  async fetchData(params) {
    const cacheKey = JSON.stringify(params);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await axios.get(this.apiEndpoint, { params });
      this.cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch data:', error);
      throw error;
    }
  }

  processData(rawData) {
    return rawData.map(item => ({
      ...item,
      profit: item.revenue - item.cost,
      margin: ((item.revenue - item.cost) / item.revenue * 100).toFixed(2)
    }));
  }
}

function Dashboard() {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const analyzerRef = useRef(null);

  useEffect(() => {
    analyzerRef.current = new SalesAnalyzer({
      apiEndpoint: '/api/v2/sales/analytics',
      refreshInterval: 30000
    });

    loadSalesData();
    const interval = setInterval(loadSalesData, 30000);

    return () => clearInterval(interval);
  }, [timeRange]);

  const loadSalesData = async () => {
    try {
      setLoading(true);
      const data = await analyzerRef.current.fetchData({
        range: timeRange,
        metrics: ['revenue', 'orders', 'customers']
      });
      
      const processed = analyzerRef.current.processData(data.results);
      setSalesData(processed);
    } catch (error) {
      console.error('Error loading sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderChart = () => {
    const ctx = document.getElementById('salesChart');
    if (!ctx) return;

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: salesData.map(d => d.date),
        datasets: [{
          label: 'Revenue',
          data: salesData.map(d => d.revenue),
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.4
        }]
      }
    });
  };

  if (loading) {
    return <div className="loading">Loading analytics...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Sales Analytics Dashboard</h1>
        <select value={timeRange} onChange={e => setTimeRange(e.target.value)}>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </header>
      <div className="metrics-grid">
        {salesData.map(item => (
          <div key={item.id} className="metric-card">
            <h3>{item.label}</h3>
            <p className="value">{item.value}</p>
          </div>
        ))}
      </div>
      <canvas id="salesChart" />
    </div>
  );
}

export default Dashboard;`;
  };

  // 加载自定义代码（新增）
  useEffect(() => {
    if (isOpen) {
      const isElectron = window.electronAPI !== undefined;

      if (isElectron) {
        window.electronAPI.getSetting('currentFakeCode').then((savedCode) => {
          if (savedCode) {
            console.log('[FakeWork] 加载自定义代码');
            setFullCode(savedCode);
          } else {
            console.log('[FakeWork] 使用默认代码');
            setFullCode(getDefaultCode());
          }
        });
      } else {
        const savedCode = localStorage.getItem('currentFakeCode');
        if (savedCode) {
          console.log('[FakeWork] 加载自定义代码');
          setFullCode(savedCode);
        } else {
          console.log('[FakeWork] 使用默认代码');
          setFullCode(getDefaultCode());
        }
      }

      setCode('');
      setIndex(0);
    }
  }, [isOpen]);

  // 键盘监听
  useEffect(() => {
    if (!isOpen || !fullCode) return;

    function handleKey(e) {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      const ignore = ['Control', 'Shift', 'Alt', 'Meta', 'CapsLock', 'Tab'];
      if (ignore.includes(e.key)) return;

      if (index < fullCode.length) {
        const newIndex = Math.min(index + 2, fullCode.length);
        setCode(fullCode.substring(0, newIndex));
        setIndex(newIndex);

        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
      }
    }

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, index, fullCode, onClose]);

  if (!isOpen) return null;

  const lines = code.split('\n');
  const progress = fullCode ? Math.round((index / fullCode.length) * 100) : 0;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#1e1e1e',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        color: '#d4d4d4',
        fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
        fontSize: '14px',
      }}
    >
      {/* 顶部标签栏 */}
      <div
        style={{
          height: '35px',
          backgroundColor: '#2d2d2d',
          borderBottom: '1px solid #1e1e1e',
          display: 'flex',
          alignItems: 'center',
          padding: '0 10px',
          gap: '5px',
        }}
      >
        <div
          style={{
            padding: '4px 12px',
            backgroundColor: '#1e1e1e',
            borderRadius: '3px 3px 0 0',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={{ color: '#4ec9b0' }}>●</span>
          <span>Dashboard.jsx</span>
        </div>
        <div style={{ flex: 1 }}></div>
        <div style={{ fontSize: '11px', color: '#666', marginRight: '10px' }}>
          {progress}%
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#999',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '0 8px',
          }}
          onMouseOver={(e) => (e.target.style.color = '#fff')}
          onMouseOut={(e) => (e.target.style.color = '#999')}
        >
          ×
        </button>
      </div>

      {/* 编辑器内容 */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* 行号 */}
        <div
          style={{
            width: '50px',
            backgroundColor: '#1e1e1e',
            textAlign: 'right',
            padding: '20px 15px 20px 0',
            fontSize: '13px',
            color: '#858585',
            userSelect: 'none',
            lineHeight: '1.6',
          }}
        >
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* 代码区域 */}
        <div
          ref={containerRef}
          style={{
            flex: 1,
            padding: '20px 20px 20px 15px',
            overflow: 'auto',
            lineHeight: '1.6',
            whiteSpace: 'pre',
            fontFamily: 'inherit',
          }}
        >
          {code}
          {fullCode && index < fullCode.length && (
            <span
              style={{
                display: 'inline-block',
                width: '8px',
                height: '18px',
                backgroundColor: '#fff',
                animation: 'blink 1s infinite',
                marginLeft: '2px',
              }}
            >
              ​
            </span>
          )}
        </div>
      </div>

      {/* 底部状态栏 */}
      <div
        style={{
          height: '22px',
          backgroundColor: '#007acc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 15px',
          fontSize: '12px',
          color: '#fff',
        }}
      >
        <div style={{ display: 'flex', gap: '15px' }}>
          <span>● Editing</span>
          <span>UTF-8</span>
          <span>JavaScript React</span>
        </div>
        <div>
          Ln {lines.length} · {index}/{fullCode.length}
        </div>
      </div>

      <style>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default FakeWorkModal;
