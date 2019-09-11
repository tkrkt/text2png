/* global expect */
/* eslint no-console:0 */

const fs = require("fs");
const path = require("path");
const glob = require("glob");

const text2png = require("../index.js");
const looksSame = require("looks-same");

const platform = {
  darwin: "osx",
  linux: "linux",

  // The following are not tested
  win32: "windows",
  aix: "linux",
  freebsd: "linux",
  openbsd: "linux",
  sunos: "linux"
}[process.platform];

describe("text2png", () => {
  glob
    .sync(path.resolve(__dirname, "testcases", "*.json"))
    .forEach(filePath => {
      const fileName = path.basename(filePath, ".json");
      console.log(fileName);

      it("matches " + fileName, () => {
        const config = JSON.parse(fs.readFileSync(filePath));
        const [, targetPlatform] = fileName.split("_");
        if (targetPlatform && targetPlatform !== platform) {
          return;
        }

        return new Promise((resolve, reject) => {
          looksSame(
            text2png.apply(text2png, config),
            fs.readFileSync(
              path.join(__dirname, "expected", platform, fileName + ".png")
            ),
            {
              tolerance: 0.2,
              ignoreAntialiasing: true,
              antialiasingTolerance: 3
            },
            (error, match) => {
              if (error) reject(error);
              expect(match.equal).toBe(true, match);
              resolve();
            }
          );
        });
      });
    });
});
