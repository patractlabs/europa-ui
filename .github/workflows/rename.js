const fs = require('fs');
const path = require('path');

const dir = path.resolve(__dirname, '../../');
const file = fs.readdirSync(dir).find(file => /^europa-/.test(file));
const newFile = file.endsWith('.exe') ? 'europa.exe' : 'europa';

console.log(`rename file: ${file} -> ${newFile}`)

fs.renameSync(path.resolve(dir, file), path.resolve(dir, 'resources', newFile))