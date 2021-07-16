const { app, BrowserWindow } = require('electron');
const { dialog } = require('electron');
const { ipcMain } = require('electron');

let pid = 0;

function createWindow () {
  const win = new BrowserWindow({
    icon: './resources/32x32.ico',
    maximizable: true,
    movable: true,
    frame: true,
    title: 'Europa',
    width: 1200,
    height: 850,
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
    // win.loadFile('./build/index.html');
    win.loadURL('http://localhost:3000/');
  } else {
    win.loadFile('./build/index.html');
  }

  return win;
}

app.whenReady().then(() => {
  // const childProcess = require('child_process');

  // const e = childProcess.spawn('./resources/europa');

  // e.stderr.on('data', (data) => console.log('stderr data'))
  // e.stderr.on('error', (err) => console.log('stderr err', err))
  // e.stderr.on('close', (err) => console.log('stderr close', err))
  // e.stderr.on('end', (err) => console.log('stderr end', err))
  // e.stderr.on('pause', (err) => console.log('stderr pause', err))

  // e.stdout.on('data', (data) => console.log('stdout data'))
  // // e.stdout.on('error', (err) => console.log('stdout err', err))
  // e.stdout.on('close', (err) => console.log('stdout close', err))
  // e.stdout.on('end', (err) => console.log('stdout end', err))
  // e.stdout.on('pause', (err) => console.log('stdout pause', err))

  // e.on('spawn', () => console.log('spawn'))
  // e.on('message', (m) => console.log('message', m))
  // e.on('close', (code, signal) => console.log('close', code, signal))
  // e.on('error', (err) => console.log('error', err))
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
