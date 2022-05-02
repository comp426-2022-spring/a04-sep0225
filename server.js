var minimist = require('minimist');
const { exit } = require('process');

var args = minimist(process.argv.slice(2), {
  integer: [ 'port' ],
  boolean: [ 'debug', 'log', 'help' ],
  default: { help: false, port: 5555, debug: false, log: true },
  '--': true,
})

args['port', 'debug', 'log', 'help']

const help = (`server.js [options]

  --por		Set the port number for the server to listen on. Must be an integer
              	between 1 and 65535.

  --debug	If set to true, creates endlpoints /app/log/access/ which returns
              	a JSON access log from the database and /app/error which throws 
              	an error with the message "Error test successful." Defaults to 
		false.

  --log		If set to false, no log files are written. Defaults to true.
		Logs are always written to database.

  --help	Return this message and exit.`);

if (args.help || args.h) {
  console.log(help);
  process.exit(0);
}

const express = require('express');
const app = express();
const fs = require('fs');
const logdb = require("./database.js");
const morgan = require('morgan');

const port = args.port || 5555;

const server = app.listen(port, () => {
    console.log('App listening on port %PORT%'.replace('%PORT%', port))
});

if (args.log == true) {
  const accessLog = fs.createWriteStream('access.log', { flags: 'a' })
  app.use(morgan('combined', { stream: accessLog }))
}

app.use((req, res, next) => {
  let logdata = {remoteaddr: req.ip,
                remoteuser: req.user,
                time: Date.now(),
                method: req.method,
                url: req.url,
                protocol: req.protocol,
                httpversion: req.httpVersion,
                status: res.statusCode,
                referer: req.headers['referer'],
                useragent: req.headers['user-agent']
              }
  const stmt = logdb.prepare(`INSERT INTO accesslog (remoteaddr, remoteuser, time, method, url, protocol, httpversion, status, referer, useragent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  const info = stmt.run(logdata.remoteaddr, logdata.remoteuser, logdata.time, logdata.method, logdata.url,
  logdata.protocol, logdata.httpversion, logdata.status, logdata.referer, logdata.useragent);
  next();

})

app.get('/app/', (req, res) => {
    res.statusCode = 200;
    res.statusMessage = 'OK';
    res.writeHead( res.statusCode, { 'Content-Type' : 'text/plain' });
    res.end(res.statusCode+ ' ' +res.statusMessage)
});

function coinFlip() {
  return Math.random() < 0.6 ? ("heads") : ("tails")
}

function coinFlips(flips) {
  const arr = [];
  for (let i = 0; i < flips; i++) {
    arr[i] = coinFlip();
  }
  return arr;
}

function countFlips(array) {
  let h_amt = 0;
  let t_amt = 0;
  for (let i = 0; i < array.length; i++) {
    if (array[i] == "heads") {
      h_amt += 1;
    } else {
      t_amt += 1;
    }
  }
  if (h_amt == 0) {
    return "{ tails: " + t_amt + " }";
  } else if (t_amt == 0) {
    return "{ heads: " + h_amt + " }";
  } else {
    return {"heads":h_amt, "tails":t_amt};
  }
}

function flipACoin(call) {
  let flip = coinFlip();
  let result = "";
  if (call == flip) {
    result = "win";
  } else {
    result = "lose";
  }
  return {call: call, flip: flip, result: result};
}

if (args.debug == true) {
  app.get('/app/log/access', (req, res) => {
    try {
      const stmt = logdb.prepare('SELECT * FROM accesslog').all()
      res.status(200).json(stmt)
    } catch (e) {
      console.error(e);
    }
  });
  
  app.get('/app/error', (req, res) => {
    throw new Error('Error test completed successfully.');
  });
}

app.get('/app/flip/', (req, res) => {
  const flip = coinFlip()
  res.status(200).json({'flip' : flip})
});

app.get('/app/flips/:number/', (req, res) => {
  const flips = coinFlips(req.params.number)
  const total = countFlips(flips)
  res.status(200).json({'raw' : flips, 'summary' : total})
});

app.get('/app/flip/call/heads', (req, res) => {
  res.status(200).json(flipACoin("heads"))
});

app.get('/app/flip/call/tails', (req, res) => {
  res.status(200).json(flipACoin("tails"))
});

app.use(function(req, res){
  res.status(404).send('404 NOT FOUND')
});