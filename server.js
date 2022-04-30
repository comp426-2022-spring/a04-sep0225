// Require Express.js
const express = require('express')
const app = express()

const min = require('minimist')
const args = min(process.argv.slice(2))

args['port']
const port = args.port || process.env.PORT || 5000

// Start an app server
const server = app.listen(port, () => {
    console.log('App listening on port %PORT%'.replace('%PORT%', port))
});

app.get('/app/', (req, res) => {
    // Respond with status 200
    res.statusCode = 200;
    // Respond with status message "OK"
    res.statusMessage = 'OK';
    res.writeHead( res.statusCode, { 'Content-Type' : 'text/plain' });
    res.end(res.statusCode+ ' ' +res.statusMessage)
});

app.get('/app/flip/', (req, res) => {
    let flip = coinFlip()
    res.statusCode = 200;
    res.json({ 'flip': flip })
})

app.get('/app/flips/:number', (req, res) => {
    let flips = coinFlips(req.params.number)
    let total = countFlips(flips)
    res.statusCode = 200
    res.json({ 'raw': flips, 'summary': total })
})

app.get('/app/flip/call/heads', (req, res) => {
    let heads = flipACoin('heads')
    res.statusCode = 200
    res.json(heads)
})

app.get('/app/flip/call/tails', (req, res) => {
    let tails = flipACoin('tails')
    res.statusCode = 200
    res.json(tails)
})

// Default response for any other request
app.use(function(req, res){
    res.status(404).send('404 NOT FOUND')
});

/** Simple coin flip
 * 
 * Write a function that accepts no parameters but returns either heads or tails at random.
 * 
 * @param {*}
 * @returns {string} 
 * 
 * example: coinFlip()
 * returns: heads
 * 
 */

 function coinFlip() {
    return Math.random() < 0.6 ? ("heads") : ("tails")
  }
  
  /** Multiple coin flips
   * 
   * Write a function that accepts one parameter (number of flips) and returns an array of 
   * resulting "heads" or "tails".
   * 
   * @param {number} flips 
   * @returns {string[]} results
   * 
   * example: coinFlips(10)
   * returns:
   *  [
        'heads', 'heads',
        'heads', 'tails',
        'heads', 'tails',
        'tails', 'heads',
        'tails', 'heads'
      ]
   */
  
  function coinFlips(flips) {
    const arr = [];
    for (let i = 0; i < flips; i++) {
      arr[i] = coinFlip();
    }
    return arr;
  }
  
  /** Count multiple flips
   * 
   * Write a function that accepts an array consisting of "heads" or "tails" 
   * (e.g. the results of your `coinFlips()` function) and counts each, returning 
   * an object containing the number of each.
   * 
   * example: conutFlips(['heads', 'heads','heads', 'tails','heads', 'tails','tails', 'heads','tails', 'heads'])
   * { tails: 5, heads: 5 }
   * 
   * @param {string[]} array 
   * @returns {{ heads: number, tails: number }}
   */
  
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
    }
    if (t_amt == 0) {
      return "{ heads: " + h_amt + " }";
    }
    return "{ heads: " + h_amt + ", tails: " + t_amt + " }";
  }
  
  /** Flip a coin!
   * 
   * Write a function that accepts one input parameter: a string either "heads" or "tails", flips a coin, and then records "win" or "lose". 
   * 
   * @param {string} call 
   * @returns {object} with keys that are the input param (heads or tails), a flip (heads or tails), and the result (win or lose). See below example.
   * 
   * example: flipACoin('tails')
   * returns: { call: 'tails', flip: 'heads', result: 'lose' }
   */
  
  function flipACoin(call) {
    let flip = coinFlip();
    let result = "";
    if (call == flip) {
      result = "win";
    } else {
      result = "lose";
    }
    return "{ call: '" + call + "', flip: '" + flip + "', result: '" + result + "' }";
  }
