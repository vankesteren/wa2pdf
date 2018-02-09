<p align="center">
  <!--img src="img.svg" width="250px"></img>
  <br-->
  <h1 align="center">wa2pdf</h1>
  <h4 align="center">Convert whatsapp logs to a presentable pdf report</h4>
  <p align="center">
    <a href="https://travis-ci.org/vankesteren/wa2pdf"><img src="https://travis-ci.org/vankesteren/wa2pdf.svg?branch=master"></a>
  </p>
</p>
<br>

### How to install
1. Make sure you have `xelatex` in your `PATH`. If it isn't, install a TeX distribution such as [MiKTeX](https://miktex.org/) (Windows), [TeX live](https://www.tug.org/texlive/) (Linux), or [MacTeX](http://www.tug.org/mactex/) (OSX). 
2. Make sure you have the font `DejaVu Sans` installed. You can get it from `dist/dejavu-sans` in this repository.
3. Make sure you have [Node.js](https://nodejs.org/) installed.
4. `npm install -g vankesteren/wa2pdf`

### How to use
The command line interface (see folder `./cli`) works like this:

`wa2pdf whatsapplog.txt -o prettylog.pdf`

Here is the help for usage:
```
 Usage: wa2pdf [options] <file>


  Options:

    -o, --output <filename>  The output file (.pdf)
    -d, --debug              Print debug information
    -s, --silent             Do not open the converted pdf.
    -h, --help               output usage information
```

### To do
- Server interface:
    - send your whatsapp log via email?
    - upload your log to a webpage?
- Template: Make the template pretty.
- CLI: use chalk to style output https://www.npmjs.com/package/chalk.
- Output: Optionally, calculate statistics etc for the report to be shown on top
    - total number of messages per person
    - most common words
    - other summary info
