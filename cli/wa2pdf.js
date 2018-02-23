#!/usr/bin/env node
const program = require("commander");
const engine = require("../engine/engine.js");
const exec = require("child_process").exec;
const path = require("path");
const { Spinner } = require("cli-spinner");
const chalk = require("chalk");

// The commandline interface
program
  .arguments("<file>")
  .option("-o, --output <filename>", "The output file (.pdf)")
  .option("-d, --debug", "Print debug information")
  .option("-s, --silent", "Do not open the converted pdf.")
  .option("-n, --noprogress", "Do not show progress indicator.")
  .action((file) => {
    if (!program.output) {
      var outFile = path.basename(file, path.extname(file)) + ".pdf";
    } else {
      var outFile = program.output;
    }

    // init spinner
    if (!program.noprogress) {
      var sp = new Spinner(chalk.cyan("Converting " + file + " to " + outFile));
      sp.setSpinnerString("~!@#$%^&*()_+");
      sp.start();
    } else {
      console.log(chalk.cyan("Converting " + file + " to " + outFile));
    }

    // convert file
    engine.convert(file, outFile, program.debug, (err, path) => {
      if (!program.noprogress) {
        // stop spinner
        sp.stop();
      } else {
        console.log(chalk.green("Done"));
      }

      if (err) {
        console.error(err.name + ": " + err.message);
        process.exit();
      }
      if (!program.silent) {
        // open the generated pdf file
        exec(openCommand() + ' ' + path);
      }
    });
  })
  .parse(process.argv);


// https://stackoverflow.com/questions/29902347/open-a-file-with-default-program-in-node-webkit/29917107#29917107
function openCommand() {
   switch (process.platform) {
      case 'darwin' : return 'open';
      case 'win32' : return 'start';
      case 'win64' : return 'start';
      default : return 'xdg-open';
   }
}
