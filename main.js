const { app, BrowserWindow } = require('electron');
const { dialog } = require('electron');
const { ipcMain } = require('electron');

let pid = 0;

function createWindow () {
  const win = new BrowserWindow({
    maximizable: true,
    movable: true,
    frame: true,
    title: 'Europa',
    width: 1200,
    height: 720,
    useContentSize: false,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule:true,
    },
  });

  win.setMenuBarVisibility(false);

  win.openDevTools({mode:'detach'});
  if (process.env.ElECTRON_ENV === 'development') {
    win.loadURL('http://localhost:3000/');
  } else {
    win.loadFile('./build/index.html');
  }

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
    console.log('main got message - req:choose-file', data);
    dialog
      .showOpenDialog({ properties: ['openFile'], filters: data.filters })
      .then(result => !result.canceled && webContents.send('res:choose-file', result.filePaths[0]));
  });

  ipcMain.on('message:pid-change', (event, data) => {
    console.log('main got message - message:pid-change', data, typeof data);
    pid = data;
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  pid && process.kill(pid);
  pid = 0;
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
app.on('quit', () => {
  pid && process.kill(pid);
  pid = 0;
})
process.on('exit', () => {
  pid && process.kill(pid);
  pid = 0;
});
