const fs = require("node:fs/promises");

module.exports = async function (inputFile, partNumber) {
  let totalNextValues = 0;
  let totalPrevValues = 0;
  const file = await fs.open(inputFile);
  for await (const line of file.readLines()) {
    const layers = [line.split(/\s+/).map(n => parseInt(n, 10))];
    while (layers[layers.length - 1].some(n => n != 0)) {
      layers.push(
        layers[layers.length - 1].reduce((m, n, i, a) => {
          if (i > 0) m.push(n - a[i-1]);
          return m;
        }, [])
      );
    }
    // for (i = 0; i < layers.length; i++) {
    //   console.log((' '.repeat(i)) + layers[i].join(' '));
    // }
    const nextValue = layers.reduce((sum, layer) => sum + layer[layer.length - 1], 0);
    const prevValue = layers.reduce((m, layer, i) => m + layer[0] * (i % 2 ? -1 : 1), 0);
    totalNextValues = totalNextValues + nextValue;
    totalPrevValues = totalPrevValues + prevValue;
  }
  console.log(`Total Next Values: ${totalNextValues}`);
  console.log(`Total Prev Values: ${totalPrevValues}`);
}