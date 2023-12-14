const fs = require("node:fs/promises");

module.exports = async function (inputFile, partNumber) {
  let total = 0;
  let board = [];
  let w = 0;
  let h = 0;
  const file = await fs.open(inputFile);
  for await (const line of file.readLines()) {
    if (!line) continue;
    w = line.length;
    h++;
    board.push(...line.split(''));
  }
  p(board, w);
  // tilt(board, 'w', w, h);

  const cycleHistory = [];
  const historyLimit = 500;

  const n = 1000000000;
  for (let i = 0; i < n; i++) {
    if (i % 1000000 == 0) console.log(`Remain: ${n - i}; Cache size: ${Object.keys(cache).length}`);
    board = tilt(board, 'n', w, h);
    board = tilt(board, 'w', w, h);
    board = tilt(board, 's', w, h);
    board = tilt(board, 'e', w, h);
    const cycleEnd = board.join('');
    if (i < historyLimit) {
      if (cycleHistory.includes(cycleEnd)) {
        const cycleLength = cycleHistory.length - cycleHistory.lastIndexOf(cycleEnd);
        console.log(`${i}: Visited this state ${cycleLength} cycles ago`);
        while (i + cycleLength < n) {
          i = i + cycleLength;
        }
      }
      cycleHistory.push(cycleEnd);
    }
  }
  p(board, w);


  console.log(`Total: ${scoreBoard(board, w, h)}`);
}

function p(board, w) {
  console.log('\n');
  for (let i = 0; i < board.length; i = i + w) {
    console.log(board.slice(i, i+w).join(''));
  }
}

const cache = {};

function tilt(board, direction, w, h) {
  const cacheKey = board.join('') + direction;
  if (cache.hasOwnProperty(cacheKey)) {
    return cache[cacheKey];
  }

  if (direction == 'n') {
    for (let y = 1; y < h; y++) {
      for (let x = 0; x < w; x++) {
        // Each time we find a boulder, roll it north as far as possible.
        if (board[y*w + x] == 'O') {
          let finalY = y;
          while (finalY > 0 && board[(finalY - 1)*w + x] == '.') finalY--;
          board[y*w + x] = '.';
          board[finalY*w + x] = 'O';
        }
      }
    }
  } else if (direction == 's') {
    for (let y = h - 2; y >= 0; y--) {
      for (let x = 0; x < w; x++) {
        // Each time we find a boulder, roll it south as far as possible.
        if (board[y*w + x] == 'O') {
          let finalY = y;
          while (finalY < h - 1 && board[(finalY + 1)*w + x] == '.') finalY++;
          board[y*w + x] = '.';
          board[finalY*w + x] = 'O';
        }
      }
    }
  } else if (direction == 'w') {
    for (let x = 1; x < w; x++) {
      for (let y = 0; y < h; y++) {
        // Each time we find a boulder, roll it east as far as possible.
        if (board[y*w + x] == 'O') {
          let finalX = x;
          while (finalX > 0 && board[y*w + (finalX - 1)] == '.') finalX--;
          board[y*w + x] = '.';
          board[y*w + finalX] = 'O';
        }
      }
    }
  } else if (direction == 'e') {
    for (let x = w - 2; x >= 0; x--) {
      for (let y = 0; y < h; y++) {
        // Each time we find a boulder, roll it east as far as possible.
        if (board[y*w + x] == 'O') {
          let finalX = x;
          while (finalX < w - 1 && board[y*w + (finalX + 1)] == '.') finalX++;
          board[y*w + x] = '.';
          board[y*w + finalX] = 'O';
        }
      }
    }
  }
  cache[cacheKey] = board.slice();
  return cache[cacheKey];
}

function scoreBoard(board, w, h) {
  let score = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (board[y*w + x] == 'O') {
        score = score + (h - y);
      }
    }
  }
  return score;
}