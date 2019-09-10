/* global expect */
/* eslint no-console:0 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const text2png = require('../index.js');
const looksSame = require('looks-same');

describe('text2png', () => {
  glob
    .sync(path.resolve(__dirname, 'testcases', '*.json'))
    .forEach(filePath => {
      const fileName = path.basename(filePath, '.json');
      console.log(fileName);

      it('matches ' + fileName, () => {
        const config = JSON.parse(fs.readFileSync(filePath));

        return new Promise((resolve, reject) => {
          looksSame(
            text2png.apply(text2png, config),
            fs.readFileSync(
              path.join(__dirname, 'expected', fileName + '.png')
            ),
            {
              tolerance: 0.2,
              ignoreAntialiasing: true,
              antialiasingTolerance: 3
            },
            (error, { equal }) => {
              if (error) reject(error);
              expect(equal).toBe(true, 'generated image does not match');
              resolve();
            }
          );
        });
      });
    });
});
