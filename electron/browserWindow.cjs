const { BrowserWindow, BrowserView } = require('electron');
const path = require('path');

let browserWindow = null;
let browserView = null;

function createBrowserWindow(store, initialUrl = null) {
  console.log('\n========== 创建内置浏览器 ==========');
  if (browserWindow && !browserWindow.isDestroyed()) {
    console.log('浏览器窗口已存在');
    browserWindow.focus();
    
    // 如果提供了 URL，导航到该 URL
    if (initialUrl && browserView && !browserView.isDestroyed()) {
      console.log('导航到:', initialUrl);
      browserView.webContents.loadURL(initialUrl).catch((err) => {
        console.error('导航失败:', err);
      });
    }
    return;
  }

  try {
    const preloadPath = path.join(__dirname, 'preload.cjs');
    console.log('Preload 路径:', preloadPath);

    browserWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      frame: false,
      backgroundColor: '#1a1a1a',
      webPreferences: {
        preload: preloadPath,
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: true,
      },
    });

    console.log('窗口创建成功');
    
    // 创建 BrowserView
    browserView = new BrowserView({
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    console.log('BrowserView 创建成功');

    browserWindow.setBrowserView(browserView);

    // 设置 BrowserView 的位置和大小
    const updateBounds = () => {
      const { width, height } = browserWindow.getContentBounds();
      const toolbarHeight = 60;
      
      browserView.setBounds({
        x: 0,
        y: toolbarHeight,
        width: width,
        height: height - toolbarHeight,
      });
    };

    updateBounds();
    browserWindow.on('resize', updateBounds);

    // 加载控制界面
    const isDev = !require('electron').app.isPackaged;
    if (isDev) {
      const url = 'http://localhost:5173/#/browser-window';
      console.log('加载开发URL:', url);
      browserWindow.loadURL(url);
    } else {
      const htmlPath = path.join(__dirname, '../dist/index.html');
      console.log('加载生产HTML:', htmlPath);
      browserWindow.loadFile(htmlPath, {
        hash: '/browser-window',
      });
    }

    // 监听主窗口加载完成
    browserWindow.webContents.on('did-finish-load', () => {
      console.log('✓ 控制界面加载完成');
    });

    // 监听主窗口加载失败
    browserWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.error('❌ 控制界面加载失败');
      console.error('  错误代码:', errorCode);
      console.error('  错误描述:', errorDescription);
    });

    // 打开主窗口的开发者工具（用于调试）
    if (isDev) {
      browserWindow.webContents.openDevTools({ mode: 'detach' });
    }

    // 默认加载一个页面
    const defaultUrl = initialUrl || 'https://www.baidu.com';
    console.log('加载默认页面:', defaultUrl);
    browserView.webContents.loadURL(defaultUrl).catch((err) => {
      console.error('加载默认页面失败:', err);
    });

    // 监听加载完成
    browserView.webContents.on('did-finish-load', () => {
      console.log('页面加载完成:', browserView.webContents.getURL());
    });

    // 监听加载失败
    browserView.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
      console.error('页面加载失败:');
      console.error('  URL:', validatedURL);
      console.error('  错误代码:', errorCode);
      console.error('  错误描述:', errorDescription);
    });

    // 监听崩溃
    browserView.webContents.on('crashed', () => {
      console.error('BrowserView 崩溃！');
    });

    // 窗口关闭时清理
    browserWindow.on('closed', () => {
      console.log('浏览器窗口关闭');
      if (browserView && !browserView.isDestroyed()) {
        browserView.webContents.destroy();
      }
      browserView = null;
      browserWindow = null;
    });

    console.log('浏览器初始化完成');
    console.log('====================================\n');
  } catch (error) {
    console.error('创建浏览器失败:', error);
    console.error(error.stack);
  }
}

function getBrowserView() {
  return browserView;
}

function getBrowserWindow() {
  return browserWindow;
}

function closeBrowserWindow() {
  if (browserWindow && !browserWindow.isDestroyed()) {
    browserWindow.close();
  }
}

module.exports = {
  createBrowserWindow,
  getBrowserView,
  getBrowserWindow,
  closeBrowserWindow,
};
