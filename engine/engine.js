const fs = require("fs");
const mv = require("mv");
const path = require("path");
const walp = require("whatsapp-log-parser");
const hndl = require("handlebars");
const tmp = require("tmp");
const cp = require("child_process");

convert = function(file, outFile, debug) {
  if (!outFile) {
    var outFile = path.basename(file, path.extname(file)) + ".pdf";
  }

  console.log("Converting " + file + " to " + outFile);

  // convert .txt log to js object
  walp(path.resolve(file), (err, msgs) => {
    if (err) throw err;
    // convert messages object to tex file
    toTex(msgs, debug, (err, paths) => {
      if (err) throw err;
      // convert tex filt to pdf
      toPdf(paths, outFile, debug, (err, pdfPath) => {
        if (err) throw err;
        console.log("Success! Location: " + pdfPath);
      });
    });
  });
}

toTex = function(msgs, debug, callback) {
  // TODO: fix callback hell
  // This function converts parsed whatsapp messages to a tex file and saves it
  fs.readFile(path.join(__dirname, "template/main.txt"), (err, main) => {
    if (err) throw err;
    fs.readFile(path.join(__dirname, "template/table.txt"), (err, table) => {
      if (err) throw err;

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
        console.log(mainString);
        console.log(tableString);
      }

      // create a directory to build the pdf and save the texfiles in it
      tmp.dir(function _tempDirCreated(err, dirpath, cleanupCallback) {
        if (err) throw err;

        // create paths
        var paths = {
          dir: dirpath,
          tbl: path.join(dirpath, "table.tex"),
          tex: path.join(dirpath, "wa2pdf.tex"),
          pdf: path.join(dirpath, "wa2pdf.pdf")
        };
        if (debug) console.log(paths);
        // write the files
        fs.writeFile(paths.tbl, tableString, (err) => {
          if (err) throw err;
          fs.writeFile(paths.tex, mainString, (err) => {
            if (err) throw err;
            if (callback && typeof(callback) === "function") {
              callback(null, paths);
            }
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
    let msg = msgs[i];
    let d = new Date(msgs[i].date)
    msg.date = d.toLocaleString();
    msgsFormatted.push(msg);
  }

  let result = {
    main: {
      title: "Whatsapp conversation",
      authors: authors
    },
    messages: msgsFormatted
  };
  return result;
}

toPdf = function(paths, outFile, debug, callback) {
  // this function converts the tex files to a pdf

  // create the arguments for the xelatex call
  var args = [
    paths.tex,
    "-output-directory=" + paths.dir,
    "-interaction=nonstopmode"
  ];

  // create the child process and run the command
  var child = cp.execFile("xelatex", args, (err, stdout, stderr) => {
    if (err) {
      if (err.code === "ENOENT") {
        throw new Error("Error: xelatex could not be found. Please download it.")
      } else {
        if (debug) {
          console.log("\n\nError received from xelatex:")
          console.log(err);
        }
      }
    }

    // show stdout
    if (debug) console.log(stdout);

    // move the created pdf to the desired output location
    let pdfPath = path.resolve(outFile);
    mv(paths.pdf, pdfPath, function(err) {
      if (err) throw err;
      if (callback && typeof(callback) === "function") {
        // done!
        callback(null, pdfPath);
      }
    });
  });
}

module.exports = {
  convert: convert
};
