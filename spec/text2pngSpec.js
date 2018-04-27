const fs = require('fs');
const path = require('path');
const glob = require('glob');

const text2png = require('../index.js');
const looksSame = require('looks-same');

function renderSass(file, prefix) {
  return sass.renderSync({
    file: [__dirname, 'support', file].join('/'),
    importer: createImporter({prefix: prefix, debug: true}),
    outputStyle: 'compressed',
  }).css.toString();
}

describe('text2png', () => {
  glob.sync(path.resolve(__dirname, 'testcases', '*.json')).forEach(filePath => {
    const fileName = path.basename(filePath, '.json');
    console.log(fileName);

    it('matches ' + fileName, () => {
      const config = JSON.parse(fs.readFileSync(filePath));

      return new Promise((resolve, reject) => {
        looksSame(
          text2png.apply(text2png, config),
          fs.readFileSync(path.join(__dirname, 'expected', fileName + '.png')),
          { tolerance: 0.2, ignoreAntialiasing: true },
          (error, match) => {
            if (error) reject(error);

            expect(match).toBe(true, 'generated image does not match');
            resolve();
          }
        );
      })
    })
  });
})
