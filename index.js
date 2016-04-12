'use strict';

const Canvas = require('canvas');

/**
 * Convert text to PNG image.
 * @param text
 * @param [option]
 * @param [option.font='30px sans-serif']
 * @param [option.textColor='black']
 * @param [option.bgColor]
 * @param [option.lineSpacing=0]
 * @param [option.padding=0]
 * @param [option.output='buffer'] 'buffer', 'stream', 'dataURL', 'canvas'
 * @returns {string} png image buffer
 */
module.exports = (text, option) => {
  option = option || {};
  option.font = option.font || '30px sans-serif';
  option.textColor = option.textColor || 'black';
  option.lineSpacing = option.lineSpacing || 0;
  option.padding = option.padding || 0;
  option.output = option.output || 'buffer';

  const canvas = new Canvas(0, 0);
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

  const lineHeight = max.ascent + max.descent + option.lineSpacing;
  canvas.width = max.left + max.right + option.padding * 2;
  canvas.height = lineHeight * lineProps.length + option.padding * 2 - option.lineSpacing - (max.descent - lastDescent);

  if (option.bgColor) {
    ctx.fillStyle = option.bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.font = option.font;
  ctx.fillStyle = option.textColor;
  ctx.antialias = 'gray';
  let offsetY = option.padding;
  lineProps.forEach(lineProp => {
    ctx.fillText(lineProp.line, lineProp.left + option.padding, max.ascent + offsetY);
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