const fs = require("node:fs/promises");

// y = x(1 - x)
// -x^2 + xk - m > 0 for how many values of x?

// Number of ways you can beat the record in each race

module.exports = async function (inputFile, partNumber) {
  // Read in the races
  const file = await fs.open(inputFile);
  const lines = [];
  for await (const line of file.readLines()) {
    lines.push(line);
  }
  const extractNumbers = (line) =>
    line
      .split(/\s+/)
      .slice(1)
      .map((x) => parseInt(x, 10));
  const times = extractNumbers(lines[0]);
  const distances = extractNumbers(lines[1]);

  let result = 1;
  for (let r = 0; r < times.length; r++) {
    const t = times[r];
    const d = distances[r];
    // Given the parobola
    // y = x(t - x) - d
    // Where y is distance travelled beyond the record
    // and x is time the button is held down,
    // How many whole integers are between the x intercepts?

    // To find the x intercepts, we need all solutions
    // of y = 0
    // 0 = -x^2 + tx - d
    // h = -(t / -2)
    const h = -(t / -2);
    const k = h * (t - h) - d;

    // Standard form
    // f(x) = -(x - h)^2 + k
    // -k = -(x - h)^2
    // k = (x - h)^2
    // +-sqrt(k) = x - h
    // h +- sqrt(k) = x

    const lowerIntercept = h - Math.sqrt(k);
    const upperIntercept = h + Math.sqrt(k);

    // Find the whole numbers between the intercepts,
    let firstNumberInRange = Math.ceil(lowerIntercept);
    if (firstNumberInRange == lowerIntercept) {
      firstNumberInRange++;
    }
    let lastNumberInRange = Math.floor(upperIntercept);
    if (lastNumberInRange == upperIntercept) {
      lastNumberInRange--;
    }
    const wholeNumbersBetween = lastNumberInRange - firstNumberInRange + 1;
    console.log(`Game ${r}: ${wholeNumbersBetween} winning moves`);
    result = result * wholeNumbersBetween;
  }
  console.log(`Solution: ${result}`);
};
