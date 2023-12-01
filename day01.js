// Day 1
// Combine the first digit and the last digit on each line to form a single two-digit number
// Some digits are spelled out with letters
// Sum all entries

const fs = require("node:fs/promises");

const reverse = (str) => str.split("").reverse().join();

const forwardLookup = {
  one: "1",
  two: "2",
  three: "3",
  four: "4",
  five: "5",
  six: "6",
  seven: "7",
  eight: "8",
  nine: "9",
};
const forwardRegex = new RegExp(
  Object.keys(forwardLookup).concat(Object.values(forwardLookup)).join("|")
);
const reverseLookup = Object.entries(forwardLookup).reduce(
  (memo, [key, value]) => {
    memo[reverse(key)] = value;
    return memo;
  },
  {}
);
const reverseRegex = new RegExp(
  Object.keys(reverseLookup).concat(Object.values(reverseLookup)).join("|")
);

module.exports = async function (inputFile) {
  const file = await fs.open(inputFile);
  let sum = 0;
  for await (const line of file.readLines()) {
    // console.log(line);

    // Get the first digit
    const firstDigit = line.match(forwardRegex)[0];
    const lastDigit = reverse(line).match(reverseRegex)[0];
    const lineValue = parseInt(
      [
        forwardLookup[firstDigit] ?? firstDigit,
        reverseLookup[lastDigit] ?? lastDigit,
      ].join(""),
      10
    );
    // console.log(lineValue);

    sum = sum + lineValue;
  }
  console.log(`Sum: ${sum}`);
};
