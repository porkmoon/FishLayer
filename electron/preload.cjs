const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // 试用天数
  getTrialDays: () => ipcRenderer.invoke('get-trial-days'),
  resetTrial: () => ipcRenderer.invoke('reset-trial'),

  // 工作时间
  saveWorkTime: (workTime) => ipcRenderer.invoke('save-work-time', workTime),
  getWorkTime: () => ipcRenderer.invoke('get-work-time'),

  // 设置
  saveSetting: (key, value) => ipcRenderer.invoke('save-setting', key, value),
  getSetting: (key) => ipcRenderer.invoke('get-setting', key),

  // 窗口控制
  hideWindow: () => ipcRenderer.send('hide-window'),
  showWindow: () => ipcRenderer.send('show-window'),

  // 主窗口透明度
  setMainOpacity: (opacity) => ipcRenderer.invoke('set-main-opacity', opacity),
  getMainOpacity: () => ipcRenderer.invoke('get-main-opacity'),

  // 小说相关
  getCurrentNovel: () => ipcRenderer.invoke('get-current-novel'),
  openNovelWindow: () => ipcRenderer.invoke('open-novel-window'),
  closeNovelWindow: () => ipcRenderer.invoke('close-novel-window'),
  setNovelOpacity: (opacity) =>
    ipcRenderer.invoke('set-novel-opacity', opacity),

  // 浏览器相关
  openBrowserWindow: (url) => ipcRenderer.invoke('open-browser-window', url),
  browserGoBack: () => ipcRenderer.invoke('browser-go-back'),
  browserGoForward: () => ipcRenderer.invoke('browser-go-forward'),
  browserReload: () => ipcRenderer.invoke('browser-reload'),
  browserGetUrl: () => ipcRenderer.invoke('browser-get-url'),
  browserCaptureContent: () => ipcRenderer.invoke('browser-capture-content'),
  setBrowserOpacity: (opacity) =>
    ipcRenderer.invoke('set-browser-opacity', opacity),
  getBrowserOpacity: () => ipcRenderer.invoke('get-browser-opacity'),

  // 快捷键相关
  getHideHotkey: () => ipcRenderer.invoke('get-hide-hotkey'),
  setHideHotkey: (hotkey) => ipcRenderer.invoke('set-hide-hotkey', hotkey),
  isDefaultHotkey: () => ipcRenderer.invoke('is-default-hotkey'),
  onHotkeyUpdated: (callback) => {
    ipcRenderer.on('hotkey-updated', (event, hotkey) => callback(hotkey));
  },

  // 假装工作
  onTriggerFakeWork: (callback) => {
    ipcRenderer.on('trigger-fake-work', () => callback());
  },

  // ========== 隐蔽阅读模式（新增）==========
  openStealthReader: () => ipcRenderer.invoke('open-stealth-reader'),
  closeStealthReader: () => ipcRenderer.invoke('close-stealth-reader'),

  platform: process.platform,
});
