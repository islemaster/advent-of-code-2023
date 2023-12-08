const fs = require("node:fs/promises");

module.exports = async function (inputFile, partNumber) {
  const file = await fs.open(inputFile);
 
  let directions;
  const nodes = {};
  const nodeRe = /(\w+)\s*=\s*\((\w+),\s*(\w+)\)/;
  for await (const line of file.readLines()) {
    // Throw out a blank line
    if (!line) continue;
    // The first line is our directions
    if (!directions) {
      directions = line;
      continue;
    }
    // The rest of the lines are graph nodes
    const [_, label, left, right] = line.match(nodeRe);
    nodes[label] = {name: label, L: left, R: right};
  }
  console.log(`Directions length: ${directions.length}`);
  console.log(`${Object.keys(nodes).length} nodes`);

  // Now follow the directions and count steps to ZZZ.
  let steps = 0;
  if (partNumber == 1) {
    let currentNode = nodes.AAA;
    while (currentNode !== nodes.ZZZ) {
      currentNode = nodes[currentNode[directions[steps % directions.length]]];
      steps++;
    }
  } else if (partNumber == 2) {
    let ghosts = Object.values(nodes).filter(node => node.name.endsWith('A'));
    console.log(`${ghosts.length} ghosts`);
    console.log(ghosts.map(g => g.name));

    // For each ghost, find its cycle length and offset
    for (let ghostNum = 0; ghostNum < ghosts.length; ghostNum++) {
      let currentNode = ghosts[ghostNum];
      let lastHit = 0;
      console.log(`Testing ${currentNode.name}...`);
      for (let s = 0; s < directions.length * 500; s++) {
        const dir = directions[s % directions.length];
        currentNode = nodes[currentNode[dir]];
        if (currentNode.name.endsWith('Z')) {
          console.log(`${currentNode.name} : ${s} : ${s - lastHit} : Period: ${s % directions.length}`);
          lastHit = s;
        }
      }
    }

    // while (!ghosts.every(ghost => ghost.name.endsWith('Z'))) {
    //   const dir = directions[steps % directions.length];
    //   for (let g = 0; g < ghosts.length; g++) {
    //     ghosts[g] = nodes[ghosts[g][dir]];
    //   }
    //   // console.log(ghosts.map(g => g.name));
    //   steps++;
    //   if (steps % 1000000 == 0) {
    //     console.log(steps);
    //   }
    // }
  } else if (partNumber == 3) {
    const period = [
      12169,
      20093,
      20659,
      22357,
      13301,
      18961
    ]
    const stepsUntilHit = [
      12168,
      20092,
      20658,
      22356,
      13300,
      18960
    ]
    let steps = 0;
    while (stepsUntilHit.some(s => s > 0)) {
      if (steps % 1000 == 0) console.log(steps);
      for (let i = 0; i < 6; i++) {
        if (stepsUntilHit[i] == 0) stepsUntilHit[i] = period[i];
      }
      const nextStep = Math.min(...stepsUntilHit);
      for (let i = 0; i < 6; i++) {
        stepsUntilHit[i] = stepsUntilHit[i] - nextStep;
      }
      steps = steps + nextStep;
    }
  }
  console.log(`Steps: ${steps}`);
};
