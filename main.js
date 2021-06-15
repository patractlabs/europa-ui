const { app, BrowserWindow } = require('electron')
const path = require('path')
const childProcess = require('child_process');
const fs = require('fs');

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
  let binPath = path.resolve(__dirname, 'resources', 'europa-win.exe');
  // if (process.platform === 'linux') {
  //   binPath = path.resolve(__dirname, 'bin-deps', 'europa_linux_amd64');
  // }
  
  // childProcess.spawn(binPath);
  console.log(`bin path:`, binPath);
  console.log(`platform:`, process.platform);
  console.log('files:', fs.readdirSync(path.resolve(__dirname, 'build')));
  // childProcess.execFile(binPath, ['--tmp']);

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