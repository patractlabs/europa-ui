const { app, BrowserWindow } = require('electron');
const { dialog } = require('electron');
const { ipcMain } = require('electron');

function createWindow () {
  const win = new BrowserWindow({
    maximizable: true,
    movable: true,
    frame: true,
    title: 'Europa',
    width: 950,
    height: 900,
    useContentSize: false,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule:true,
    },
  });

  win.setMenuBarVisibility(false);
  // win.openDevTools({mode:'detach'});
  // win.loadURL('http://localhost:3000/');
  win.loadFile('./build/index.html');

  return win;
}

app.whenReady().then(() => {
  const { webContents } = createWindow();

  ipcMain.on('req:choose-dir', () => {
    console.log('main got message req:choose-dir')
    dialog
      .showOpenDialog({ properties: ['openDirectory'] })
      .then(result => !result.canceled && webContents.send('res:choose-dir', result.filePaths[0]));
  });

  ipcMain.on('req:choose-file', (event, data) => {
    console.log('main got message req:choose-file', data);
    dialog
      .showOpenDialog({ properties: ['openFile'], filters: data.filters })
      .then(result => !result.canceled && webContents.send('res:choose-file', result.filePaths[0]));
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

process.on('exit', (code, a) => console.log('exit', code, a))
