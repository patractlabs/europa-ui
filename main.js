const { app, BrowserWindow } = require('electron')
const path = require('path')
const childProcess = require('child_process');
const fs = require('fs');

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile('./build/index.html')
}

app.whenReady().then(() => {
  let binPath = path.resolve(__dirname, 'bin-deps', 'europa_win.exe');
  if (process.platform === 'linux') {
    binPath = path.resolve(__dirname, 'bin-deps', 'europa_linux_amd64');
  }
  
  console.log(`bin path:`, binPath);
  console.log(`platform:`, process.platform);
  console.log('files:', fs.readdirSync(path.resolve(__dirname, 'bin-deps')));
  childProcess.execFile(binPath, ['--tmp']);

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