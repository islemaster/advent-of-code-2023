/* Day 5: Seeds */

const fs = require("node:fs/promises");

module.exports = async function (inputFile, partNumber) {
  const file = await fs.open(inputFile);

  let inputs = [];
  const maps = [];

  for await (const line of file.readLines()) {
    if (line.length == 0) continue;

    if (line.startsWith("seeds:")) {
      // Capture initial condition
      inputs = line
        .slice(7)
        .split(" ")
        .map((x) => parseInt(x, 10));
      console.log(`Inputs: ${inputs}`);
    } else if (/map/.test(line)) {
      // Start a new map
      maps.push(new MapFn());
    } else {
      // Push a new range onto the map
      maps[maps.length - 1].addRange(line);
    }
  }

  // Part 1: List of inputs, we can do the naive thing
  // load a full array of inputs and map it forward
  // through our functions.
  if (partNumber == 1) {
    const outputs = inputs.map((i) => {
      for (const mapFn of maps) {
        i = mapFn.transform(i);
      }
      return i;
    });

    console.log(Math.min(...outputs));
  }

  // Part 2: Input ranges
  if (partNumber == 2) {
    // Naive approach: Actually walk through ranges.
    //  let bestSoFar = Infinity;
    //  for (let i = 0; i < inputs.length; i = i + 2) {
    //    const start = inputs[i];
    //    const length = inputs[i + 1];
    //    console.log(`Starting ${start}`);
    //    for (let seed = start; seed < start + length; seed++) {
    //      let x = seed;
    //      for (const mapFn of maps) {
    //        x = mapFn.transform(x);
    //      }
    //      //   console.log(x);
    //      if (x < bestSoFar) {
    //        bestSoFar = x;
    //      }
    //    }
    //  }
    //  console.log(`Lowest value: ${bestSoFar}`);

    // Better approach: Find breakpoints
    let breakpoints = [];
    for (let i = maps.length - 1; i >= 0; i--) {
      breakpoints = breakpoints.map((x) => maps[i].untransform(x));
      breakpoints.push(...maps[i].ownBreakpoints());
    }
    // Unique, ordered breakpoints
    breakpoints = Array.from(new Set(breakpoints)).sort((a, b) => a - b);
    console.log(`Found ${breakpoints.length} breakpoints`);
    // console.log(breakpoints);

    // Capture and sort input ranges
    const inputRanges = [];
    for (let i = 0; i < inputs.length; i = i + 2) {
      inputRanges.push(inputs.slice(i, i + 2));
    }
    inputRanges.sort((a, b) => a[0] - b[0]);

    // Now lockstep-walk through breakpoints and input ranges
    // to generate testing points
    const testPoints = new Set();
    for (const range of inputRanges) {
      const [rangeStart, rangeLength] = range;
      testPoints.add(rangeStart);
      testPoints.add(rangeStart + rangeLength);
      while (breakpoints.length && breakpoints[0] < rangeStart) {
        breakpoints.shift();
      }
      while (breakpoints.length && breakpoints[0] < rangeStart + rangeLength) {
        testPoints.add(breakpoints.shift());
      }
    }
    console.log(`Testing ${testPoints.size} points`);

    const outputs = Array.from(testPoints).map((i) => {
      for (const mapFn of maps) {
        i = mapFn.transform(i);
      }
      return i;
    });

    console.log(Math.min(...outputs));
  }
};

/** Represents a discontinuous function over the integers */
class MapFn {
  constructor() {
    this.ranges = [];
  }

  addRange(line) {
    const [toStart, fromStart, length] = line
      .split(" ")
      .map((x) => parseInt(x, 10));
    const delta = toStart - fromStart;
    const newRange = new Range(fromStart, length, delta);
    this.ranges.push(newRange);
    this.ranges.sort((a, b) => a.start - b.start);
  }

  transform(input) {
    for (const range of this.ranges) {
      if (input < range.start) break;
      if (input >= range.end) continue;
      return input + range.delta;
    }
    return input;
  }

  untransform(output) {
    const reverseRanges = this.ranges
      .slice()
      .sort((a, b) => a.outStart - b.outStart);
    for (const range of reverseRanges) {
      if (output < range.outStart) break;
      if (output >= range.outEnd) continue;
      return output - range.delta;
    }
    return output;
  }

  ownBreakpoints() {
    const breakpoints = new Set();
    for (const range of this.ranges) {
      breakpoints.add(range.start);
      breakpoints.add(range.end);
    }
    return Array.from(breakpoints);
  }
}

class Range {
  constructor(start, length, delta) {
    this.start = start;
    this.length = length;
    this.delta = delta;
    this.end = start + length;
    this.outStart = start + delta;
    this.outEnd = start + length + delta;
  }
}
