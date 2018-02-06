#!/usr/bin/env node
const program = require("commander");
const engine = require("../engine/engine.js");

// The commandline interface
program
  .arguments("<file>")
  .option("-o, --output <filename>", "The output file (.pdf)")
  .option("-d, --debug", "Print debug information")
  .action((file) => {
    try {
      if (console.debug) console.log("Printing debug information");
      engine.convert(file, program.output, program.debug);
    } catch (e) {
      console.error(e.name + ": " + e.message);
    }
  })
  .parse(process.argv);
