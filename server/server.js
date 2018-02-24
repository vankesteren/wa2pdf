const http = require("http");
const url = require('url');
const fs = require("fs");
const os = require("os");

const engine = require("../engine/engine");
const formidable = require("formidable");
const temp = require("temp");

const port = process.argv[2] || 8080;

http.createServer(function (req, res) {
  if (req.url == '/upload') {
    convertFile(req, res);
  } else {
    fs.readFile("server/main.html", (err, data) => {
      if (err) {
        res.writeHead(404, {'Content-Type': 'text/html'});
      }
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write(data);
      return res.end();
    });
  }
}).listen(port);


sendPdf = function(loc, res, callback) {

  var file = fs.createReadStream(loc);
  var stat = fs.statSync(loc);
  res.setHeader('Content-Length', stat.size);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=whatsapplog.pdf');
  file.pipe(res);
  callback();

}

convertFile = function(req, res) {
  var form = new formidable.IncomingForm();

  form.parse(req, function (err, fields, files) {
    var file = files.whatsapplog;

    if (file.type != "text/plain") {
      fs.readFile("server/incorr.html", (err, data) => {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data);
        return res.end();
      });
    } else {
      console.log(">>> File received: " + file.name + " | at: " + timeStamp());
      var outFile = temp.path({suffix: ".pdf"});
      engine.convert(file.path, outFile, false, (err, pdfpath) => {
        if (err) throw err;
        sendPdf(pdfpath, res, () => {
          // Remove the generated pdf after sending it back
          fs.unlink(pdfpath, (err) => {
            if (err) throw err;
            // Remove the uploaded text file after sending the pdf
            fs.unlink(file.path, (err) => {
              if (err) throw err;
              return res.end();
            });
          });
        });
      });
    }
  });
}


timeStamp = function() {
  var now = new Date();
  var date = [ now.getFullYear(), now.getMonth() + 1, now.getDate(),  ];
  var time = [ now.getHours(), now.getMinutes(), now.getSeconds() ];
  for ( var i = 1; i < 3; i++ ) {
    if ( time[i] < 10 ) {
      time[i] = "0" + time[i];
    }
  }
  return date.join("/") + " " + time.join(":");
}

printIpConfig = function() {
  var ifaces = os.networkInterfaces();
  Object.keys(ifaces).forEach(function (ifname) {
    var alias = 0;
    ifaces[ifname].forEach(function (iface) {
      if ('IPv4' !== iface.family || iface.internal !== false) {
        // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
        return;
      }
      if (alias >= 1) {
        // this single interface has multiple ipv4 addresses
        console.log(ifname + ':' + alias, iface.address + ":" + port);
      } else {
        // this interface has only one ipv4 adress
        console.log(ifname, iface.address + ":" + port);
      }
      ++alias;
    });
  });
}

printIpConfig();
