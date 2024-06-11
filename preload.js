const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  invoke: (...args) => ipcRenderer.invoke(...args),
});
