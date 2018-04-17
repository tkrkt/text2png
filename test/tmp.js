const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'index.html'));
const replaced = html.toString().replace(/<script type="text\/template">.*<\/script>/, `<script type="text/template"></script>`);
console.log(replaced);