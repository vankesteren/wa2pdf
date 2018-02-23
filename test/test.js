const { expect } = require("chai");
const fs = require("fs");
const { exec } = require("child_process");
const engine = require("../engine/engine");

describe("Unit tests for wa2pdf engine", function() {
  // setup
  before(function(done) {
    if (fs.existsSync("test/escape.pdf")) fs.unlinkSync("test/escape.pdf");
    if (fs.existsSync("test/oldstyle.pdf")) fs.unlinkSync("test/oldstyle.pdf");
    done();
  });

  it("Engine should escape LaTeX characters properly", function(done) {
    engine.convert("test/escape.txt", "test/escape.pdf", false,
                   function(err, path) {
      if (err) throw err;
      expect(path).to.have.string("escape.pdf").and.string("test");
      expect(fs.existsSync("test/escape.pdf")).to.be.true;
      done();
    });
  }).timeout(10000);

  it("Engine should convert old style logs properly", function(done) {
    engine.convert("test/oldstyle.txt", "test/oldstyle.pdf", false,
                   function(err, path) {
      if (err) throw err;
      expect(path).to.have.string("oldstyle.pdf").and.string("test");
      expect(fs.existsSync("test/oldstyle.pdf")).to.be.true;
      done();
    });
  }).timeout(10000);

  // cleanup
  after(function(done) {
    if (fs.existsSync("test/escape.pdf")) fs.unlinkSync("test/escape.pdf");
    if (fs.existsSync("test/oldstyle.pdf")) fs.unlinkSync("test/oldstyle.pdf");
    done();
  });
});

describe("Unit tests for command line interface", function() {
  before(function(done) {
    if (fs.existsSync("test/cli.pdf")) fs.unlinkSync("test/cli.pdf");
    done();
  });

  it("The cli should convert files", function(done) {
    exec("node cli/wa2pdf.js test/escape.txt -o test/cli.pdf -s",
         function(err, stdout, stderr) {
      if (err) throw err;
      expect(fs.existsSync("test/cli.pdf")).to.be.true;
      done();
    });
  }).timeout(10000);

  it("The cli should throw an error when file does not exist", function(done) {
    exec("node cli/wa2pdf.js test/nothing.txt", function(err, stdout, stderr) {
      expect(stderr).to.have.string("Error: File doesn't exist")
      done();
    });
  });

  // cleanup
  after(function(done) {
    if (fs.existsSync("test/cli.pdf")) fs.unlinkSync("test/cli.pdf");
    done();
  });
})
