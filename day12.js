const fs = require("node:fs/promises");
const readline = require('readline');

function askQuestion(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }))
}

module.exports = async function (inputFile, partNumber) {
  let total = 0;
  const file = await fs.open(inputFile);
  for await (const line of file.readLines()) {
    const [row, groups] = parse(line); 
    const permutations = countValidPermutations(row, groups);
    // console.log(`${line} = ${permutations}`);
    total = total + permutations;
  }
  console.log(`Total: ${total}`);
}

function parse(line) {
  // console.log('\n' + line);
  const [row, groupsString] = line.split(' ');
  const groups = groupsString.split(',').map(Number);
  return [
    new Array(5).fill(row).join('?'),
    new Array(5).fill(groupsString).join(',').split(',').map(Number)
  ];
}

const cache = {};

function countValidPermutations(row, groups, depth=0) {
  // console.log(`\n${' '.repeat(depth)}${row} ${groups}`);
  const cacheKey = `${row} ${groups}`;
  if (cache.hasOwnProperty(cacheKey)) {
    return cache[cacheKey];
  }

  // Consume satisfied groups left-to-right
  let remainingGroups = groups.slice();
  for (let i = 0; i < row.length; i++) {
    const c = row.charAt(i);
    if (c == '.') continue;
    if (c == '#') {
      let j = i + 1;

      // Keep walking until we've reached the next group size,
      // or we run out of springs and unknowns.
      while (row.charAt(j) && '#?'.includes(row.charAt(j)) && j - i < remainingGroups[0]) {
        j++;
      }
      while ('#' == row.charAt(j)) j++;

      // console.log(`Found: ${j - i} springs`);
      
      if (j - i == remainingGroups[0]) {
        // Match! We made a group of the right size.
        // We can skip the character after the group ends because it must be empty
        // or this would be an invalid permutation.
        remainingGroups.shift();
        i = j;
        const result = countValidPermutations(row.slice(j + 1), remainingGroups, depth + j + 1);
        // console.log(`\n${' '.repeat(depth)}${row} ${groups} ==> ${result}`);
        cache[cacheKey] = result;
        return result;
      } else {
        // Too long or too short: Invalid permutation.
        // console.log(`Invalid permutation.`)
        return 0;
      }
    } else {
      // We hit a question mark that doesn't finish a known group.
      // Try it both ways via recursion.
      const result1 = countValidPermutations('#' + row.slice(i + 1), remainingGroups, depth + i);
      const result2 = countValidPermutations('.' + row.slice(i + 1), remainingGroups, depth + i);
      const result = result1 + result2;
      // console.log(`\n${' '.repeat(depth)}${row} ${groups} ==> ${result}`);
      cache[cacheKey] = result;
      return result;
    }
  }

  const result = remainingGroups.length ? 0 : 1;
  cache[cacheKey] = result;
  return result;
}

function nChooseK(n, k) {
  return fact(n) / (fact(k) * fact(n - k));
}
function fact(num)
{
    var rval=1;
    for (var i = 2; i <= num; i++)
        rval = rval * i;
    return rval;
}