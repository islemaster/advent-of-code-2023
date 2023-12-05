#!/usr/bin/env node

/*
 * Harness for Advent of Code 2022
 *
 * Accepts arguments for the day to decide which script to run
 * Runs script with all inputs in the inputs/dayXX directory and prints results
 * Times runs
 *
 * Usage:
 *   ./index.js --day=<n> --testcase=<filename>
 */

const fs = require("fs");
const path = require("path");
const minimist = require("minimist");

const args = minimist(process.argv.slice(2));
const day = ("0" + args.day).slice(-2);

const dayModulePath = path.resolve(__dirname, `day${day}.js`);
const dayModule = require(dayModulePath);

const inputDir = path.resolve(__dirname, "inputs", `day${day}`);
const inputFiles = fs.readdirSync(inputDir);

async function main() {
  const partNumber = args.part ?? 1;
  for (const inputFile of inputFiles) {
    if (args.testcase && inputFile != args.testcase) {
      continue;
    }
    const inputFilePath = path.resolve(inputDir, inputFile);
    console.log(`\n----------------\n  Running ${inputFile}\n----------------`);
    await dayModule(inputFilePath, partNumber);
  }
  console.log(`\n----------------\n  Done.`);
}

main();
