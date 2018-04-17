const promises = files.map((baseName) => {
  return fetch(`testcases/${baseName}.json`).then(e => e.json()).catch((e) => {
    return {
      error: e.toString()
    };
  }).then((json) => {
    const tr = document.createElement('tr');
    const apiString = json[1]
      ? `text2png(${JSON.stringify(json[0])}, ${JSON.stringify(json[1] , null, 2)})`
      : `text2png(${JSON.stringify(json[0])})`;
    tr.innerHTML = `<td><pre>${baseName}\n\n${apiString}</pre></td>
<td><img src="expected/${baseName}.png"></td>
<td><img src="actual/${baseName}.png"></td>`;
    return tr;
  });
});

const container = document.getElementById('table-body');
promises.reduce((acc, p) => {
  return acc.then(() => p).then(tr => {
    container.appendChild(tr);
  });
}, Promise.resolve());
