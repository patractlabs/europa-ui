const c = require('child_process')

try {
  const b = c.spawn('C:\\europa.exe', ['-d=/'])
  b.once('error', (e) => console.log('error', e))
  b.once('spawn', (e) => console.log('spawn'))
  b.once('message', (e) => console.log('message'))
  b.once('close', (e) => console.log('close', e))
  b.once('exit', (e) => console.log('exit', e))
  b.stderr.on('data', (a) => console.log('stderr.data', a.toString()))
  console.log('connected', b.connected)
  console.log('signalCode', b.signalCode)
  console.log('pid', b.pid)
} catch (e) {
  console.log('ee')
}

// const a = new Promise((resolve, reject) => {
//   reject(1)
//   reject(2)
//   resolve(3);
// });
// a.then(a => console.log('t', a), a => console.log('f', a))

2021-07-01 16:09:55  Database: RocksDb at /home/xyl/euro/a/chains/dev/db    
2021-07-01 16:09:55  Workspace: a | Current workspace list: ["a"]    
2021-07-01 16:09:55 ⛓  Native runtime: europa-3 (europa-1.tx1.au1)    
Error: Service(Client(Backend("IO error: While lock file: /home/xyl/euro/a/chains/dev/db_state_kv/LOCK: Resource temporarily unavailable")))
