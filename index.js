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
 * @param [option.padding=0] width of the padding area (left, top, right, bottom)
 * @param [option.paddingLeft]
 * @param [option.paddingTop]
 * @param [option.paddingRight]
 * @param [option.paddingBottom]
 * @param [option.borderWidth=0] width of border (left, top, right, bottom)
 * @param [option.borderLeftWidth=0]
 * @param [option.borderTopWidth=0]
 * @param [option.borderRightWidth=0]
 * @param [option.borderBottomWidth=0]
 * @param [option.borderColor='black'] border color
 * @param [option.localFontPath] path to local font (e.g. fonts/Lobster-Regular.ttf)
 * @param [option.localFontName] name of local font (e.g. Lobster)
 * @param [option.output='buffer'] 'buffer', 'stream', 'dataURL', 'canvas's
 * @returns {string} png image buffer
 */
const text2png = (text, option) => {
  option = option || {};

  const font = option.font || '30px sans-serif';
  const textColor = option.textColor || option.color || 'black';
  const lineSpacing = option.lineSpacing || 0;
  const output = option.output || 'buffer';

  const paddingLeft = option.paddingLeft || option.padding || 0;
  const paddingTop = option.paddingTop || option.padding || 0;
  const paddingRight = option.paddingRight || option.padding || 0;
  const paddingBottom = option.paddingBottom || option.padding || 0;

  const borderLeftWidth = option.borderLeftWidth || option.borderWidth || 0;
  const borderTopWidth = option.borderTopWidth || option.borderWidth || 0;
  const borderRightWidth = option.borderRightWidth || option.borderWidth || 0;
  const borderBottomWidth = option.borderBottomWidth || option.borderWidth || 0;
  const borderColor = option.borderColor || 'black';

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
    ctx.font = font;
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

  const lineHeight = max.ascent + max.descent + lineSpacing;

  canvas.width = max.left + max.right
    + borderLeftWidth + borderRightWidth
    + paddingLeft + paddingRight;

  canvas.height = lineHeight * lineProps.length
    + borderTopWidth + borderBottomWidth
    + paddingTop + paddingBottom
    - lineSpacing
    - (max.descent - lastDescent);

  const hasBorder = borderLeftWidth || borderTopWidth || borderRightWidth || borderBottomWidth;
  if (hasBorder) {
    ctx.fillStyle = borderColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  if (option.bgColor || option.backgroundColor) {
    ctx.fillStyle = option.bgColor || option.backgroundColor;
    ctx.fillRect(
      borderLeftWidth,
      borderTopWidth,
      canvas.width - (borderLeftWidth + borderRightWidth),
      canvas.height - (borderTopWidth + borderBottomWidth)
    );
  } else if (hasBorder) {
    ctx.clearRect(
      borderLeftWidth,
      borderTopWidth,
      canvas.width - (borderLeftWidth + borderRightWidth),
      canvas.height - (borderTopWidth + borderBottomWidth)
    );
  }

  ctx.font = font;
  ctx.fillStyle = textColor;
  ctx.antialias = 'gray';
  let offsetY = borderTopWidth + paddingTop;
  lineProps.forEach(lineProp => {
    ctx.fillText(
      lineProp.line,
      lineProp.left + borderLeftWidth + paddingLeft,
      max.ascent + offsetY
    );
    offsetY += lineHeight;
  });

  switch (output) {
    case 'buffer':
      return canvas.toBuffer();
    case 'stream':
      return canvas.createPNGStream();
    case 'dataURL':
      return canvas.toDataURL('image/png');
    case 'canvas':
      return canvas;
    default:
      throw new Error(`output type:${output} is not supported.`)
  }
};

if (require.main === module) {
  commander
    .version(version)
    .description('Create png image from text.')
    .option('-t, --text <message>', 'text')
    .option('-o, --output <path>', 'output file path')
    .option('-f, --font <string>', 'css font option (e.g. "30px Lobster")')
    .option('-c, --color <color>', 'text color')
    .option('-b, --backgroundColor <color>', 'background color')
    .option('-s, --lineSpacing <number>', 'line spacing')
    .option('-p, --padding <number>', 'width of the padding area (left, top, right, bottom)')
    .option('--paddingLeft <number>')
    .option('--paddingTop <number>')
    .option('--paddingRight <number>')
    .option('--paddingBottom <number>')
    .option('--borderWidth <number>', 'width of border (left, top, right, bottom)')
    .option('--borderLeftWidth <number>')
    .option('--borderTopWidth <number>')
    .option('--borderRightWidth <number>')
    .option('--borderBottomWidth <number>')
    .option('--borderColor <color>', 'border color')
    .option('--localFontPath <path>', 'path to local font (e.g. fonts/Lobster-Regular.ttf)')
    .option('--localFontName <name>', 'name of local font (e.g. Lobster)')
    .parse(process.argv);

  if (commander.text && commander.output) {
    const stream = text2png(commander.text, {
      font: commander.font,
      color: commander.color,
      backgroundColor: commander.backgroundColor,
      lineSpacing: +commander.lineSpacing,
      padding: +commander.padding,
      paddingLeft: +commander.paddingLeft,
      paddingTop: +commander.paddingTop,
      paddingRight: +commander.paddingRight,
      paddingBottom: +commander.paddingBottom,
      borderWidth: +commander.borderWidth,
      borderLeftWidth: +commander.borderLeftWidth,
      borderTopWidth: +commander.borderTopWidth,
      borderRightWidth: +commander.borderRightWidth,
      borderBottomWidth: +commander.borderBottomWidth,
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
