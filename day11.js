const fs = require("node:fs/promises");

module.exports = async function (inputFile, partNumber) {
  const [galaxies, emptyRows, emptyColumns] = await parse(inputFile);
  console.log(`Galaxies: ${galaxies.length}`);
  console.log(`Empty rows: ${emptyRows}`);
  console.log(`Empty columns: ${emptyColumns}`);

  let combos = 0;
  let totalDistance = 0;
  for (let i = 0; i < galaxies.length - 1; i++) {
    for (let j = i + 1; j < galaxies.length; j++) {
      const distance = getDistance(galaxies[i], galaxies[j], emptyRows, emptyColumns);
      combos++;
      totalDistance = totalDistance + distance;
    }
  }

  console.log(`Combos: ${combos}`);
  console.log(`Total distance: ${totalDistance}`);
}

async function parse(inputFile) {
  const galaxies = [];
  const emptyRows = new Set();
  const emptyColumns = new Set();
  const file = await fs.open(inputFile);
  let y = 0;
  for await (const line of file.readLines()) {
    emptyRows.add(y);
    for (let x = 0; x < line.length; x++) {
      if (y == 0) emptyColumns.add(x);
      if (line[x] == '#') {
        galaxies.push(new Galaxy(x, y));
        emptyRows.delete(y);
        emptyColumns.delete(x);
      }
    }
    y++;
  }

  return [galaxies, Array.from(emptyRows), Array.from(emptyColumns)];
}

function getDistance(g1, g2, emptyRows, emptyColumns) {
  // console.log(`Comparing ${g1.x},${g1.y} to ${g2.x},${g2.y}`);
  const [xl, xr] = g1.x < g2.x ? [g1.x, g2.x] : [g2.x, g1.x];
  const [yl, yr] = g1.y < g2.y ? [g1.y, g2.y] : [g2.y, g1.y];
  return (xr - xl) + (yr - yl) + 999999 * (entriesBetween(emptyRows, yl, yr) + entriesBetween(emptyColumns, xl, xr));
}

function entriesBetween(sortedList, low, high) {
  // console.log(`entriesBetween([${sortedList}], ${low}, ${high})`);
  let i = 0;
  while (sortedList[i] <= low) {
    i++;
  }
  const firstIndex = i;
  while (sortedList[i] < high) {
    i++;
  }
  // console.log(`  = ${i - firstIndex}`);
  return i - firstIndex;
}

class Galaxy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}
