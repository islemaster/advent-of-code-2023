const fs = require("node:fs/promises");

module.exports = async function (inputFile, partNumber) {

  const file = await fs.open(inputFile);
  const pipes = [];
  const sides = [];
  let start;
  for await (const line of file.readLines()) {
    pipes.push(line.split(''));
    sides.push(new Array(line.length).fill('.'));
    let i = line.indexOf('S');
    if (i >= 0) {
      start = {x: i, y: pipes.length - 1};
    }
  }

  let agents = [...findNeighbors(start)];
  pipes[start.y][start.x] = '#';
  sides[start.y][start.x] = '#';
  fillSides(start, agents[0], 0);
  fillSides(start, agents[1], 1);
  let steps = 1;
  while (agents[0].x != agents[1].x || agents[0].y != agents[1].y) {
    for (let a = 0; a < agents.length; a++) {
      const agentPos = agents[a];
      const nextPos = findNeighbors(agentPos)[0];
      agents[a] = nextPos;
      pipes[agentPos.y][agentPos.x] = '#';
      sides[agentPos.y][agentPos.x] = '#';
      fillSides(agentPos, nextPos, a);
    }
    // print(pipes);
    // print(sides);
    steps++;
  }
  pipes[agents[0].y][agents[0].x] = '#';
  sides[agents[0].y][agents[0].x] = '#';

  // Fill interiors
  for (let y = 0; y < sides.length; y++) {
    for (let x = 1; x < sides[y].length; x++) {
      if (sides[y][x] == '.' && 'AB'.includes(sides[y][x-1])) {
        sides[y][x] = sides[y][x-1];
      }
    }
  }

  // print(pipes);
  print(sides);
  console.log(`Steps to farthest point: ${steps}`);
  
  function findNeighbors(pt) {
    const currentPipe = pipes[pt.y][pt.x];
    const neighbors = [];
    // Up
    if (pt.y > 0 && 'S|LJ'.includes(currentPipe) && '|7F'.includes(pipes[pt.y-1][pt.x])) {
      neighbors.push({x: pt.x, y: pt.y - 1});
    }
    // Down
    if (pt.y < pipes.length - 1 && 'S|7F'.includes(currentPipe) && '|LJ'.includes(pipes[pt.y+1][pt.x])) {
      neighbors.push({x: pt.x, y: pt.y + 1});
    }
    // Left
    if (pt.x > 0 && 'S-7J'.includes(currentPipe) && '-FL'.includes(pipes[pt.y][pt.x-1])) {
      neighbors.push({x: pt.x - 1, y: pt.y});
    }
    // Right
    if (pt.x < pipes[0].length - 1 && 'S-FL'.includes(currentPipe) && '-7J'.includes(pipes[pt.y][pt.x+1])) {
      neighbors.push({x: pt.x + 1, y: pt.y});
    }
    return neighbors;
  }

  function fillSides(from, to, agentNum) {
    let lefts = [], rights = [];
    if (to.x - from.x > 0) { // Went right
      lefts.push({x: to.x, y: to.y - 1});
      lefts.push({x: from.x, y: from.y - 1});
      rights.push({x: to.x, y: to.y + 1});
      rights.push({x: from.x, y: from.y + 1});
    } else if (to.x - from.x < 0) { // Went left
      lefts.push({x: to.x, y: to.y + 1});
      lefts.push({x: from.x, y: from.y + 1});
      rights.push({x: to.x, y: to.y - 1});
      rights.push({x: from.x, y: from.y - 1});
    } else if (to.y - from.y > 0) { // Went down
      lefts.push({x: to.x + 1, y: to.y});
      lefts.push({x: from.x + 1, y: from.y});
      rights.push({x: to.x - 1, y: to.y});
      rights.push({x: from.x - 1, y: from.y});
    } else if (to.y - from.y < 0) { // Went up
      lefts.push({x: to.x - 1, y: to.y});
      lefts.push({x: from.x - 1, y: from.y});
      rights.push({x: to.x + 1, y: to.y});
      rights.push({x: from.x + 1, y: from.y});
    }

    for (const leftHand of lefts) {
      if (leftHand.x >= 0 && leftHand.x < sides[0].length && leftHand.y >= 0 && leftHand.y < sides.length) {
        const leftSide = sides[leftHand.y][leftHand.x];
        if (leftSide != '#') {
          sides[leftHand.y][leftHand.x] = agentNum ? 'A' : 'B';
        }
      }
    }

    for (const rightHand of rights) {
      if (rightHand.x >= 0 && rightHand.x < sides[0].length && rightHand.y >= 0 && rightHand.y < sides.length) {
        const rightSide = sides[rightHand.y][rightHand.x];
        if (rightSide != '#') {
          sides[rightHand.y][rightHand.x] = agentNum ? 'B' : 'A';
        }
      }
    }
  }

  function print(pipes) {
    console.log('\n' + pipes.map(line => '  ' + line.join('')).join('\n'));
  }
}