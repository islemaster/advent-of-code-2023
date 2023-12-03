// Day 3: Gear Ratios
//
// Add up the part numbers in the engine schematic
//
// any number adjacent to a symbol, even diagonally,
// is a "part number" and should be included in your sum.
// (Periods (.) do not count as a symbol.)
/*
467..114..
...*......
..35..633.
......#...
617*......
.....+.58.
..592.....
......755.
...$.*....
.664.598..
*/

// Part two
// A gear is any * symbol that is adjacent to
//   exactly two part numbers.
// Its gear ratio is the result of multiplying
//   those two numbers together.
// Sum the gear ratios

const fs = require("node:fs/promises");

module.exports = async function (inputFile) {
  const file = await fs.open(inputFile);
  let sum = 0;
  // We're going to keep a three-line buffer
  // and always evaluate the middle line
  // so we have context.
  const lineBuffer = [undefined, undefined, undefined];
  for await (const line of file.readLines()) {
    scrollBuffer(lineBuffer, line);
    if (lineBuffer[1]) {
      const newParts = findGears(lineBuffer);
      for (const part of newParts) {
        sum = sum + part;
      }
    }
  }
  // Evaluate the last line
  scrollBuffer(lineBuffer, undefined);
  const newParts = findGears(lineBuffer);
  for (const part of newParts) {
    sum = sum + part;
  }

  console.log(`Sum: ${sum}`);
};

function scrollBuffer(lineBuffer, nextLine) {
  lineBuffer[0] = lineBuffer[1];
  lineBuffer[1] = lineBuffer[2];
  lineBuffer[2] = nextLine;
}

const symbolRegex = /[^\d.]/;
const gearRegex = /[*]/g;
const numberRegex = /\d+/g;
function findParts(lineBuffer) {
  const parts = [];

  // console.log("\n--- Finding parts in ---");
  // console.log(lineBuffer[0] ?? "");
  // console.log(lineBuffer[1]);
  // console.log(lineBuffer[2] ?? "");

  // Find continguous groups of digits in the line
  for (const match of lineBuffer[1].matchAll(numberRegex)) {
    const firstIndex = match.index;
    const lastIndex = match.index + match[0].length - 1;
    if (hasSymbolInBorder(lineBuffer, firstIndex, lastIndex)) {
      parts.push(parseInt(match[0]));
    }
  }
  return parts;
}

function findPartsTouchingGear(lineBuffer, gearIndex) {
  const parts = [];
  for (let lineIndex = 0; lineIndex < 3; lineIndex++) {
    for (const match of lineBuffer[lineIndex].matchAll(numberRegex)) {
      const firstIndex = match.index;
      const lastIndex = firstIndex + match[0].length - 1;
      if (firstIndex <= gearIndex + 1 && lastIndex >= gearIndex - 1) {
        parts.push(parseInt(match[0]));
      }
    }
  }
  return parts;
}

function findGears(lineBuffer) {
  const gears = [];
  for (const match of lineBuffer[1].matchAll(gearRegex)) {
    const index = match.index;
    const parts = findPartsTouchingGear(lineBuffer, index);
    if (parts.length == 2) {
      console.log("Is a gear");
      console.log("Ratio: " + parts[0] * parts[1]);
      gears.push(parts[0] * parts[1]);
    }
  }
  return gears;
}

function hasSymbolInBorder(lineBuffer, firstIndex, lastIndex) {
  const lineLength = lineBuffer[1].length;

  for (let i = 0; i < 3; i++) {
    if (!lineBuffer[i]) continue;
    const slice = lineBuffer[i].slice(
      Math.max(0, firstIndex - 1),
      Math.min(lineLength, lastIndex + 2)
    );
    if (symbolRegex.test(slice)) return true;
  }

  return false;
}
