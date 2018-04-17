const fs = require('fs');
const path = require('path');
const text2png = require('../index.js');
const util = require('util');

const writeFile = util.promisify(fs.writeFile);

const generateImages = () => {
  // read jsons in 'testcases' dir
  const files = fs.readdirSync(path.join(__dirname, 'testcases'));

  // apply text2png for each cases
  const promises = files.map((fileName) => {
    const [text, option] = require(`./testcases/${fileName}`);
    const baseName = path.basename(fileName, '.json');
    const outputPath = path.join(__dirname, 'actual', baseName + '.png');
    console.log(fileName);
    return writeFile(outputPath, text2png(text, option)).then(() => baseName);
  });

  // write filenames into file.js
  return Promise.all(promises);
};

if (require.main === module) {
  generateImages().then(results => {
    console.log(`images generated successfully`);
  }).catch((e) => {
    console.error(e);
  });
} else {
  module.exports = generateImages;
}
