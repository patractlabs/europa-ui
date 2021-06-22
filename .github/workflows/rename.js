const fs = require('fs');
const path = require('path');

const dir = path.resolve(__dirname, `../../`);
const file = fs.readdirSync(dir).find(file => /^europa-/.test(file));
const postfix = file.split('.')[file.split('.').length - 1]
const newFile = `europa${postfix ? '.' + postfix : ''}`;

console.log(`rename file: ${file} -> ${newFile}`)

fs.renameSync(path.resolve(dir, file), path.resolve(dir, 'resources', newFile))