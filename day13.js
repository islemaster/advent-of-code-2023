const fs = require("node:fs/promises");



module.exports = async function (inputFile, partNumber) {
  let total = 0;
  let board = [];
  const file = await fs.open(inputFile);
  for await (const line of file.readLines()) {
    if (line) {
      board.push(line);
    } else {
      total = total + processBoard(board);
      board = [];
    }
  }
  if (board.length) {
    total = total + processBoard(board);
  }
  console.log(`Total: ${total}`);
}

function processBoard(board) {
  // console.log(board);

  // Check for horizontal reflection
  const candidateColumns = new Array(board[0].length - 1).fill(0);
  for (let y = 0; y < board.length; y++) {
    const row = board[y];
    for (let x = 0; x < row.length - 1; x++) {
      for (let d = 0; x - d >= 0 && x + 1 + d < row.length; d++) {
        // console.log(`Row ${y}: Compare ${x-d}:${row[x-d]} with ${x + 1 + d}:${row[x + 1 + d]}`)
        if (row[x - d] != row[x + 1 + d]) {
          candidateColumns[x]++;
        }
      }
    }
    if (candidateColumns.every(k => k > 1)) {
      // console.log('No horizontal reflection.');
      break;
    }
  }

  // Check for vertical reflection
  const candidateRows = new Array(board.length - 1).fill(0);
  for (let x = 0; x < board[0].length; x++) {
    for (let y = 0; y < board.length - 1; y++) {
      for (let d = 0; y - d >= 0 && y + 1 + d < board.length; d++) {
        if (board[y - d][x] != board[y + 1 + d][x]) {
          candidateRows[y]++;
        }
      }
    }
    if (candidateRows.every(k => k > 1)) {
      // console.log('No vertical reflection.');
      break;
    }
  }

  // console.log('cols');
  // console.log(candidateColumns);
  // console.log('rows')
  // console.log(candidateRows);

  return 100 * (candidateRows.indexOf(1) + 1) + (candidateColumns.indexOf(1) + 1);
}