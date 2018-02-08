#!/usr/bin/env node
const program = require("commander");
const engine = require("../engine/engine.js");
const exec = require('child_process').exec;

// The commandline interface
program
  .arguments("<file>")
  .option("-o, --output <filename>", "The output file (.pdf)")
  .option("-d, --debug", "Print debug information")
  .option("-s, --silent", "Do not open the converted pdf.")
  .action((file) => {
    if (program.debug) console.log("\n  >>> Printing debug information <<< \n");

    engine.convert(file, program.output, program.debug, (err, path) => {
      if (err) {
        console.error(err.name + ": " + err.message);
        process.exit();
      }
      if (!program.silent) {
        // open the generated pdf file
        exec(getCommandLine() + ' ' + path);
      }
    });
  })
  .parse(process.argv);


// https://stackoverflow.com/questions/29902347/open-a-file-with-default-program-in-node-webkit/29917107#29917107
function getCommandLine() {
   switch (process.platform) {
      case 'darwin' : return 'open';
      case 'win32' : return 'start';
      case 'win64' : return 'start';
      default : return 'xdg-open';
   }
}
