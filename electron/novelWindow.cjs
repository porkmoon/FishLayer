const { BrowserWindow } = require('electron');
const path = require('path');

let novelWindow = null;

function createNovelWindow() {
  console.log('\n========== 创建小说窗口 ==========');

  if (novelWindow && !novelWindow.isDestroyed()) {
    console.log('窗口已存在，聚焦');
    novelWindow.focus();
    return;
  }

  try {
    const preloadPath = path.join(__dirname, 'novelPreload.cjs');
    console.log('Preload 路径:', preloadPath);

    // 检查文件是否存在
    const fs = require('fs');
    if (!fs.existsSync(preloadPath)) {
      console.error('❌ novelPreload.cjs 不存在！');
      console.error('期望路径:', preloadPath);
      return;
    } else {
      console.log('✓ novelPreload.cjs 文件存在');
    }

    novelWindow = new BrowserWindow({
      width: 400,
      height: 600,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      skipTaskbar: true,
      resizable: true,
      show: false, // 先不显示，等加载完成
      webPreferences: {
        preload: preloadPath,
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    console.log('窗口已创建');

    // 加载页面
    const isDev = !require('electron').app.isPackaged;
    if (isDev) {
      const url = 'http://localhost:5173/#/novel-window';
      console.log('加载开发URL:', url);
      novelWindow.loadURL(url);
    } else {
      const htmlPath = path.join(__dirname, '../dist/index.html');
      console.log('加载生产HTML:', htmlPath);
      novelWindow.loadFile(htmlPath, { hash: '/novel-window' });
    }

    // 页面加载完成后显示
    novelWindow.webContents.on('did-finish-load', () => {
      console.log('页面加载完成');

      // 设置透明度
      const Store = require('electron-store');
      const store = new Store();
      const savedOpacity = store.get('novelOpacity', 80);
      const value = Math.max(0.3, Math.min(1.0, savedOpacity / 100));
      novelWindow.setOpacity(value);

      // 显示窗口
      novelWindow.show();

      // 打开开发者工具
      novelWindow.webContents.openDevTools();

      console.log('窗口已显示，开发者工具已打开');
    });

    // 监听加载错误
    novelWindow.webContents.on(
      'did-fail-load',
      (event, errorCode, errorDescription) => {
        console.error('❌ 页面加载失败');
        console.error('错误代码:', errorCode);
        console.error('错误描述:', errorDescription);
      }
    );

    // 监听渲染进程崩溃
    novelWindow.webContents.on('crashed', () => {
      console.error('❌ 渲染进程崩溃！');
    });

    // 监听窗口关闭
    novelWindow.on('closed', () => {
      console.log('窗口已关闭');
      novelWindow = null;
    });

    console.log('小说窗口初始化完成');
    console.log('====================================\n');
  } catch (error) {
    console.error('❌ 创建窗口失败:', error);
    console.error(error.stack);
  }
}

function closeNovelWindow() {
  if (novelWindow && !novelWindow.isDestroyed()) {
    novelWindow.close();
    novelWindow = null;
  }
}

function getNovelWindow() {
  return novelWindow;
}

module.exports = {
  createNovelWindow,
  closeNovelWindow,
  getNovelWindow,
};
