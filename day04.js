/*
Day 4: Scratchcards


*/

const fs = require("node:fs/promises");

module.exports = async function (inputFile) {
  const file = await fs.open(inputFile);
  let sum = 0;

  const cardFile = new CardFile();

  const lineRe = /Card\s+(\d+):\s+([^|]+)\s+\|\s+(.*)/;
  for await (const line of file.readLines()) {
    console.log(line);

    const [_, cardNumStr, winnersStr, testersStr] = line.match(lineRe);
    const cardNum = parseInt(cardNumStr, 10);
    cardFile.add(cardNum, 1);
    const countOfThisCard = cardFile.get(cardNum);

    const hits = countHits(winnersStr, testersStr);
    for (let i = 1; i <= hits; i++) {
      cardFile.add(cardNum + i, countOfThisCard);
    }
  }

  console.log(`Sum: ${cardFile.sum()}`);
};

function countHits(winnersStr, testersStr) {
  const winners = winnersStr.split(/\s+/);
  let hits = 0;
  for (const tester of testersStr.split(/\s+/)) {
    if (winners.includes(tester)) {
      hits++;
    }
  }
  return hits;
}

/**
 * Array of counts that automatically expands.
 */
class CardFile {
  constructor() {
    this._counts = [];
  }

  get(index) {
    return this._counts[index] ?? 0;
  }

  add(index, value) {
    while (this._counts.length < index + 1) {
      this._counts.push(0);
    }
    this._counts[index] = this._counts[index] + value;
  }

  sum() {
    return this._counts.reduce((m, n) => m + n, 0);
  }
}
