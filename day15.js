const fs = require("node:fs/promises");

module.exports = async function (inputFile, partNumber) {
  const boxes = [];
  for (let i = 0; i < 256; i++) {
    boxes.push(new Box());
  }
  const file = await fs.open(inputFile);
  const regex = /([a-z]+)([=-])([0-9]?)/g;
  for await (const line of file.readLines()) {
    if (!line) continue;
    const matches = line.matchAll(regex);
    for (const match of matches) {
      const [full, label, op, lens] = match;
      // console.log('\n' + full);
      // console.log(hash(label));
      const box = boxes[hash(label)];
      if (op == '=') {
        box.set(label, lens);
      } else {
        box.remove(label);
      }
      // print(boxes);
    }
  }

  let total = 0;
  for (let i = 0; i < boxes.length; i++) {
    const box = boxes[i];
    total = total + box.score(i);
  }

  console.log(`Total: ${total}`);
};

function print(boxes) {
  for (let i = 0; i < boxes.length; i++) {
    const box = boxes[i];
    if (box.sequence.length) {
      console.log(`Box ${i}: ` + box.sequence.map(l => `[${l} ${box.lenses[l]}]`).join(' '));
    }
  }
}

/** An ordered set */
class Box {
  constructor() {
    this.sequence = [];
    this.lenses = {};
  }

  set(label, lens) {
    if (!this.lenses.hasOwnProperty(label)) {
      this.sequence.push(label);
    }
    this.lenses[label] = lens;
  }

  remove(label) {
    const i = this.sequence.indexOf(label);
    if (i >= 0) {
      this.sequence.splice(i, 1);
      delete this.lenses[label];
    }
  }

  score(boxNumber) {
    let total = 0;
    for (let i = 0; i < this.sequence.length; i++) {
      total = total + (boxNumber + 1) * (i + 1) * this.lenses[this.sequence[i]];
    }
    return total;
  }
}

function hash(s) {
  let val = 0;
  for (let i = 0; i < s.length; i++) {
    val = val + s.charCodeAt(i);
    val = val * 17;
    val = val % 256;
  }
  return val;
}