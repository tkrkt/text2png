[![NPM](https://nodei.co/npm/text2png.png)](https://nodei.co/npm/text2png/)
[![npm version](https://badge.fury.io/js/text2png.svg)](https://badge.fury.io/js/text2png)

# text2png: text-to-png generator for Node.js

```js
text2png('Create png image\nfrom multi-line text!');
```

![text2png](./img/text2png.png)

## Quick start

```
$ npm install text2png
```

```js
var fs = require('fs');
var text2png = require('text2png');
fs.writeFileSync('out.png', text2png('Hello!', {textColor: 'blue'}));
```

text2png depends on [node-canvas](https://github.com/Automattic/node-canvas).

See [node-canvas wiki](https://github.com/Automattic/node-canvas/wiki) on installing node-canvas.

## Option

``text2png(text, option)``

|param|default|
|---|---|
|text|(required)|
|option.font|'30px sans-serif'|
|option.color (or option.textColor)|'black'|
|option.backgroundColor (or option.bgColor)|null|
|option.lineSpacing|0|
|option.padding|0|
|option.borderWidth|0|
|option.borderColor|'black'|
|option.output|'buffer'|

``option.output = 'buffer' | 'stream' | 'dataURL' | 'canvas'``

``'canvas'`` returns [node-canvas](https://github.com/Automattic/node-canvas) object.

## Command line interface

```
$ npm install -g text2png@next
$ text2png --help
$ text2png -t "Hello!" -o "output.png"
```

## Example

```js
text2png('Example\nText', {
  font: '80px Futura',
  textColor: 'teal',
  bgColor: 'linen',
  lineSpacing: 10,
  padding: 20
});
```

![ExampleText](./img/exampleText.png)

Enjoy!
