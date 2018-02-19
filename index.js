#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const {registerFont, createCanvas} = require('canvas');
const commander = require('commander');
const version = require('./package.json').version;

/**
 * Convert text to PNG image.
 * @param text
 * @param [option]
 * @param [option.font='30px sans-serif'] css style font
 * @param [option.color='black'] (or option.textColor) text color
 * @param [option.backgroundColor] (or option.bgColor) background color
 * @param [option.lineSpacing=0]
 * @param [option.padding=0]
 * @param [option.borderWidth=0]
 * @param [option.borderColor='black']
 * @param [option.localFontName]
 * @param [option.localFontPath]
 * @param [option.output='buffer'] 'buffer', 'stream', 'dataURL', 'canvas'
 * @returns {string} png image buffer
 */
const text2png = (text, option) => {
  option = option || {};
  option.font = option.font || '30px sans-serif';
  option.textColor = option.textColor || option.color || 'black';
  option.lineSpacing = option.lineSpacing || 0;
  option.padding = option.padding || 0;
  option.output = option.output || 'buffer';
  option.borderWidth = option.borderWidth || 0;
  option.borderColor = option.borderColor || 'black';

  if (option.localFontPath && option.localFontName) {
    registerFont(option.localFontPath, {family: option.localFontName});
  }

  const canvas = createCanvas(0, 0);
  const ctx = canvas.getContext('2d');

  const max = {
    left: 0,
    right: 0,
    ascent: 0,
    descent: 0
  };

  let lastDescent;
  const lineProps = text.split('\n').map(line => {
    ctx.font = option.font;
    const metrics = ctx.measureText(line);

    const left = -1 * metrics.actualBoundingBoxLeft;
    const right = metrics.actualBoundingBoxRight;
    const ascent = metrics.actualBoundingBoxAscent;
    const descent = metrics.actualBoundingBoxDescent;

    max.left = Math.max(max.left, left);
    max.right = Math.max(max.right, right);
    max.ascent = Math.max(max.ascent, ascent);
    max.descent = Math.max(max.descent, descent);
    lastDescent = descent;

    return {line, left, ascent};
  });

  const borderOffset = option.padding + option.borderWidth;

  const lineHeight = max.ascent + max.descent + option.lineSpacing;
  canvas.width = max.left + max.right + borderOffset * 2;
  canvas.height = lineHeight * lineProps.length + borderOffset * 2 - option.lineSpacing - (max.descent - lastDescent);

  if (option.borderWidth) {
    ctx.fillStyle = option.borderColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  if (option.bgColor || option.backgroundColor) {
    ctx.fillStyle = option.bgColor || option.backgroundColor;
    ctx.fillRect(option.borderWidth, option.borderWidth, canvas.width - option.borderWidth * 2, canvas.height - option.borderWidth * 2);
  } else if (option.borderWidth) {
    ctx.clearRect(option.borderWidth, option.borderWidth, canvas.width - option.borderWidth * 2, canvas.height - option.borderWidth * 2);
  }

  ctx.font = option.font;
  ctx.fillStyle = option.textColor;
  ctx.antialias = 'gray';
  let offsetY = borderOffset;
  lineProps.forEach(lineProp => {
    ctx.fillText(lineProp.line, lineProp.left + borderOffset, max.ascent + offsetY);
    offsetY += lineHeight;
  });

  switch (option.output) {
    case 'buffer':
      return canvas.toBuffer();
    case 'stream':
      return canvas.createPNGStream();
    case 'dataURL':
      return canvas.toDataURL('image/png');
    case 'canvas':
      return canvas;
    default:
      throw new Error(`output type:${option.output} is not supported.`)
  }
};

if (require.main === module) {
  commander
    .version(version)
    .description('Create png image from text.')
    .option('-t, --text <message>', 'text')
    .option('-o, --output <path>', 'output file path')
    .option('-f, --font <string>', 'css font option (such as "30px Lobster")')
    .option('-c, --color <color>', 'text color')
    .option('-b, --backgroundColor <color>', 'background color')
    .option('-s, --lineSpacing <number>', 'line spacing')
    .option('-p, --padding <number>', 'padding')
    .option('--borderWidth <number>', 'border width')
    .option('--borderColor <color>', 'border color')
    .option('--localFontPath <path>', 'path to local font (e.g. fonts/Lobster-Regular.ttf)')
    .option('--localFontName <name>', 'name of local font (e.g. Lobster)')
    .parse(process.argv);

  if (commander.text && commander.output) {
    const stream = text2png(commander.text, {
      font: commander.font,
      color: commander.color,
      backgroundColor: commander.backgroundColor,
      lineSpacing: +commander.lineSpacing || 0,
      padding: +commander.padding || 0,
      borderWidth: +commander.borderWidth,
      borderColor: commander.borderColor,
      localFontPath: commander.localFontPath,
      localFontName: commander.localFontName,
      output: 'stream'
    });
    const outputPath = path.resolve(process.cwd(), commander.output);
    stream.pipe(fs.createWriteStream(outputPath));
  } else {
    commander.outputHelp();
  }
} else {
  module.exports = text2png;
}
