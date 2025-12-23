const { BrowserWindow } = require('electron');
const path = require('path');

let stealthWindow = null;

function createStealthWindow() {
  console.log('创建隐蔽阅读窗口');

  if (stealthWindow && !stealthWindow.isDestroyed()) {
    console.log('窗口已存在，聚焦');
    stealthWindow.focus();
    return;
  }

  stealthWindow = new BrowserWindow({
    width: 800,
    height: 80,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: true,
    x: 100,
    y: 50,
    webPreferences: {
      preload: path.join(__dirname, 'novelPreload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const isDev = !require('electron').app.isPackaged;
  if (isDev) {
    stealthWindow.loadURL('http://localhost:5173/#/stealth-reader');
  } else {
    stealthWindow.loadFile(path.join(__dirname, '../dist/index.html'), {
      hash: '/stealth-reader',
    });
  }

  const Store = require('electron-store');
  const store = new Store();
  const savedOpacity = store.get('novelOpacity', 80);
  stealthWindow.setOpacity(savedOpacity / 100);

  stealthWindow.on('closed', () => {
    stealthWindow = null;
  });

  console.log('隐蔽阅读窗口创建完成');
}

function closeStealthWindow() {
  if (stealthWindow && !stealthWindow.isDestroyed()) {
    stealthWindow.close();
    stealthWindow = null;
  }
}

function getStealthWindow() {
  return stealthWindow;
}

module.exports = {
  createStealthWindow,
  closeStealthWindow,
  getStealthWindow,
};
