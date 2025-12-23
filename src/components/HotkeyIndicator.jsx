import React, { useState, useEffect } from 'react';

function HotkeyIndicator({ inline = false }) {
  const [hotkey, setHotkey] = useState('Ctrl+Shift+Q');
  const [isDefault, setIsDefault] = useState(true);

  useEffect(() => {
    if (window.electronAPI) {
      // 加载当前快捷键
      window.electronAPI.getHideHotkey().then((hk) => {
        setHotkey(formatHotkey(hk));
      });

      // 检查是否默认
      window.electronAPI.isDefaultHotkey().then((def) => {
        setIsDefault(def);
      });

      // 监听快捷键更新
      window.electronAPI.onHotkeyUpdated((hk) => {
        setHotkey(formatHotkey(hk));
        window.electronAPI.isDefaultHotkey().then((def) => {
          setIsDefault(def);
        });
      });
    }
  }, []);

  const formatHotkey = (hk) => {
    return hk.replace('CommandOrControl', 'Ctrl').replace(/\+/g, ' + ');
  };

  // 内联模式（状态栏）
  if (inline) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">紧急隐藏：</span>
        <kbd className="px-2 py-1 bg-fish-dark rounded text-fish-green font-mono text-xs">
          {hotkey}
        </kbd>
        {!isDefault && <span className="text-xs text-yellow-400">一次性</span>}
      </div>
    );
  }

  // 悬浮模式（暂时不用）
  return null;
}

export default HotkeyIndicator;
