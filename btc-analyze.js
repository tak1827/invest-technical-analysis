/**
 * Analyze btc by calculating buy&sell based on indicator
 */
 
/* Read modules */
var mg = require(__dirname+'/lib/mongo-util.js');
var ut = require(__dirname+'/lib/util.js');

const mongo = { db: 'coin', collection: 'btc' };
const buycsv = __dirname+'/import/btc-buy.csv';
const sellcsv = __dirname+'/import/btc-sell.csv';
const analysiscsv = __dirname+'/output/btc-analysis.csv';
let buyCases = [];
let sellCases = [];
let btcDocs = [];

/* Analyze paramaters  */
const capital = 10000; // $
const btc = 0;
const interval = 24*60;

async function mainTask() { 
  try {

    // Read buy&sell case csv 
    const buyDocs = await ut.readFile(buycsv);
    buyCases = buyDocs.split('\n');
    const sellDocs = await ut.readFile(sellcsv);
    sellCases = sellDocs.split('\n');

    // Get all btc docs
    btcDocs = await mg.findByOption(mongo.db, mongo.collection ,{} , {'sort':'t'});

    let _output = "buy,sell,profit,buy sell count\n";

    buyCases.forEach(buyCase => {
      sellCases.forEach(sellCase => {

        let _buyCase = buyCase.split(',');
        let _sellCase = sellCase.split(',');
        let _capital = capital;
        let _btc = btc;
        let _buySellCount = 0;
        let _buyPrice = 0;
        let _profit = 0;
        let _interval = interval;

        for (let i = 0; i < btcDocs.length; i++) {
          let _btcDoc = btcDocs[i];

          // Buy case
          if (_btc === 0 && _btcDoc[_buyCase[0]] <= _buyCase[1]) {
            _btc = _capital / _btcDoc.p;
            _capital = 0;
            _buyPrice = _btcDoc.p;
            _buySellCount++;
            _interval = interval;
          }

          // Sell case
          else if (_capital === 0 && _btcDoc[_sellCase[0]] >= _sellCase[1]) {
            // if (_btcDoc.p > _buyPrice) {
              _profit += (_btcDoc.p - _buyPrice) * _btc;
              _capital = _btcDoc.p * _btc;
              _btc = 0;
              _buySellCount++;
              _interval = interval;
            // }
          }

          // Break if can not buy or sell in specific interval
          _interval--;
          if (_interval === 0) { _profit = 0; break; }
        }

        if (_profit > 0) {
          _output += _buyCase[0] +": "+ _buyCase[1] +","+ _sellCase[0] +": "+ _sellCase[1] +","+ 
            Math.round(_profit) +","+ _buySellCount +"\n";
        }
      });
    });

    await ut.writeFile(analysiscsv, _output);

  } catch(e) { console.log(e); }
}

mainTask();
