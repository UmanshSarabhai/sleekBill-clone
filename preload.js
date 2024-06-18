const { contextBridge, ipcRenderer,dialog } = require("electron");

contextBridge.exposeInMainWorld("api", {
  invoke: (...args) => ipcRenderer.invoke(...args),
  // showMessage:(options)=>{dialog.showMessageBoxSync(null,options)}
});
