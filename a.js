const c = require('child_process')
const fs = require('fs')

// try {
//   const b = c.spawn('C:\\europa.exe', ['-d=/aaaa'])
//   // b.once('error', (e) => console.log('error', e))
//   // b.once('spawn', (e) => console.log('spawn'))
//   // b.once('message', (e) => console.log('message'))
//   // b.once('close', (e) => console.log('close', e))
//   // b.once('exit', (e) => console.log('exit', e))
//   b.stderr.on('data', (a) => console.log('stderr.data', a.toString()))
//   // console.log('connected', b.connected)
//   // console.log('signalCode', b.signalCode)
//   // console.log('pid', b.pid)
// } catch (e) {
//   console.log('ee')
// }

fs.promises.readFile('aaa')