const { app, BrowserWindow } = require('electron')
const path = require('path')
const fs = require('fs');
const os = require('os');

function createWindow () {
  const win = new BrowserWindow({
    maximizable: true,
    movable: true,
    frame: true,
    title: 'Europa',
    useContentSize: false,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
      contextIsolation: false
    },
  })

  win.openDevTools({mode:'detach'})

  if (process.env.NODE_ENV === 'development') {
    win.loadFile('./build/index.html')
  } else {
    win.loadFile('./build/index.html')
  }
}

app.whenReady().then(() => {
  const platform = os.platform().toLowerCase();
  let binPath = path.resolve(__dirname, '../app.asar.unpacked/resources', 'europa-win.exe');

  if (platform === 'linux') {
    binPath = path.resolve(__dirname, '../app.asar.unpacked/resources', 'europa');
  } else if (platform === 'darwin') {
    binPath = path.resolve(__dirname, '../app.asar.unpacked/resources', 'europa-darwin');
  }

  console.log(`platform:`, platform);
  console.log(`bin:`, binPath);
  console.log(`dir:`, __dirname);
  console.log('files:', fs.readdirSync(path.resolve(__dirname)));
  console.log('files:', fs.readdirSync(path.resolve(__dirname, '../')));
  console.log('files:', fs.readdirSync(path.resolve(__dirname, '../../')));

  createWindow()

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