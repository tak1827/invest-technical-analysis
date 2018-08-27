/**
 * Fetch bitcoin price form csv or web
 * csv -> http://api.bitcoincharts.com/v1/csv/
 * web -> http://api.bitcoincharts.com/v1/trades.csv
 */

/* Read modules */
var mg = require(__dirname+'/lib/mongo-util.js');
var ut = require(__dirname+'/lib/util.js');
var wm = require(__dirname+'/lib/web-mining.js');

const mongo = { db: 'coin', collection: 'btc' };
const csvfile = __dirname+'/import/coinbaseUSD.csv'; // USD
const searchUrl = 'http://api.bitcoincharts.com/v1/trades.csv';
const searchQuery = { symbol: 'coinbaseUSD', currency: 'USD' }; // USD
const fetchInterval = 60 * 60 * 1000; // 1h
let btcDocs = [];


// Import btc price from cav file
async function importCsv() {

  const _csvData = await ut.readFile(csvfile);

  let _insertDocs = [];

  _csvData.split('\n').forEach(function (line) {

    let _time = Number(line.split(",")[0] + "000");// Date
    let _price = Number(line.split(",")[1]);// Price
    let _vol = Number(line.split(",")[2]);// Volume
    
    // Retrieve at regular interval
    if (btcDocs.length === 0 || _time >= (new Date(btcDocs[btcDocs.length - 1].t)).getTime() + fetchInterval) {
        _time = new Date(_time);
        btcDocs.push({ t: _time, p : _price, v : _vol });
        _insertDocs.push({ t: _time, p : _price, v : _vol });
    }
  });

  if ( _insertDocs.length != 0) {
  	// console.log(_insertDocs);
  	const result = await mg.insert(mongo.db, mongo.collection, _insertDocs);
  	console.log(result.ops);
  }
}


// Import btc price from web
async function importWeb() {
    
  const _body = await wm.getHtmlQuery(searchUrl, searchQuery);

  let _webData = [];
  
  _body.split('\n').forEach(function (line) {
      let _time = Number(line.split(",")[0] + "000");// Date
      let _price = Number(line.split(",")[1]);// Price
      let _vol = Number(line.split(",")[2]);// Volume
      _webData.push({ t: _time, p : _price, v : _vol });
  });

  // Ordr by asc
  _webData.reverse();

  let _insertDocs = [];

  for (var i = 0; i < _webData.length; i++) {
    // Retrieve at regular interval
    if (btcDocs.length === 0 || _webData[i].t > (new Date(btcDocs[btcDocs.length - 1].t)).getTime() + fetchInterval) {
        _webData[i].t = new Date(_webData[i].t)
        btcDocs.push(_webData[i]);
        _insertDocs.push(_webData[i]);
    }
  }

  if ( _insertDocs.length != 0) {
  	// console.log(_insertDocs);
  	const result = await mg.insert(mongo.db, mongo.collection, _insertDocs);
  	console.log(result.ops);
  }
}


async function mainTask() { 
	try {

		// Get all btc docs
	  btcDocs = await mg.findByOption(mongo.db, mongo.collection ,{} , {'sort':'t'});

    // Import from csv
    if (process.argv[2] == 'csv') { importCsv(); }

    // Import from web
    else if (process.argv[2] == 'web') { importWeb(); }

    // Wrong args
    else { console.log('missing argument.'); process.kill(process.pid); }

	} catch(e) { console.log(e); }
}

mainTask();
