const { contextBridge, ipcRenderer } = require('electron');

console.log('[novelPreload] 开始加载');

try {
  contextBridge.exposeInMainWorld('novelAPI', {
    getCurrentNovel: () => {
      console.log('[novelPreload] 调用 getCurrentNovel');
      return ipcRenderer.invoke('get-current-novel');
    },

    closeWindow: () => {
      console.log('[novelPreload] 调用 closeWindow');
      return ipcRenderer.invoke('close-novel-window');
    },

    setOpacity: (opacity) => {
      console.log('[novelPreload] 调用 setOpacity:', opacity);
      return ipcRenderer.invoke('set-novel-opacity', opacity);
    },
  });

  console.log('[novelPreload] novelAPI 已暴露');
} catch (err) {
  console.error('[novelPreload] 暴露 API 失败:', err);
}
