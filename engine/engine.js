const fs = require("fs");
const mv = require("mv");
const path = require("path");
const walp = require("whatsapp-log-parser");
const hndl = require("handlebars");
const lesc = require("escape-latex");
const tmp = require("tmp");
const cp = require("child_process");
const chalk = require("chalk");

convert = function(file, outFile, debug, callback) {
  if (debug) (chalk.yellow("  >>> Printing debug information <<<\n"))

  // convert .txt log to js object
  walp(path.resolve(file), (err, msgs) => {
    if (err) return callback(err);
    // convert messages object to tex file
    toTex(msgs, debug, (err, paths) => {
      if (err) return callback(err);
      // convert tex filt to pdf
      toPdf(paths, outFile, debug, (err, pdfPath) => {
        if (err) return callback(err);
        return callback(null, pdfPath);
      });
    });
  });
}

toTex = function(msgs, debug, callback) {
  // This function converts parsed whatsapp messages to a tex file and saves it
  fs.readFile(path.join(__dirname, "template/main.txt"), (err, main) => {
    if (err) return callback(err);
    fs.readFile(path.join(__dirname, "template/table.txt"), (err, table) => {
      if (err) return callback(err);

      // both files are now read, preprocess the msgs
      var contents = compileContents(msgs);

      // compile the templates
      var mainTemplate = hndl.compile(main.toString(), {
        noEscape: true
      })
      var tableTemplate = hndl.compile(table.toString(), {
        noEscape: true
      })

      // create the tex files
      var mainString = mainTemplate(contents.main);
      var tableString = tableTemplate(contents);

      // print on debug
      if (debug) {
        console.log("\n")
        console.log(chalk.yellow(mainString));
        console.log(chalk.yellow(tableString));
      }

      // create a directory to build the pdf and save the texfiles in it
      tmp.dir(function _tempDirCreated(err, dirpath, cleanupCallback) {
        if (err) return callback(err);

        // create paths
        var paths = {
          dir: dirpath,
          tbl: path.join(dirpath, "table.tex"),
          tex: path.join(dirpath, "wa2pdf.tex"),
          pdf: path.join(dirpath, "wa2pdf.pdf")
        };
        if (debug) console.log(chalk.yellow(paths));
        // write the files
        fs.writeFile(paths.tbl, tableString, (err) => {
          if (err) return callback(err);
          fs.writeFile(paths.tex, mainString, (err) => {
            if (err) return callback(err);
            callback(null, paths);
          });
        });
      });
    });
  });
}

compileContents = function(msgs) {
  // unique authors
  let authors = [... new Set(msgs.map((msg) => msg.sender))]
    .filter(function(n){ return n != undefined });

  msgsFormatted = [];
  for (i in msgs) {
    var msg = {};
    msg.message = lesc(msgs[i].message, { preserveFormatting: false });
    if (msgs[i].sender) {
      msg.sender = lesc(msgs[i].sender, { preserveFormatting: false });
    }
    let d = new Date(msgs[i].date)
    msg.date = d.toLocaleString();
    msgsFormatted.push(msg);
  }

  let result = {
    main: {
      title: "Whatsapp conversation",
      authors: authors,
      firstDate: msgsFormatted[0].date,
      lastDate: msgsFormatted[msgsFormatted.length-1].date
    },
    messages: msgsFormatted
  };
  return result;
}

toPdf = function(paths, outFile, debug, callback) {
  // this function converts the tex files to a pdf

  // create the arguments for the xelatex call
  var args = [
    "wa2pdf.tex",
    "-interaction=nonstopmode",
    "-quiet"
  ];

  // create the options for the xelatex call
  var opts = {
    cwd: paths.dir
  };

  // create the child process and run the command
  var child = cp.execFile("xelatex", args, opts, (err, stdout, stderr) => {
    if (err) {
      if (err.code === "ENOENT") {
        return callback(new Error("Error: xelatex could not be found. Please download it."));
      } else {
        // xelatex is error-prone but does output pdf often.
        // let the move operation handle a no-pdf error.
        if (debug) {
          console.log(chalk.redBright("\nSome xelatex errors found:"));
          console.log(chalk.redBright(stdout));
          console.log("\n");
        }
      }
    }

    // show stdout
    if (debug) console.log(chalk.redBright(stdout));

    // move the created pdf to the desired output location
    let pdfPath = path.resolve(outFile);
    mv(paths.pdf, pdfPath, function(err) {
      if (err) return callback(err);
      // done!
      return callback(null, pdfPath);
    });
  });
}

module.exports = {
  convert: convert
};
