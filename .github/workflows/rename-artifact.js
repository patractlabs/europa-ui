const fs = require('fs');
const path = require('path');

const dir = path.resolve(__dirname, '../../dist');
const file = fs.readdirSync(dir).find(file => /^Europa-UI.*((\.AppImage)|(\.exe)|(\.dmg))$/.test(file));
const newFile = 'europa';

console.log(`rename file: ${file} -> ${newFile}`)

fs.renameSync(path.resolve(dir, file), path.resolve(dir, newFile))