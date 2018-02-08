<p align="center">
  <!--img src="img.svg" width="250px"></img>
  <br-->
  <h1 align="center">wa2pdf</h1>
  <h4 align="center">Convert whatsapp logs to a presentable pdf report</h4>
</p>
<br>

### How to install
1. Make sure you have `xelatex` in your `PATH`. If it isn't, install [MiKTeX](https://miktex.org/) (Windows), [TeX live](https://www.tug.org/texlive/) (Linux), or [MacTeX](http://www.tug.org/mactex/) (OSX). During install, be sure to allow automatic package updates.
2. Make sure you have the font `DejaVu Sans` installed. You can also get it from `dist/dejavu-sans` in this repository.
3. `npm install -g vankesteren/wa2pdf`
4. profit.

### How to use
The a command line interface (see folder `./cli`) works like this:
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

### What's next?
- Server interface:
    - send your whatsapp log via email?
    - upload your log to a webpage?
- Template: actually make it pretty
