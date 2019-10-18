#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const commander = require("commander");
const version = require("../package.json").version;
const text2png = require("../index.js");

commander
  .version(version)
  .description("Create png image from text.")
  .option("-t, --text <message>", "text")
  .option("-o, --output <path>", "output file path")
  .option("-f, --font <string>", 'css font option (e.g. "30px Lobster")')
  .option("-a, --textAlign <textAlign>", "text alignment")
  .option("-c, --color <color>", "text color")
  .option("-b, --backgroundColor <color>", "background color")
  .option("-s, --lineSpacing <number>", "line spacing")

  .option("--strokeWidth <number>", "stroke width")
  .option("--strokeColor <number>", "stroke color")

  .option(
    "-p, --padding <number>",
    "width of the padding area (left, top, right, bottom)"
  )
  .option("--paddingLeft <number>")
  .option("--paddingTop <number>")
  .option("--paddingRight <number>")
  .option("--paddingBottom <number>")

  .option(
    "--borderWidth <number>",
    "width of border (left, top, right, bottom)"
  )
  .option("--borderLeftWidth <number>")
  .option("--borderTopWidth <number>")
  .option("--borderRightWidth <number>")
  .option("--borderBottomWidth <number>")
  .option("--borderColor <color>", "border color")

  .option(
    "--localFontPath <path>",
    "path to local font (e.g. fonts/Lobster-Regular.ttf)"
  )
  .option("--localFontName <name>", "name of local font (e.g. Lobster)")

  .parse(process.argv);

const exec = text => {
  if ((commander.text || text) && commander.output) {
    const stream = text2png(commander.text || text, {
      font: commander.font,
      textAlign: commander.textAlign,
      color: commander.color,
      backgroundColor: commander.backgroundColor,
      lineSpacing: commander.lineSpacing && +commander.lineSpacing,

      padding: commander.padding && +commander.padding,
      paddingLeft: commander.paddingLeft && +commander.paddingLeft,
      paddingTop: commander.paddingTop && +commander.paddingTop,
      paddingRight: commander.paddingRight && +commander.paddingRight,
      paddingBottom: commander.paddingBottom && +commander.paddingBottom,

      borderWidth: commander.borderWidth && +commander.borderWidth,
      borderLeftWidth: commander.borderLeftWidth && +commander.borderLeftWidth,
      borderTopWidth: commander.borderTopWidth && +commander.borderTopWidth,
      borderRightWidth:
        commander.borderRightWidth && +commander.borderRightWidth,
      borderBottomWidth:
        commander.borderBottomWidth && +commander.borderBottomWidth,
      borderColor: commander.borderColor,

      localFontPath: commander.localFontPath,
      localFontName: commander.localFontName,

      output: "stream"
    });
    const outputPath = path.resolve(process.cwd(), commander.output);
    stream.pipe(fs.createWriteStream(outputPath));
  } else {
    commander.outputHelp();
  }
};

if (process.stdin.isTTY) {
  exec();
} else {
  let input = "";
  process.stdin.resume();
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", function(chunk) {
    input += chunk;
  });
  process.stdin.on("end", function() {
    exec(input);
  });
}
