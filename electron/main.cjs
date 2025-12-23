const {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain,
  Tray,
  Menu,
  dialog,
} = require('electron');
const path = require('path');
const Store = require('electron-store');
const fs = require('fs');
const {
  createNovelWindow,
  closeNovelWindow,
  getNovelWindow,
} = require('./novelWindow.cjs');
const {
  createBrowserWindow,
  getBrowserView,
  getBrowserWindow,
  closeBrowserWindow,
} = require('./browserWindow.cjs');
const {
  createStealthWindow,
  closeStealthWindow,
  getStealthWindow,
} = require('./stealthWindow.cjs');

const store = new Store();

let mainWindow = null;
let tray = null;

const TRIAL_DAYS = 10;
const FIRST_LAUNCH_KEY = 'firstLaunchDate';

// 获取试用剩余天数
function getTrialDaysRemaining() {
  const firstLaunch = store.get(FIRST_LAUNCH_KEY);
  if (!firstLaunch) {
    store.set(FIRST_LAUNCH_KEY, Date.now());
    return TRIAL_DAYS;
  }

  const daysPassed = Math.floor(
    (Date.now() - firstLaunch) / (1000 * 60 * 60 * 24)
  );
  return Math.max(0, TRIAL_DAYS - daysPassed);
}

// 检查试用是否过期
function checkTrialExpired() {
  const daysRemaining = getTrialDaysRemaining();
  return daysRemaining <= 0;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    backgroundColor: '#0a0a0a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (!app.isPackaged) {
    mainWindow.loadURL('http://localhost:5173');
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // 恢复透明度
  const savedOpacity = store.get('mainOpacity', 100);
  mainWindow.setOpacity(savedOpacity / 100);

  // 页面加载完成后检查试用期
  mainWindow.webContents.on('did-finish-load', () => {
    if (checkTrialExpired()) {
      dialog.showMessageBox(mainWindow, {
        type: 'warning',
        title: '试用期已结束',
        message: '您的 10 天试用期已结束',
        detail: '感谢您试用 FishLayer！如需继续使用，请联系我们获取完整版本。',
        buttons: ['确定'],
      });
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// 创建托盘图标
function createTray() {
  const iconPath = path.join(__dirname, '../public/icon.png');

  if (fs.existsSync(iconPath)) {
    tray = new Tray(iconPath);

    const contextMenu = Menu.buildFromTemplate([
      { label: '显示主窗口', click: () => mainWindow?.show() },
      { label: '退出', click: () => app.quit() },
    ]);

    tray.setToolTip('FishLayer');
    tray.setContextMenu(contextMenu);

    tray.on('click', () => {
      if (mainWindow) {
        mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
      }
    });
  }
}

app.whenReady().then(() => {
  createWindow();
  createTray();
  registerGlobalShortcuts();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// ========== 快捷键注册 ==========
function registerGlobalShortcuts() {
  console.log('\n=== 注册快捷键 ===');

  const hideHotkey = store.get('hideHotkey', 'CommandOrControl+Shift+Q');
  console.log('隐藏快捷键:', hideHotkey);

  const hideSuccess = globalShortcut.register(hideHotkey, () => {
    if (mainWindow) {
      mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
    }
  });

  if (hideSuccess) {
    console.log('✓ 隐藏快捷键注册成功');
  } else {
    console.error('✗ 隐藏快捷键注册失败');
  }

  const showSuccess = globalShortcut.register(
    'CommandOrControl+Shift+S',
    () => {
      mainWindow?.show();
    }
  );

  if (showSuccess) {
    console.log('✓ 显示快捷键注册成功');
  }

  console.log('注册假装工作快捷键...');
  const fakeWorkSuccess = globalShortcut.register(
    'CommandOrControl+Shift+F',
    () => {
      if (mainWindow) {
        mainWindow.webContents.send('trigger-fake-work');
      }
    }
  );

  if (fakeWorkSuccess) {
    console.log('✓ 假装工作快捷键注册成功');
  }

  console.log('=== 快捷键注册完成 ===\n');
}

// ========== IPC 处理器 ==========

// 试用天数
ipcMain.handle('get-trial-days', () => {
  return getTrialDaysRemaining();
});

// 重置试用期（仅用于开发/测试）
ipcMain.handle('reset-trial', () => {
  store.delete(FIRST_LAUNCH_KEY);
  console.log('✓ 试用期已重置');
  return { success: true, message: '试用期已重置为 10 天' };
});

// 工作时间
ipcMain.handle('save-work-time', (event, workTime) => {
  store.set('workTime', workTime);
  return { success: true };
});

ipcMain.handle('get-work-time', () => {
  return store.get('workTime', { start: '09:00', end: '18:00' });
});

// 设置
ipcMain.handle('save-setting', (event, key, value) => {
  store.set(key, value);
  return { success: true };
});

ipcMain.handle('get-setting', (event, key) => {
  return store.get(key);
});

// 窗口控制
ipcMain.on('hide-window', () => {
  mainWindow?.hide();
});

ipcMain.on('show-window', () => {
  mainWindow?.show();
});

// 主窗口透明度
ipcMain.handle('set-main-opacity', (event, opacity) => {
  const value = Math.max(0.3, Math.min(1.0, opacity / 100));
  mainWindow?.setOpacity(value);
  store.set('mainOpacity', opacity);
  return { success: true };
});

ipcMain.handle('get-main-opacity', () => {
  return store.get('mainOpacity', 100);
});

// 快捷键
ipcMain.handle('get-hide-hotkey', () => {
  return store.get('hideHotkey', 'CommandOrControl+Shift+Q');
});

ipcMain.handle('set-hide-hotkey', (event, hotkey) => {
  globalShortcut.unregisterAll();
  store.set('hideHotkey', hotkey);
  registerGlobalShortcuts();

  if (mainWindow) {
    mainWindow.webContents.send('hotkey-updated', hotkey);
  }

  return { success: true };
});

ipcMain.handle('is-default-hotkey', () => {
  const current = store.get('hideHotkey', 'CommandOrControl+Shift+Q');
  return current === 'CommandOrControl+Shift+Q';
});

// ========== 小说窗口 ==========
ipcMain.handle('open-novel-window', () => {
  createNovelWindow();
  return { success: true };
});

ipcMain.handle('close-novel-window', () => {
  closeNovelWindow();
  return { success: true };
});

ipcMain.handle('get-current-novel', () => {
  return store.get('currentNovel', null);
});

ipcMain.handle('set-novel-opacity', (event, opacity) => {
  const novelWindow = getNovelWindow();
  if (novelWindow && !novelWindow.isDestroyed()) {
    const value = Math.max(0.3, Math.min(1.0, opacity / 100));
    novelWindow.setOpacity(value);
    store.set('novelOpacity', opacity);
  }
  return { success: true };
});

// ========== 内置浏览器 ==========
ipcMain.handle('open-browser-window', (event, url) => {
  console.log('📱 收到打开浏览器请求, URL:', url);
  try {
    createBrowserWindow(store, url);
    console.log('✓ 浏览器窗口创建成功');
    return { success: true };
  } catch (error) {
    console.error('❌ 打开浏览器失败:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('browser-go-back', () => {
  const view = getBrowserView();
  if (view) {
    view.webContents.goBack();
  }
  return { success: true };
});

ipcMain.handle('browser-go-forward', () => {
  const view = getBrowserView();
  if (view) {
    view.webContents.goForward();
  }
  return { success: true };
});

ipcMain.handle('browser-reload', () => {
  const view = getBrowserView();
  if (view) {
    view.webContents.reload();
  }
  return { success: true };
});

ipcMain.handle('browser-get-url', () => {
  const view = getBrowserView();
  return view ? view.webContents.getURL() : '';
});

ipcMain.handle('set-browser-opacity', (event, opacity) => {
  const browserWindow = getBrowserWindow();
  if (browserWindow && !browserWindow.isDestroyed()) {
    const value = Math.max(0.3, Math.min(1.0, opacity / 100));
    browserWindow.setOpacity(value);
    store.set('browserOpacity', opacity);
  }
  return { success: true };
});

ipcMain.handle('get-browser-opacity', () => {
  return store.get('browserOpacity', 100);
});

// ========== 浏览器抓取内容 ==========
ipcMain.handle('browser-capture-content', async () => {
  console.log('\n========== 开始抓取 ==========');

  store.delete('currentNovel');

  const view = getBrowserView();
  if (!view) {
    console.error('❌ 浏览器未打开');
    return { success: false, error: '浏览器未打开' };
  }

  const url = view.webContents.getURL();
  console.log('📍 URL:', url);

  try {
    // 如果页面正在加载，等待加载完成
    if (view.webContents.isLoading()) {
      console.log('⏳ 等待页面加载...');
      await new Promise((resolve) => {
        view.webContents.once('did-finish-load', resolve);
      });
    }

    // 短暂等待，确保动态内容加载
    console.log('⏳ 等待1秒确保内容加载...');
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log('📖 获取标题...');
    let title;
    try {
      title = await view.webContents.executeJavaScript('document.title', true);
      console.log('✓ 标题:', title);
    } catch (err) {
      console.error('❌ 获取标题失败:', err.message);
      title = '未知标题';
    }

    console.log('📄 获取文本...');
    let bodyText;
    try {
      bodyText = await view.webContents.executeJavaScript(
        'document.body.innerText',
        true
      );
      console.log('✓ 文本长度:', bodyText.length);
    } catch (err) {
      console.error('❌ 获取文本失败:', err.message);
      return { success: false, error: '无法获取页面文本: ' + err.message };
    }

    if (!bodyText || bodyText.length < 100) {
      console.error('❌ 页面内容太少:', bodyText.length);
      return { success: false, error: '页面内容太少，请确保页面已完全加载' };
    }

    console.log('🔧 处理文本...');
    const lines = bodyText.split('\n');
    const paragraphs = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.length < 15) continue;
      if (['返回', '目录', '加入书架', '上一章', '下一章'].includes(trimmed))
        continue;
      if (trimmed.startsWith('* ')) continue;
      paragraphs.push(trimmed);
    }

    console.log('✓ 有效段落数:', paragraphs.length);
    if (paragraphs.length > 0) {
      console.log('📝 前3段预览:');
      paragraphs.slice(0, 3).forEach((p, i) => {
        console.log(`  ${i + 1}. ${p.substring(0, 50)}...`);
      });
    }

    if (paragraphs.length === 0) {
      console.error('❌ 没有有效段落');
      return { success: false, error: '没有找到有效的文本段落' };
    }

    let cleanTitle = title.split('_')[0].split('-')[0];
    cleanTitle = cleanTitle
      .replace(/连载中/g, '')
      .replace(/\n/g, ' ')
      .trim();

    const content = paragraphs
      .map(
        (p) =>
          `<p style="text-indent:2em;margin:1em 0;line-height:1.8;">${p
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')}</p>`
      )
      .join('\n');

    const novelData = {
      title: cleanTitle,
      content: content,
      url: url,
      site: 'basic',
      timestamp: Date.now(),
    };

    store.set('currentNovel', novelData);
    console.log('💾 小说数据已保存');
    console.log('✅ 抓取成功！标题:', cleanTitle);
    console.log('====================================\n');

    return { success: true, title: cleanTitle };
  } catch (error) {
    console.error('❌ 抓取异常:', error.message);
    console.error(error.stack);
    return { success: false, error: error.message };
  }
});

// ========== 隐蔽阅读模式 ==========
ipcMain.handle('open-stealth-reader', () => {
  createStealthWindow();
  return { success: true };
});

ipcMain.handle('close-stealth-reader', () => {
  closeStealthWindow();
  return { success: true };
});
