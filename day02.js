// Day 2
//
// Part 1:
// Which games are possible if the bag contains
// only 12 red cubes, 13 green cubes, and 14 blue cubes?
//
// Part 2:
// in each game you played, what is the fewest number of
// cubes of each color that could have been in the bag to
// make the game possible?
// The power of a set of cubes is equal to the numbers of
// red, green, and blue cubes multiplied together.
// Sum of powers

const fs = require("node:fs/promises");

class Game {
  constructor(inputStr) {
    const parts = inputStr.split(": ");
    this.id = parseInt(parts[0].split(" ")[1], 10);
    const draws = parts[1].split("; ");
    this.draws = parts[1].split("; ").map((draw) => {
      return draw.split(", ").reduce((memo, next) => {
        const parts = next.split(" ");
        memo[parts[1]] = parseInt(parts[0], 10);
        return memo;
      }, {});
    });
  }

  isPossible() {
    return this.draws.every(
      (draw) =>
        (draw.red ?? 0) <= 12 &&
        (draw.green ?? 0) <= 13 &&
        (draw.blue ?? 0) <= 14
    );
  }

  power() {
    return (
      this.draws.reduce((m, d) => Math.max(m, d.red ?? 0), 0) *
      this.draws.reduce((m, d) => Math.max(m, d.green ?? 0), 0) *
      this.draws.reduce((m, d) => Math.max(m, d.blue ?? 0), 0)
    );
  }
}

module.exports = async function (inputFile) {
  const file = await fs.open(inputFile);
  let sum = 0;
  for await (const line of file.readLines()) {
    const game = new Game(line);
    sum = sum + game.power();
  }
  console.log(`Sum: ${sum}`);
};
