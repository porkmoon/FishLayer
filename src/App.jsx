import React, { useState, useEffect } from 'react';
import HotkeyIndicator from './components/HotkeyIndicator';
import FakeWorkModal from './components/FakeWorkModal';

// 检查是否在Electron环境
const isElectron = window.electronAPI !== undefined;

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [trialDays, setTrialDays] = useState(10);
  const [isFakeWorkOpen, setIsFakeWorkOpen] = useState(false);

  // 从Electron读取试用天数
  useEffect(() => {
    if (isElectron) {
      // 获取试用天数
      window.electronAPI.getTrialDays().then((days) => {
        setTrialDays(days);
      });

      // 监听假装工作快捷键
      console.log('开始注册假装工作监听器');

      const handleFakeWork = () => {
        console.log('✓ 收到假装工作事件！');
        setIsFakeWorkOpen(true);
      };

      if (window.electronAPI && window.electronAPI.onTriggerFakeWork) {
        window.electronAPI.onTriggerFakeWork(handleFakeWork);
        console.log('✓ 假装工作监听器注册成功');
      } else {
        console.error('✗ window.electronAPI.onTriggerFakeWork 不存在！');
      }
    }
  }, []);

  // 工作时间设置
  const [workTime, setWorkTime] = useState({
    startTime: '09:00',
    endTime: '18:00',
  });

  // 从Electron读取工作时间
  useEffect(() => {
    if (isElectron) {
      // 获取试用天数
      window.electronAPI.getTrialDays().then((days) => {
        setTrialDays(days);
      });

      // 监听假装工作快捷键
      console.log('[App] 注册假装工作监听器');

      if (window.electronAPI?.onTriggerFakeWork) {
        window.electronAPI.onTriggerFakeWork(() => {
          console.log('[App] 收到假装工作事件！');
          setIsFakeWorkOpen(true);
        });
        console.log('[App] 监听器注册成功');
      } else {
        console.error('[App] onTriggerFakeWork 不存在！');
      }
    }
  }, []);

  // 透明度设置
  const [opacity, setOpacity] = useState(() => {
    const saved = localStorage.getItem('opacity');
    return saved ? parseInt(saved) : 80;
  });

  // 保存工作时间
  const saveWorkTime = (newWorkTime) => {
    setWorkTime(newWorkTime);

    if (isElectron) {
      window.electronAPI.saveWorkTime(newWorkTime).then(() => {
        console.log('工作时间已保存到Electron');
      });
    } else {
      localStorage.setItem('workTime', JSON.stringify(newWorkTime));
    }
  };

  // 保存透明度
  const saveOpacity = (newOpacity) => {
    setOpacity(newOpacity);
    localStorage.setItem('opacity', newOpacity.toString());
  };

  const navItems = [
    { id: 'home', icon: '🐟', label: '首页' },
    { id: 'novel', icon: '📖', label: '浮窗小说' },
    { id: 'fake', icon: '💻', label: '假装工作' },
    { id: 'settings', icon: '⚙️', label: '设置' },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomePage
            workTime={workTime}
            onWorkTimeChange={saveWorkTime}
            onNavigate={setCurrentPage}
          />
        );
      case 'novel':
        return <NovelPage />;
      case 'fake':
        return <FakePage onOpen={() => setIsFakeWorkOpen(true)} />; // ← 加这个
      case 'settings':
        return (
          <SettingsPage
            workTime={workTime}
            onSave={saveWorkTime}
            opacity={opacity}
            onOpacityChange={saveOpacity}
          />
        );
      default:
        return (
          <HomePage
            workTime={workTime}
            onWorkTimeChange={saveWorkTime}
            onNavigate={setCurrentPage}
          />
        );
    }
  };

  return (
    <div className="flex flex-col h-screen bg-fish-dark text-white">
      {/* 顶部标题栏 */}
      <div className="h-12 bg-fish-gray flex items-center justify-between px-4 border-b border-fish-green/20">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐟</span>
          <span className="text-xl font-bold text-fish-green">FishLayer</span>
        </div>
        <div className="text-sm text-gray-400">v1.0.0</div>
      </div>

      {/* 主体区域 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧导航 */}
        <div className="w-48 bg-fish-gray border-r border-fish-green/20 p-4">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-all duration-200
                  ${
                    currentPage === item.id
                      ? 'bg-fish-green/20 text-fish-green shadow-lg shadow-fish-green/20'
                      : 'text-gray-400 hover:bg-fish-green/10 hover:text-fish-green'
                  }
                `}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* 右侧内容区 */}
        <div className="flex-1 overflow-auto p-8">{renderPage()}</div>
      </div>

      {/* 底部状态栏 */}
      <div className="h-10 bg-fish-gray flex items-center justify-between px-4 border-t border-fish-green/20 text-sm">
        <div className="text-gray-400">Your stealth workspace</div>
        <div className="flex items-center gap-4">
          <div
            className={`${trialDays <= 3 ? 'text-red-400' : 'text-fish-green'}`}
          >
            试用剩余：{trialDays}天
          </div>
          <HotkeyIndicator inline={true} />
          <div className="text-sm text-gray-500">v1.0.0</div>
        </div>
      </div>
      {/* 假装工作模态框（新增） */}
      <FakeWorkModal
        isOpen={isFakeWorkOpen}
        onClose={() => {
          console.log('[App] 关闭假装工作');
          setIsFakeWorkOpen(false);
        }}
      />
    </div>
  );
}

// 倒计时计算
function calculateCountdown(workTime) {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentSecond = now.getSeconds();

  const [endHour, endMinute] = workTime.endTime.split(':').map(Number);
  const currentTotalSeconds =
    currentHour * 3600 + currentMinute * 60 + currentSecond;
  const endTotalSeconds = endHour * 3600 + endMinute * 60;
  let remainingSeconds = endTotalSeconds - currentTotalSeconds;

  let status = 'working';
  const dayOfWeek = now.getDay();

  if (dayOfWeek === 0 || dayOfWeek === 6) {
    status = 'weekend';
    remainingSeconds = 0;
  } else if (remainingSeconds <= 0) {
    status = 'off-work';
    remainingSeconds = 0;
  }

  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;
  const timeString = `${String(hours).padStart(2, '0')}:${String(
    minutes
  ).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const [startHour, startMinute] = workTime.startTime.split(':').map(Number);
  const startTotalSeconds = startHour * 3600 + startMinute * 60;
  const totalWorkSeconds = endTotalSeconds - startTotalSeconds;
  const workedSeconds = currentTotalSeconds - startTotalSeconds;
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round((workedSeconds / totalWorkSeconds) * 100))
  );

  return {
    status,
    timeString,
    totalMinutes: Math.floor(remainingSeconds / 60),
    progressPercent,
    endTime: workTime.endTime,
  };
}

// 首页
function HomePage({ workTime, onWorkTimeChange }) {
  const [showCountdown, setShowCountdown] = useState(true);
  const [countdown, setCountdown] = useState(calculateCountdown(workTime));
  const [isEditing, setIsEditing] = useState(false);
  const [editStartTime, setEditStartTime] = useState(workTime.startTime);
  const [editEndTime, setEditEndTime] = useState(workTime.endTime);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(calculateCountdown(workTime));
    }, 1000);
    return () => clearInterval(timer);
  }, [workTime]);

  const handleSaveTime = () => {
    onWorkTimeChange({ startTime: editStartTime, endTime: editEndTime });
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="text-center max-w-3xl">
        <h1 className="text-6xl font-bold mb-4 text-fish-green animate-pulse">
          <span className="inline-block">&gt;</span>
        </h1>
        <h2 className="text-4xl font-bold mb-4">欢迎使用 FishLayer</h2>
        <p className="text-gray-400 text-lg mb-8">你的隐形工作空间</p>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-bold text-fish-green flex items-center gap-2">
              <span>⏰</span>
              <span>下班倒计时</span>
            </h3>
            <button
              onClick={() => setShowCountdown(!showCountdown)}
              className="text-sm text-gray-400 hover:text-fish-green transition-colors"
            >
              {showCountdown ? '隐藏' : '显示'}
            </button>
          </div>

          {showCountdown && (
            <div className="p-8 bg-fish-gray/50 rounded-lg border border-fish-green/20 backdrop-blur-sm">
              {countdown.status === 'weekend' && (
                <div>
                  <div className="text-5xl mb-4">🎉</div>
                  <div className="text-3xl font-bold text-fish-green mb-2">
                    周末愉快！
                  </div>
                  <p className="text-gray-400">好好休息，周一见~</p>
                </div>
              )}

              {countdown.status === 'off-work' && (
                <div>
                  <div className="text-5xl mb-4">🎊</div>
                  <div className="text-3xl font-bold text-fish-green mb-2">
                    已经下班啦！
                  </div>
                  <p className="text-gray-400">赶紧回家吧！</p>
                </div>
              )}

              {countdown.status === 'working' && (
                <div>
                  <div className="text-7xl font-mono font-bold text-fish-green mb-4 tracking-wider">
                    {countdown.timeString}
                  </div>
                  <p className="text-gray-400 text-lg mb-2">
                    距离下班还有 {countdown.totalMinutes} 分钟
                  </p>
                  <p className="text-sm text-gray-500">
                    {countdown.endTime} 下班 | 还有{' '}
                    {100 - countdown.progressPercent}% 的时间
                  </p>
                  <div className="mt-4 w-full bg-fish-dark rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-fish-green h-full rounded-full transition-all duration-1000"
                      style={{ width: `${countdown.progressPercent}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-fish-green/20">
                {!isEditing ? (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-400">
                      工作时间：{workTime.startTime} - {workTime.endTime}
                    </div>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-sm text-fish-green hover:text-fish-green/80 transition-colors"
                    >
                      修改
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">
                          上班
                        </label>
                        <input
                          type="time"
                          value={editStartTime}
                          onChange={(e) => setEditStartTime(e.target.value)}
                          className="w-full px-3 py-2 bg-fish-dark border border-fish-green/30 rounded text-white text-sm focus:outline-none focus:border-fish-green"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">
                          下班
                        </label>
                        <input
                          type="time"
                          value={editEndTime}
                          onChange={(e) => setEditEndTime(e.target.value)}
                          className="w-full px-3 py-2 bg-fish-dark border border-fish-green/30 rounded text-white text-sm focus:outline-none focus:border-fish-green"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveTime}
                        className="flex-1 px-4 py-2 bg-fish-green text-fish-dark text-sm font-bold rounded hover:bg-fish-green/80 transition-all"
                      >
                        保存
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditStartTime(workTime.startTime);
                          setEditEndTime(workTime.endTime);
                        }}
                        className="flex-1 px-4 py-2 bg-fish-gray text-gray-400 text-sm rounded hover:bg-fish-gray/80 transition-all"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3 text-left max-w-md mx-auto">
          <div className="flex items-center gap-3 text-gray-300">
            <span className="text-fish-green text-xl">✓</span>
            <span>浮窗阅读小说，老板看不见</span>
          </div>
          <div className="flex items-center gap-3 text-gray-300">
            <span className="text-fish-green text-xl">✓</span>
            <span>一键假装敲代码，完美伪装</span>
          </div>
          <div className="flex items-center gap-3 text-gray-300">
            <span className="text-fish-green text-xl">✓</span>
            <span>实时倒计时，掌握下班时间</span>
          </div>
          <div className="flex items-center gap-3 text-gray-300">
            <span className="text-fish-green text-xl">✓</span>
            <span>全局快捷键，紧急隐藏</span>
          </div>
        </div>

        <div className="mt-8 p-4 bg-fish-gray/30 rounded-lg border border-fish-green/20">
          <p className="text-sm text-gray-400 mb-2">常用快捷键：</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <kbd className="px-3 py-1 bg-fish-dark rounded text-fish-green text-sm">
              Ctrl+Shift+Q
            </kbd>
            <span className="text-gray-500">紧急隐藏</span>
            <kbd className="px-3 py-1 bg-fish-dark rounded text-fish-green text-sm">
              Ctrl+Shift+F
            </kbd>
            <span className="text-gray-500">假装工作</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function NovelPage() {
  const [novelUrl, setNovelUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [mode, setMode] = useState('browser'); // 默认内置浏览器

  const handleStartReading = async () => {
    if (!novelUrl.trim()) {
      setError('请输入小说链接');
      return;
    }

    if (!novelUrl.startsWith('http://') && !novelUrl.startsWith('https://')) {
      setError('请输入完整的链接（以http://或https://开头）');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    if (window.electronAPI) {
      try {
        console.log('🔵 打开浏览器, URL:', novelUrl);
        // 打开浏览器窗口并导航到指定 URL
        const result = await window.electronAPI.openBrowserWindow(novelUrl);
        console.log('🔵 浏览器打开结果:', result);
        
        if (result.success) {
          setSuccessMessage('✓ 浏览器已打开，请在页面加载完成后点击"抓取当前页"');
          
          // 清空输入框
          setTimeout(() => {
            setNovelUrl('');
            setSuccessMessage('');
          }, 3000);
        } else {
          setError('打开浏览器失败：' + result.error);
        }
      } catch (err) {
        console.error('🔴 打开浏览器异常:', err);
        setError('打开浏览器失败：' + err.message);
      }
    } else {
      setError('请在Electron环境中使用此功能');
    }

    setIsLoading(false);
  };

  const handlePasteContent = async () => {
    try {
      const text = await navigator.clipboard.readText();

      if (!text || text.length < 100) {
        setError('粘贴的内容太短，请确保复制了完整的章节内容');
        return;
      }

      const formattedContent = text
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .map(
          (line) => `<p style="text-indent: 2em; margin: 1em 0;">${line}</p>`
        )
        .join('');

      if (window.electronAPI) {
        await window.electronAPI.saveSetting('currentNovel', {
          title: '手动粘贴的内容',
          content: formattedContent,
          url: '',
          site: 'manual',
          timestamp: Date.now(),
        });

        setSuccessMessage('✓ 内容已粘贴成功');

        setTimeout(async () => {
          await window.electronAPI.openNovelWindow();
          setSuccessMessage('');
        }, 1000);
      }
    } catch (err) {
      setError('粘贴失败：' + err.message);
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-fish-green">📖 浮窗小说</h2>

      {/* ========== 模式切换（3个按钮） ========== */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMode('browser')}
          className={`px-4 py-2 rounded-lg transition-all ${
            mode === 'browser'
              ? 'bg-fish-green text-fish-dark font-bold'
              : 'bg-fish-gray text-gray-400 hover:text-fish-green'
          }`}
        >
          🌐 内置浏览器
        </button>
        <button
          onClick={() => setMode('url')}
          className={`px-4 py-2 rounded-lg transition-all ${
            mode === 'url'
              ? 'bg-fish-green text-fish-dark font-bold'
              : 'bg-fish-gray text-gray-400 hover:text-fish-green'
          }`}
        >
          🔗 链接抓取
        </button>
        <button
          onClick={() => setMode('paste')}
          className={`px-4 py-2 rounded-lg transition-all ${
            mode === 'paste'
              ? 'bg-fish-green text-fish-dark font-bold'
              : 'bg-fish-gray text-gray-400 hover:text-fish-green'
          }`}
        >
          📋 手动粘贴
        </button>
      </div>

      <div className="space-y-4">
        {/* ========== 内置浏览器模式 ========== */}
        {mode === 'browser' && (
          <>
            <p className="text-gray-400">
              内置浏览器，完美支持微信读书（可登录、付费章节），一键抓取
            </p>

            <div className="p-6 bg-fish-gray/50 rounded-lg border border-fish-green/20">
              <h3 className="font-bold mb-4 text-fish-green">🌐 使用方式：</h3>
              {/* ... 一堆说明文字 ... */}

              <button
                onClick={async () => {
                  if (window.electronAPI) {
                    try {
                      console.log('🔵 点击打开浏览器按钮');
                      const result = await window.electronAPI.openBrowserWindow();
                      console.log('🔵 浏览器打开结果:', result);
                      if (!result.success) {
                        alert('打开浏览器失败: ' + result.error);
                      }
                    } catch (err) {
                      console.error('🔴 打开浏览器异常:', err);
                      alert('打开浏览器失败: ' + err.message);
                    }
                  } else {
                    alert('electronAPI 未找到');
                  }
                }}
                className="w-full px-6 py-4 bg-fish-green..."
              >
                🌐 打开内置浏览器
              </button>
            </div>

            <div className="p-4 bg-fish-dark/50 rounded-lg border border-fish-green/20">
              <h3 className="font-bold mb-2 text-sm text-fish-green">
                ✨ 优势：
              </h3>
              {/* ... */}
            </div>
          </>
        )}{' '}
        {/* ← 在这个括号后面添加 */}
        <div className="p-6 bg-fish-gray/50 rounded-lg border border-fish-green/20 mt-4">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <span>🥷</span>
            <span>超隐蔽阅读模式</span>
          </h3>

          <p className="text-gray-400 text-sm mb-4">
            极小浮窗，一次只显示一行，自动滚动或空格翻页，完美摸鱼
          </p>

          <div className="space-y-3">
            <button
              onClick={async () => {
                if (window.electronAPI) {
                  const novel = await window.electronAPI.getSetting(
                    'currentNovel'
                  );
                  if (!novel) {
                    alert('请先抓取小说内容！');
                    return;
                  }

                  try {
                    await window.electronAPI.openStealthReader();
                  } catch (err) {
                    alert('打开失败: ' + err.message);
                  }
                }
              }}
              className="w-full px-6 py-4 bg-purple-500 text-white font-bold rounded-lg hover:bg-purple-600 transition-all hover:scale-105"
            >
              🥷 开启超隐蔽模式
            </button>

            <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded text-xs text-purple-300">
              <div className="font-bold mb-2">💡 使用说明：</div>
              <ul className="space-y-1">
                <li>• 窗口超小（800x80px），只显示一行</li>
                <li>• 空格或→键：下一句</li>
                <li>• ←键：上一句</li>
                <li>• P键：自动播放/暂停</li>
                <li>• Esc键：关闭窗口</li>
              </ul>
            </div>
          </div>
        </div>
        {/* ========== 在这里添加调试工具 ========== */}
        <div className="p-6 bg-fish-gray/50 rounded-lg border border-fish-green/20 mt-4">
          <h3 className="font-bold mb-4">🔍 调试工具</h3>

          <button
            onClick={async () => {
              if (window.electronAPI) {
                const novel = await window.electronAPI.getSetting(
                  'currentNovel'
                );
                if (novel) {
                  console.log('当前小说数据:', novel);
                  alert(
                    `标题: ${novel.title}\n长度: ${novel.content?.length || 0}`
                  );
                } else {
                  alert('没有小说数据');
                }
              }
            }}
            className="w-full px-4 py-3 bg-fish-dark border border-fish-green/30 rounded-lg hover:border-fish-green transition-all mb-3"
          >
            📋 查看已抓取的数据
          </button>

          {/* ========== 新增：清除数据按钮 ========== */}
          <button
            onClick={async () => {
              if (window.electronAPI) {
                if (confirm('确定要清除所有小说数据吗？')) {
                  await window.electronAPI.saveSetting('currentNovel', null);
                  alert('数据已清除！');
                }
              }
            }}
            className="w-full px-4 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-all mb-3"
          >
            🗑️ 清除所有数据
          </button>

          <button
            onClick={async () => {
              if (window.electronAPI) {
                try {
                  await window.electronAPI.openNovelWindow();
                } catch (err) {
                  console.error('打开浮窗失败:', err);
                  alert('打开失败: ' + err.message);
                }
              }
            }}
            className="w-full px-4 py-3 bg-fish-green text-fish-dark font-bold rounded-lg hover:bg-fish-green/80 transition-all"
          >
            🚀 手动打开小说浮窗
          </button>
        </div>
        {/* ========== 链接抓取模式 ========== */}
        {mode === 'url' && (
          <>
            <p className="text-gray-400">
              支持笔趣阁、顶点等主流小说网站，自动提取正文
            </p>

            <div className="p-6 bg-fish-gray/50 rounded-lg border border-fish-green/20">
              <label className="block text-sm text-gray-400 mb-3">
                小说章节链接：
              </label>

              <div className="mb-3">
                <input
                  type="text"
                  value={novelUrl}
                  onChange={(e) => {
                    setNovelUrl(e.target.value);
                    setError('');
                    setSuccessMessage('');
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !isLoading) {
                      handleStartReading();
                    }
                  }}
                  placeholder="粘贴笔趣阁、顶点等链接"
                  className="w-full px-4 py-3 bg-fish-dark border border-fish-green/30 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-fish-green transition-all"
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="mb-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  ⚠️ {error}
                </div>
              )}

              {successMessage && (
                <div className="mb-3 p-3 bg-fish-green/10 border border-fish-green/30 rounded-lg text-fish-green text-sm">
                  {successMessage}
                </div>
              )}

              <button
                onClick={handleStartReading}
                disabled={isLoading || !novelUrl.trim()}
                className="w-full px-6 py-4 bg-fish-green text-fish-dark font-bold rounded-lg hover:bg-fish-green/80 transition-all hover:scale-105 disabled:opacity-50"
              >
                {isLoading ? '正在抓取中（3秒）...' : '📖 开始阅读'}
              </button>
            </div>

            <div className="p-4 bg-fish-dark/50 rounded-lg border border-fish-green/20">
              <h3 className="font-bold mb-2 text-sm text-fish-green">
                ✅ 支持的网站：
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                <div>• 笔趣阁（各分站）</div>
                <div>• 顶点小说网</div>
                <div>• 新笔趣阁</div>
                <div>• 八一中文网</div>
              </div>
            </div>
          </>
        )}
        {/* ========== 手动粘贴模式 ========== */}
        {mode === 'paste' && (
          <>
            <p className="text-gray-400">适合无法自动抓取的网站（备用方案）</p>

            <div className="p-6 bg-fish-gray/50 rounded-lg border border-fish-green/20">
              <h3 className="font-bold mb-4 text-fish-green">📋 使用步骤：</h3>

              <ol className="space-y-3 text-sm text-gray-300 mb-6">
                <li className="flex gap-3">
                  <span className="text-fish-green font-bold">1.</span>
                  <span>在浏览器打开小说章节页面</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-fish-green font-bold">2.</span>
                  <span>按 Ctrl+A 全选正文内容</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-fish-green font-bold">3.</span>
                  <span>按 Ctrl+C 复制内容</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-fish-green font-bold">4.</span>
                  <span>回到这里，点击下方按钮</span>
                </li>
              </ol>

              {error && (
                <div className="mb-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  ⚠️ {error}
                </div>
              )}

              {successMessage && (
                <div className="mb-3 p-3 bg-fish-green/10 border border-fish-green/30 rounded-lg text-fish-green text-sm">
                  {successMessage}
                </div>
              )}

              <button
                onClick={handlePasteContent}
                className="w-full px-6 py-4 bg-fish-green text-fish-dark font-bold rounded-lg hover:bg-fish-green/80 transition-all hover:scale-105"
              >
                📋 粘贴内容并开始阅读
              </button>
            </div>

            <div className="p-4 bg-fish-dark/50 rounded-lg border border-fish-green/20">
              <h3 className="font-bold mb-2 text-sm">💡 小贴士：</h3>
              <ul className="space-y-1 text-xs text-gray-400">
                <li>• 这种方式100%可用，不受网站限制</li>
                <li>• 复制时尽量只选正文，不要包含导航栏</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function FakePage({ onOpen }) {
  // 代码模板定义
  const codeTemplates = {
    javascript: {
      name: 'JavaScript',
      icon: '🟨',
      code: `import React, { useState, useEffect } from 'react';
import axios from 'axios';

class UserManager {
  constructor(apiBase) {
    this.apiBase = apiBase;
    this.cache = new Map();
  }

  async fetchUsers(params = {}) {
    try {
      const response = await axios.get(\`\${this.apiBase}/users\`, { params });
      this.cache.set('users', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch users:', error);
      throw error;
    }
  }
}

function UserDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const manager = new UserManager('https://api.example.com');
      const data = await manager.fetchUsers();
      setUsers(data);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="dashboard">
      <h1>User Management</h1>
      {users.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}

export default UserDashboard;`,
    },

    python: {
      name: 'Python',
      icon: '🐍',
      code: `import asyncio
from typing import List, Dict

class DataAnalyzer:
    def __init__(self, endpoint: str):
        self.endpoint = endpoint
        self.cache = {}
    
    async def fetch_data(self, params: Dict) -> List:
        cache_key = str(params)
        if cache_key in self.cache:
            return self.cache[cache_key]
        
        # Simulate API call
        data = await self._api_call(params)
        self.cache[cache_key] = data
        return data
    
    def process(self, data: List) -> List:
        return [item for item in data if item['value'] > 100]

async def main():
    analyzer = DataAnalyzer('https://api.example.com')
    results = await analyzer.fetch_data({'limit': 100})
    processed = analyzer.process(results)
    print(f"Processed {len(processed)} records")

if __name__ == '__main__':
    asyncio.run(main())`,
    },

    java: {
      name: 'Java',
      icon: '☕',
      code: `package com.company.service;

import java.util.*;
import java.util.concurrent.*;

public class OrderService {
    private final ExecutorService executor;
    private final Map<String, Order> cache;
    
    public OrderService() {
        this.executor = Executors.newFixedThreadPool(10);
        this.cache = new ConcurrentHashMap<>();
    }
    
    public CompletableFuture<OrderResult> processOrder(String orderId) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                Order order = getOrder(orderId);
                validateOrder(order);
                return new OrderResult(orderId, "SUCCESS");
            } catch (Exception e) {
                return new OrderResult(orderId, "FAILED");
            }
        }, executor);
    }
    
    private void validateOrder(Order order) {
        if (order.getItems().isEmpty()) {
            throw new ValidationException("Empty order");
        }
    }
}`,
    },

    react: {
      name: 'React',
      icon: '⚛️',
      code: `import React, { useState } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';

function ProductList() {
  const [filter, setFilter] = useState('all');
  
  const { data, isLoading } = useQuery(
    ['products', filter],
    async () => {
      const res = await axios.get('/api/products', {
        params: { filter }
      });
      return res.data;
    }
  );
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div className="product-list">
      <h1>Products</h1>
      {data.map(product => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>\${product.price}</p>
        </div>
      ))}
    </div>
  );
}

export default ProductList;`,
    },
  };

  const [selectedTemplate, setSelectedTemplate] = useState('javascript');
  const [currentCode, setCurrentCode] = useState(codeTemplates.javascript.code);
  const [savedCodes, setSavedCodes] = useState([]);
  const [isCustom, setIsCustom] = useState(false);
  const [showTemplates, setShowTemplates] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);

  useEffect(() => {
    if (isElectron) {
      window.electronAPI.getSetting('savedCodes').then((codes) => {
        if (codes) setSavedCodes(codes);
      });
    } else {
      const saved = localStorage.getItem('savedCodes');
      if (saved) setSavedCodes(JSON.parse(saved));
    }
  }, []);

  const handleTemplateSelect = (key) => {
    setSelectedTemplate(key);
    setCurrentCode(codeTemplates[key].code);
    setIsCustom(false);
  };

  const handleCustomCode = () => {
    setSelectedTemplate('custom');
    setCurrentCode('');
    setIsCustom(true);
  };

  const handleStart = () => {
    if (!currentCode || currentCode.length < 50) {
      alert('代码太短了，至少需要50个字符');
      return;
    }

    if (isElectron) {
      window.electronAPI.saveSetting('currentFakeCode', currentCode);
    } else {
      localStorage.setItem('currentFakeCode', currentCode);
    }

    onOpen();
  };

  const handleSave = () => {
    if (!currentCode || currentCode.length < 50) {
      alert('代码太短了，请输入至少50个字符');
      return;
    }

    const name = prompt('给这段代码起个名字：');
    if (!name) return;

    const newSaved = [
      ...savedCodes,
      {
        id: Date.now(),
        name,
        code: currentCode,
      },
    ];

    setSavedCodes(newSaved);

    if (isElectron) {
      window.electronAPI.saveSetting('savedCodes', newSaved);
    } else {
      localStorage.setItem('savedCodes', JSON.stringify(newSaved));
    }

    alert('✓ 保存成功！');
  };

  const handleDeleteSaved = (id) => {
    if (!confirm('确定删除这个代码？')) return;

    const newSaved = savedCodes.filter((c) => c.id !== id);
    setSavedCodes(newSaved);

    if (isElectron) {
      window.electronAPI.saveSetting('savedCodes', newSaved);
    } else {
      localStorage.setItem('savedCodes', JSON.stringify(newSaved));
    }
  };

  const handleLoadSaved = (saved) => {
    setSelectedTemplate('saved-' + saved.id);
    setCurrentCode(saved.code);
    setIsCustom(false);
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-fish-green">💻 假装工作</h2>

      <div className="space-y-4">
        {/* 模板选择（可折叠） */}
        <div className="bg-fish-gray/50 rounded-lg border border-fish-green/20 overflow-hidden">
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="w-full p-4 flex items-center justify-between hover:bg-fish-gray/70 transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{showTemplates ? '📂' : '📁'}</span>
              <span className="font-bold">代码模板</span>
              <span className="text-sm text-gray-400">
                （选择预设或自定义）
              </span>
            </div>
            <span className="text-fish-green text-xl">
              {showTemplates ? '−' : '+'}
            </span>
          </button>

          {showTemplates && (
            <div className="p-6 pt-2 border-t border-fish-green/10">
              <div className="grid grid-cols-5 gap-3">
                {Object.entries(codeTemplates).map(([key, template]) => (
                  <button
                    key={key}
                    onClick={() => {
                      handleTemplateSelect(key);
                      setShowEditor(true);
                    }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedTemplate === key && !isCustom
                        ? 'border-fish-green bg-fish-green/10'
                        : 'border-fish-green/20 hover:border-fish-green/40'
                    }`}
                  >
                    <div className="text-3xl mb-2">{template.icon}</div>
                    <div className="text-sm font-medium">{template.name}</div>
                  </button>
                ))}

                <button
                  onClick={() => {
                    handleCustomCode();
                    setShowEditor(true);
                  }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isCustom
                      ? 'border-fish-green bg-fish-green/10'
                      : 'border-fish-green/20 hover:border-fish-green/40'
                  }`}
                >
                  <div className="text-3xl mb-2">📝</div>
                  <div className="text-sm font-medium">自定义</div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 代码编辑器（可折叠） */}
        <div className="bg-fish-gray/50 rounded-lg border border-fish-green/20 overflow-hidden">
          <button
            onClick={() => setShowEditor(!showEditor)}
            className="w-full p-4 flex items-center justify-between hover:bg-fish-gray/70 transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{showEditor ? '📝' : '📄'}</span>
              <span className="font-bold">代码编辑器</span>
              <span className="text-sm text-gray-400">
                {isCustom
                  ? '自定义代码'
                  : codeTemplates[selectedTemplate]?.name || ''}
              </span>
              {currentCode && (
                <span className="text-xs text-fish-green">
                  {currentCode.split('\n').length} 行 · {currentCode.length}{' '}
                  字符
                </span>
              )}
            </div>
            <span className="text-fish-green text-xl">
              {showEditor ? '−' : '+'}
            </span>
          </button>

          {showEditor && (
            <div className="p-6 pt-2 border-t border-fish-green/10">
              <textarea
                value={currentCode}
                onChange={(e) => setCurrentCode(e.target.value)}
                placeholder="在这里输入或粘贴你的代码...&#10;&#10;支持任何编程语言！"
                className="w-full h-80 px-4 py-3 bg-fish-dark border border-fish-green/30 rounded-lg text-white font-mono text-sm resize-none focus:outline-none focus:border-fish-green transition-all"
                style={{ fontFamily: 'Consolas, Monaco, monospace' }}
              />

              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleStart}
                  disabled={!currentCode || currentCode.length < 50}
                  className="flex-1 px-6 py-3 bg-fish-green text-fish-dark font-bold rounded-lg hover:bg-fish-green/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🚀 开始敲代码 (Ctrl+Shift+F)
                </button>

                <button
                  onClick={handleSave}
                  disabled={!currentCode || currentCode.length < 50}
                  className="px-6 py-3 bg-fish-green/20 text-fish-green border border-fish-green/30 font-medium rounded-lg hover:bg-fish-green/30 transition-all disabled:opacity-50"
                >
                  💾 保存到代码库
                </button>
              </div>

              {currentCode && currentCode.length < 50 && (
                <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded text-sm text-yellow-400">
                  ⚠️ 代码太短了，至少需要50个字符才能使用
                </div>
              )}
            </div>
          )}
        </div>

        {/* 我的代码库（可折叠） */}
        <div className="bg-fish-gray/50 rounded-lg border border-fish-green/20 overflow-hidden">
          <button
            onClick={() => setShowLibrary(!showLibrary)}
            className="w-full p-4 flex items-center justify-between hover:bg-fish-gray/70 transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{showLibrary ? '📂' : '📁'}</span>
              <span className="font-bold">我的代码库</span>
              <span className="text-sm text-gray-400">
                （已保存 {savedCodes.length} 个）
              </span>
            </div>
            <span className="text-fish-green text-xl">
              {showLibrary ? '−' : '+'}
            </span>
          </button>

          {showLibrary && savedCodes.length > 0 && (
            <div className="p-6 pt-2 border-t border-fish-green/10">
              <div className="space-y-2">
                {savedCodes.map((saved) => (
                  <div
                    key={saved.id}
                    className="p-4 bg-fish-dark rounded border border-fish-green/20 flex items-center justify-between hover:border-fish-green/40 transition-all"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{saved.name}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {saved.code.split('\n').length} 行 · {saved.code.length}{' '}
                        字符
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          handleLoadSaved(saved);
                          setShowEditor(true);
                        }}
                        className="px-4 py-2 bg-fish-green/20 text-fish-green text-sm rounded hover:bg-fish-green/30"
                      >
                        📝 编辑
                      </button>
                      <button
                        onClick={() => {
                          if (isElectron) {
                            window.electronAPI.saveSetting(
                              'currentFakeCode',
                              saved.code
                            );
                          } else {
                            localStorage.setItem('currentFakeCode', saved.code);
                          }
                          onOpen();
                        }}
                        className="px-4 py-2 bg-fish-green text-fish-dark text-sm font-medium rounded hover:bg-fish-green/80"
                      >
                        🚀 使用
                      </button>
                      <button
                        onClick={() => handleDeleteSaved(saved.id)}
                        className="px-4 py-2 bg-red-500/20 text-red-400 text-sm rounded hover:bg-red-500/30"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showLibrary && savedCodes.length === 0 && (
            <div className="p-6 pt-4 border-t border-fish-green/10 text-center text-gray-500 text-sm">
              还没有保存的代码，编辑代码后点击"保存到代码库"
            </div>
          )}
        </div>

        {/* 使用说明 */}
        <div className="p-4 bg-fish-dark/50 rounded-lg border border-fish-green/20">
          <h3 className="font-bold mb-2 text-sm">💡 使用方法：</h3>
          <ul className="space-y-1 text-xs text-gray-400">
            <li>• 点击上方折叠区域展开内容</li>
            <li>• 选择预设模板或自定义，在编辑器中修改代码</li>
            <li>• 点"开始敲代码"直接使用，或"保存到代码库"</li>
            <li>• 按键盘任意键，代码会逐渐显示（像真的在敲）</li>
            <li>• 按 Esc 退出 | 快捷键 Ctrl+Shift+F 快速启动</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function SettingsPage({ workTime, onSave, opacity, onOpacityChange }) {
  const [startTime, setStartTime] = useState(workTime.startTime);
  const [endTime, setEndTime] = useState(workTime.endTime);
  const [currentOpacity, setCurrentOpacity] = useState(opacity);
  const [mainOpacity, setMainOpacity] = useState(100);
  const [saved, setSaved] = useState(false);

  // 快捷键设置
  const [hideHotkey, setHideHotkey] = useState('CommandOrControl+Shift+Q');
  const [isDefaultHotkey, setIsDefaultHotkey] = useState(true);
  const [hotkeyPreset, setHotkeyPreset] = useState('default');

  useEffect(() => {
    if (isElectron) {
      window.electronAPI.getMainOpacity().then((opacity) => {
        setMainOpacity(opacity);
      });

      // 加载快捷键
      window.electronAPI.getHideHotkey().then((hk) => {
        setHideHotkey(hk);
      });

      window.electronAPI.isDefaultHotkey().then((def) => {
        setIsDefaultHotkey(def);
        setHotkeyPreset(def ? 'default' : 'custom');
      });
    }
  }, []);

  const handleSave = () => {
    onSave({ startTime, endTime });
    onOpacityChange(currentOpacity);

    if (isElectron) {
      window.electronAPI.setMainOpacity(mainOpacity);
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleHotkeyChange = async (preset) => {
    setHotkeyPreset(preset);

    let newHotkey = '';

    switch (preset) {
      case 'default':
        newHotkey = 'CommandOrControl+Shift+Q';
        break;
      case 'space':
        newHotkey = 'Space';
        break;
      case 'f1':
        newHotkey = 'F1';
        break;
      case 'esc':
        newHotkey = 'Escape';
        break;
      default:
        newHotkey = 'CommandOrControl+Shift+Q';
    }

    if (window.electronAPI) {
      const result = await window.electronAPI.setHideHotkey(newHotkey);
      if (result.success) {
        setHideHotkey(newHotkey);
        setIsDefaultHotkey(preset === 'default');

        // 如果不是默认，显示提示
        if (preset !== 'default') {
          alert(
            '✓ 快捷键已设置为一次性使用\n使用后将自动恢复为默认（Ctrl+Shift+Q）'
          );
        }
      }
    }
  };

  const formatHotkey = (hk) => {
    // 先替换CommandOrControl为Ctrl，然后把所有+号替换为 + （加空格）
    return hk
      .replace('CommandOrControl', 'Ctrl')
      .split('+')
      .filter((s) => s) // 过滤空字符串
      .join(' + ');
  };
  const handleOpacityChange = (value) => {
    const newValue = Math.max(30, Math.min(100, parseInt(value)));
    setCurrentOpacity(newValue);

    // 同时应用到小说浮窗和浏览器窗口
    if (window.electronAPI) {
      window.electronAPI.saveSetting('novelOpacity', newValue);
      window.electronAPI.saveSetting('browserOpacity', newValue);
    }
  };

  const handleMainOpacityChange = (value) => {
    const newValue = Math.max(30, parseInt(value));
    setMainOpacity(newValue);

    if (isElectron) {
      window.electronAPI.setMainOpacity(newValue);
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-fish-green">⚙️ 设置</h2>
      <div className="space-y-6 max-w-2xl">
        {/* 工作时间设置 */}
        <div className="p-6 bg-fish-gray/50 rounded-lg border border-fish-green/20">
          <h3 className="font-bold mb-4 text-lg flex items-center gap-2">
            <span>⏰</span>
            <span>工作时间</span>
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                上班时间
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-2 bg-fish-dark border border-fish-green/30 rounded-lg text-white focus:outline-none focus:border-fish-green transition-all"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                下班时间
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-2 bg-fish-dark border border-fish-green/30 rounded-lg text-white focus:outline-none focus:border-fish-green transition-all"
              />
            </div>
          </div>
        </div>

        {/* 透明度设置 */}
        <div className="p-6 bg-fish-gray/50 rounded-lg border border-fish-green/20">
          <h3 className="font-bold mb-4 text-lg flex items-center gap-2">
            <span>🪟</span>
            <span>透明度设置</span>
          </h3>
          <div className="space-y-6">
            {/* 主窗口透明度 */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-gray-400">主窗口透明度</label>
                <span className="text-fish-green font-bold">
                  {mainOpacity}%
                </span>
              </div>
              <input
                type="range"
                min="30"
                max="100"
                value={mainOpacity}
                onChange={(e) => handleMainOpacityChange(e.target.value)}
                className="w-full h-2 bg-fish-dark rounded-lg appearance-none cursor-pointer accent-fish-green"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>30% (最低)</span>
                <span>100% (不透明)</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💡 拖动滑块可实时预览透明度效果
              </p>
            </div>

            {/* 浮窗透明度 */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-gray-400">浮窗默认透明度</label>
                <span className="text-fish-green font-bold">
                  {currentOpacity}%
                </span>
              </div>
              <input
                type="range"
                min="30"
                max="100"
                value={currentOpacity}
                onChange={(e) => handleOpacityChange(e.target.value)}
                className="w-full h-2 bg-fish-dark rounded-lg appearance-none cursor-pointer accent-fish-green"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>30% (最低)</span>
                <span>100% (不透明)</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💡 控制小说浮窗和内置浏览器的默认透明度
              </p>
            </div>
          </div>
        </div>

        {/* 快捷键设置 */}
        <div className="p-6 bg-fish-gray/50 rounded-lg border border-fish-green/20">
          <h3 className="font-bold mb-4 text-lg flex items-center gap-2">
            <span>⌨️</span>
            <span>紧急隐藏快捷键</span>
          </h3>

          <div className="space-y-4">
            <div className="p-4 bg-fish-dark/50 rounded-lg">
              <p className="text-sm text-gray-400 mb-3">当前快捷键：</p>
              <div className="flex items-center gap-3">
                <kbd className="px-4 py-2 bg-fish-gray rounded text-fish-green font-bold text-lg">
                  {formatHotkey(hideHotkey)}
                </kbd>
                {!isDefaultHotkey && (
                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                    一次性使用
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-gray-400 mb-2">
                快捷键方案：
              </label>

              <button
                onClick={() => handleHotkeyChange('default')}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  hotkeyPreset === 'default'
                    ? 'border-fish-green bg-fish-green/10'
                    : 'border-fish-green/20 hover:border-fish-green/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold mb-1">
                      Ctrl + Shift + Q（推荐）
                    </div>
                    <div className="text-sm text-gray-400">
                      稳定可靠，不会误触
                    </div>
                  </div>
                  {hotkeyPreset === 'default' && (
                    <span className="text-fish-green">✓</span>
                  )}
                </div>
              </button>

              <button
                onClick={() => handleHotkeyChange('space')}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  hotkeyPreset === 'space'
                    ? 'border-fish-green bg-fish-green/10'
                    : 'border-fish-green/20 hover:border-fish-green/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold mb-1 flex items-center gap-2">
                      <span>Space（空格）</span>
                      <span className="text-xs text-yellow-400">一次性</span>
                    </div>
                    <div className="text-sm text-gray-400">
                      快速隐藏，使用后恢复默认
                    </div>
                  </div>
                  {hotkeyPreset === 'space' && (
                    <span className="text-fish-green">✓</span>
                  )}
                </div>
              </button>

              <button
                onClick={() => handleHotkeyChange('f1')}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  hotkeyPreset === 'f1'
                    ? 'border-fish-green bg-fish-green/10'
                    : 'border-fish-green/20 hover:border-fish-green/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold mb-1 flex items-center gap-2">
                      <span>F1</span>
                      <span className="text-xs text-yellow-400">一次性</span>
                    </div>
                    <div className="text-sm text-gray-400">
                      单键快速，使用后恢复默认
                    </div>
                  </div>
                  {hotkeyPreset === 'f1' && (
                    <span className="text-fish-green">✓</span>
                  )}
                </div>
              </button>

              <button
                onClick={() => handleHotkeyChange('esc')}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  hotkeyPreset === 'esc'
                    ? 'border-fish-green bg-fish-green/10'
                    : 'border-fish-green/20 hover:border-fish-green/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold mb-1 flex items-center gap-2">
                      <span>Esc</span>
                      <span className="text-xs text-yellow-400">一次性</span>
                    </div>
                    <div className="text-sm text-gray-400">
                      最快速，使用后恢复默认
                    </div>
                  </div>
                  {hotkeyPreset === 'esc' && (
                    <span className="text-fish-green">✓</span>
                  )}
                </div>
              </button>
            </div>

            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-xs text-yellow-400">
                💡
                "一次性"快捷键：使用一次后自动恢复为默认（Ctrl+Shift+Q），避免误触
              </p>
            </div>
          </div>
        </div>

        {/* 其他快捷键说明 */}
        <div className="p-6 bg-fish-gray/50 rounded-lg border border-fish-green/20">
          <h3 className="font-bold mb-4 text-lg">其他快捷键</h3>
          <div className="space-y-2 text-sm text-gray-400">
            <div className="flex justify-between">
              <span>显示窗口</span>
              <kbd className="px-2 py-1 bg-fish-dark rounded text-fish-green">
                Ctrl+Shift+S
              </kbd>
            </div>
            <div className="flex justify-between">
              <span>假装工作</span>
              <kbd className="px-2 py-1 bg-fish-dark rounded text-fish-green">
                Ctrl+Shift+F
              </kbd>
            </div>
          </div>
        </div>

        {/* 保存按钮 */}
        <button
          onClick={handleSave}
          className={`
          w-full px-6 py-3 font-bold rounded-lg transition-all hover:scale-105
          ${
            saved
              ? 'bg-fish-green/50 text-white'
              : 'bg-fish-green text-fish-dark hover:bg-fish-green/80 hover:shadow-lg hover:shadow-fish-green/50'
          }
        `}
        >
          {saved ? '✓ 保存成功！' : '保存设置'}
        </button>
      </div>
    </div>
  );
}

export default App;
