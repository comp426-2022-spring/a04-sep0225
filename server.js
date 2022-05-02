var express = require('express')
var app = express()
const fs = require('fs')
const db = require("./database.js")

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const args = require('minimist')(process.argv.slice(2))

args['port', 'debug', 'log', 'help']
const port = args.port || process.env.PORT || 5555;

const server = app.listen(port, () => {
    console.log('App listening on port %PORT%'.replace('%PORT%', port))
});

if (args.help == true) {
  const help = (`server.js [options]

  --port		Set the port number for the server to listen on. Must be an integer
              	between 1 and 65535.

  --debug	If set to true, creates endlpoints /app/log/access/ which returns
              	a JSON access log from the database and /app/error which throws 
              	an error with the message "Error test successful." Defaults to 
		false.

  --log		If set to false, no log files are written. Defaults to true.
		Logs are always written to database.

  --help	Return this message and exit.`)
  console.log(help)
  process.exit(0)
}

if (args.log == true) {
  const morgan = require('morgan')
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
  const stmt = db.prepare(`INSERT INTO accesslog (remoteaddr, remoteuser, time, method, url, protocol, httpversion, status, referer, useragent)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`)
  const info = stmt.run(logdata.remoteaddr, logdata.remoteuser, logdata.time, logdata.method, logdata.url,
  logdata.protocol, logdata.httpversion, logdata.status, logdata.referer, logdata.useragent)
  next()

})

app.get('/app/', (req, res) => {
    res.statusCode = 200;
    res.statusMessage = 'OK';
    res.writeHead( res.statusCode, { 'Content-Type' : 'text/plain' });
    res.end(res.statusCode+ ' ' +res.statusMessage)
});

if (args.debug == true) {
  app.get('/app/log/access', (req, res) => {
    try {
      const stmt = db.prepare('SELECT * FROM accesslog').all()
      res.status(200).json(stmt)
    } catch {
      console.error(e)
    }
  });
  
  app.get('/app/error', (req, res) => {
    res.status(500);
    throw new Error('Error test completed successfully.')
  })
}

app.use(function(req, res){
  res.status(404).send('404 NOT FOUND')
});