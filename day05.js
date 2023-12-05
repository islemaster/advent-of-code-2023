/*
Day 5: Seeds

In this puzzle, we transform initial "seed" values through a series
of "maps" to arrive at final values, and are seeking the minimum
final value. In the simple examples there are a small number of
seed values, but in the actual input (especially in part 2) there
are billions of them.

Before we get to *how* we'll solve the problem, we'll import
our one dependency, which lets us read input files.
*/
const fs = require("node:fs/promises");

/*
The "maps" in question can be represented as discontinuous
functions over the integers, where for any given integer the
output is given as <input> + <delta>. Moreover, these functions
are defined by a set of input ranges that share the same <delta>,
and any input outside the given ranges has a delta of zero.

We will represent these functions as a collection of ranges,
which are themselves each a linear function with a limited domain.
So let's begin by defining a Range:
*/
class Range {
  /*
  For simplicity, we're making a Range a simple struct
  with a constructor that infers some values to keep our
  code readable later.

  Since we're thinking about this problem in algebraic terms,
  we'll use the term "domain" for input ranges from here on out,
  and "range" for output ranges.
  */
  constructor(start, length, delta) {
    /** The beginning of the input domain. */
    this.start = start;
    /** The length of the domain. */
    this.length = length;
    /** The delta applied to input values within this domain. */
    this.delta = delta;
    /** The end of the input domain, exclusive. */
    this.end = start + length;
    /*
    We will precompute the output range, which will be useful
    later when we need to run our function in reverse.
    */
    /** The beginning of the output range. */
    this.outStart = start + delta;
    /** The end of the output range, exclusive. */
    this.outEnd = start + length + delta;
  }
}

/*
Now that we've modeled a range within a discontinuous function,
let's model the function itself with another class. It should
encapsulate a collection of ranges, and then be able to operate
forwards and backwards by looking up the appropriate range and
applying the appropriate transformation.

We'll call it "MapFn" since the problem describes these as "maps"
but we are thinking of them as functions:
*/
class MapFn {
  constructor() {
    /**
     * A collection of Ranges.
     * There are probably all sorts of practical constraints
     * we'd want to put on this collection in a production system,
     * but the problem seems to guarantee that ranges don't overlap
     * in unpleasant ways, so we'll use a simple array for now.
     *
     * We start with no ranges defined. In this state, the MapFn
     * is the identity function.
     */
    this.ranges = [];
  }

  /**
   * Next let's make it easy to build up the MapFn from our puzzle
   * input with an 'addRange' method that handles some of our parsing.
   * This method takes a whole line from our puzzle input, which will
   * always contain three space-separated integers. For example:
   *
   *   "37 52 2"
   *
   * These numbers represent, in order:
   *   - The start of the output range
   *   - The start of the input domain
   *   - The length of both
   *
   * We can derive the delta for this Range subfunction from the
   * difference between the domain and range starts.  Once we have
   * that, we can construct a Range and add it to our collection.
   */
  addRange(line) {
    const [toStart, fromStart, length] = line
      .split(" ")
      .map((x) => parseInt(x, 10));
    /*

    */
    const delta = toStart - fromStart;
    const newRange = new Range(fromStart, length, delta);
    this.ranges.push(newRange);
    /*
    We keep the ranges collection sorted by _domain start_
    to make it as easy as possible to walk through later.
    */
    this.ranges.sort((a, b) => a.start - b.start);
  }

  /*
  Now that we've populated our function with a set of ranges,
  let's implment how we'll apply it to an input value.
  */
  transform(input) {
    /*
    The main challenge is to locate the correct range for a given
    input. Since the ranges are already sorted by domain start,
    we can walk through them in order and early-out in some cases.
    */
    for (const range of this.ranges) {
      /*
      If we reach a range that starts above our input,
      we've gone too far, and we should break out and fall
      through to the identity function.
      */
      if (input < range.start) break;
      /*
      If our input is beyond the end of the current range,
      we should continue and check the next range.
      */
      if (input >= range.end) continue;
      /*
      If neither of the above cases was true, our input is
      in the current range, so we apply this range's delta.
      */
      return input + range.delta;
    }
    /*
    If our input wasn't in any range, we are the identity function
    so we return the input.
    */
    return input;
  }

  /*
  We also need the ability to apply our MapFn in reverse.
  We'll follow a similar pattern to the forward application, but
  we'll be looking at output ranges and applying the delta backwards.
  */
  untransform(output) {
    /*
    To use the same pattern, we need to iterate through our ranges
    in order of their output-range-starts (which is not reverse-order,
    it's a whole different order).
    This might happen a lot, for efficiency later we could cache this
    reverse order when building up the MapFn.
    */
    const reverseRanges = this.ranges
      .slice()
      .sort((a, b) => a.outStart - b.outStart);
    /*
    Now we do the same as above, but with output ranges and applying
    the delta backwards.
    */
    for (const range of reverseRanges) {
      if (output < range.outStart) break;
      if (output >= range.outEnd) continue;
      return output - range.delta;
    }
    return output;
  }

  /*
  Finally, let's introduce a new concept called "breakpoints."
  "Breakpoints" are the input domain values right after
  discontinuities for a given MapFn.
  Since we're looking for minimum values, it turns out the important
  values to check are the start of every range and the start of
  every between-range space, because all the other numbers *must*
  be higher than these (in the output of this particular MapFn).

  Once we compose MapFns there might be other minima, but this
  MapFn on its own would only provide these ones.
  */
  ownBreakpoints() {
    // We use a Set because we want a unique set of breakpoints.
    const breakpoints = new Set();
    for (const range of this.ranges) {
      breakpoints.add(range.start);
      breakpoints.add(range.end);
    }
    return Array.from(breakpoints);
  }
}

/*
Excellent! We now have the ability to encode MapFns from
our puzzle input. Let's tackle parsing next.

This is our solution's "main" function. It accepts the full
path of an input file, and also a (1|2) number representing
whether we're working on part 1 or part 2 of the puzzle.

I run this from a harness that parses CLI arguments, and can
automatically run the solution over many input files.
*/
module.exports = async function (inputFile, partNumber) {
  /*
  Open the file.
  */
  const file = await fs.open(inputFile);

  /*
  There are two major sections of puzzle input,
  let's initialize holding space for them.
  1. The set of input seed numbers, in order.
  */
  let inputs = [];
  /*
  2. The set of MapFns, in order.
  */
  const maps = [];

  /*
  We read the file one line at a time.
  There's no need to keep it all in memory!
  */
  for await (const line of file.readLines()) {
    // Skip blank lines.
    if (line.length == 0) continue;

    /*
    The "seeds:" line gives the input seed numbers.
    */
    if (line.startsWith("seeds:")) {
      inputs = line
        .slice(7) // Trim the "seeds: " start
        .split(" ") // Split into an array
        .map((x) => parseInt(x, 10)); // Convert to numbers
      console.log(`Inputs: ${inputs}`);
      /*
    Any "map" line indicates the beginning of a new MapFn.
    */
    } else if (/map/.test(line)) {
      maps.push(new MapFn());
      /*
    Any other line is a range within the latest map.
    Remember, we delegate the parsing to the MapFn itself.
    */
    } else {
      maps[maps.length - 1].addRange(line);
    }
  }

  /*
  Now all the pieces are in place! We've initialized an ordered
  colleciton of MapFns, and a list of input values.  All that's
  left is to actually solve the problem XD

  Part 1 is relatively simple.
  For every input, run it through every MapFn in order.
  Return the minimum output.
  */
  if (partNumber == 1) {
    const outputs = inputs.map((i) => {
      for (const mapFn of maps) {
        i = mapFn.transform(i);
      }
      return i;
    });
    console.log(Math.min(...outputs));
  }

  /*
  In part 2, the input values become input ranges.

  These ranges can be very large. The naive approach is to expand
  the ranges into a list of input values, and use our part 1 solution
  again. I tried this, and it works, but it takes ten minutes to run!

  A better approach is to exploit the simple nature of the MapFns
  to identify points-of-interest within the input ranges, and only
  test those. Intuitively, our points-of-interest would be the edges
  of the ranges and all the discontinuitities in our composed MapFn.
  */
  if (partNumber == 2) {
    /*
    We talked about breakpoints earlier when we were defining a MapFn.
    We already know how to get the breakpoints for one MapFn. How do
    we get the breakpoints for all of them?

    My solution is to backpropagagate. We take the breakpoints for the
    last MapFn, and run them backwards through the second-to-last MapFn.
    Then we add the breakpoints from the second-to-last MapFn, and run
    them all through the third-to-last MapFn, and so on.

    At the end of this process, we have a subset of input values that
    we know represent local minima in the output of the composed MapFns.
    These are our initial "points of interest."
    */

    // Start with no breakpoints
    let breakpoints = [];
    // Iterate backwards through our MapFns
    for (let i = maps.length - 1; i >= 0; i--) {
      // Run breakpoints-so-far backwards through the current MapFn.
      breakpoints = breakpoints.map((x) => maps[i].untransform(x));
      // Add the current MapFn's own breakpoints.
      breakpoints.push(...maps[i].ownBreakpoints());
    }
    // The above process is not ordered and results in duplicates.
    // Let's reduce our breakpoints list to a unique, ordered list.
    breakpoints = Array.from(new Set(breakpoints)).sort((a, b) => a - b);
    console.log(`Found ${breakpoints.length} breakpoints`);

    /*
    That was all the points-of-interest for the MapFns. However, we
    only care about points-of-interest that are within our input
    ranges.  First, we need to convert our raw inputs into input
    ranges, and let's sort them by start position to make walking
    through them easier in a minute.
    */
    const inputRanges = [];
    for (let i = 0; i < inputs.length; i = i + 2) {
      inputRanges.push(inputs.slice(i, i + 2));
    }
    inputRanges.sort((a, b) => a[0] - b[0]);

    /*
    Now we can generate our *real* points-of-interest list.

    We'll do this by stepping forward through both lists (the input
    ranges and the breakpoints) together.  We want to include the
    start of each input range, as well as any breakpoints that are
    within an input range. We can throw out other breakpoints.
    */

    // Again use a Set so we only get unique points-of-interest
    const testPoints = new Set();
    // Iterate through all of the input ranges
    for (const range of inputRanges) {
      const [rangeStart, rangeLength] = range;

      // The start of each range is a point-of-interest.
      testPoints.add(rangeStart);

      // Throw out all breakpoints before this range
      while (breakpoints.length && breakpoints[0] < rangeStart) {
        breakpoints.shift();
      }

      // Include all breakpoints within this range
      while (breakpoints.length && breakpoints[0] < rangeStart + rangeLength) {
        testPoints.add(breakpoints.shift());
      }
    }
    console.log(`Testing ${testPoints.size} points`);

    /*
    And finally we have a very small list of points-of-interest
    we should test through our MapFns (172 by my count), so apply
    the Part 1 approach to this small list.
    */
    const outputs = Array.from(testPoints).map((i) => {
      for (const mapFn of maps) {
        i = mapFn.transform(i);
      }
      return i;
    });
    console.log(Math.min(...outputs));
  }
};
