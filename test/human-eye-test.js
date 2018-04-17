const fs = require('fs');
const exec = require('child_process').exec;
const path = require('path');
const generateImages = require('./generateImages');

function getCommandLine() {
  switch (process.platform) {
     case 'darwin' : return 'open';
     case 'win32' : return 'start';
     case 'win64' : return 'start';
     default : return 'xdg-open';
  }
}

generateImages().then(baseNames => {
  const htmlPath = path.join(__dirname, 'index.html');
  const html = fs.readFileSync(path.join(__dirname, 'index.html'));
  const replaced = html.toString().replace(
    /<script id="files">.*<\/script>/,
    `<script id="files">var files = ${JSON.stringify(baseNames)};</script>`
  );
  fs.writeFileSync(htmlPath, replaced);
  console.log('index.html updated');
}).then(() => {
  exec(getCommandLine() + ' ' + path.join(__dirname, 'index.html'));
}).catch((e) => {
  console.error(e);
});
