/**
 * Calculate indicators for technical analysis
 */
 
/* Read modules */
var mg = require(__dirname+'/lib/mongo-util.js');
var ci = require(__dirname+'/lib/calculate-indicators.js');

const mongo = { db: 'coin', collection: 'btc' };
let btcDocs = [];

async function mainTask() { 
  try {

    // Get all btc docs
    btcDocs = await mg.findByOption(mongo.db, mongo.collection ,{} , {'sort':'t'});

    _btcDocs = btcDocs;

    /* Moving Average Deviation Rate */
    const _dr24h = ci.deviationRate(_btcDocs, '24h', 1, 1*24);// 24h deviation rate
    const _dr7d = ci.deviationRate(_btcDocs, '7d', 24, 24*7);// 7d deviation rate
    const _dr25d = ci.deviationRate(_btcDocs, '25d', 24, 24*25);// 25d deviation rate
    _btcDocs = Object.assign(_btcDocs, _dr24h, _dr7d, _dr25d);

    /* RSI */
    const _rsi24h = ci.rsi(_btcDocs, '24h', 1, 1*24);// 24h rsi
    const _rsi7d = ci.rsi(_btcDocs, '7d', 24, 24*7);// 7d rsi
    const _rsi25d = ci.rsi(_btcDocs, '25d', 24, 24*25);// 25d rsi
    _btcDocs = Object.assign(_btcDocs, _rsi24h, _rsi7d, _rsi25d);

    /* Bollinger Band */
    const _bb24h = ci.bollBand(_btcDocs, '24h', 1, 1*24);// 24h boll band
    const _bb7d = ci.bollBand(_btcDocs, '7d', 24, 24*7);// 7d boll band
    const _bb25d = ci.bollBand(_btcDocs, '25d', 24, 24*25);// 25d boll band

    const result = Object.assign(_dr24h, _dr7d, _dr25d, _rsi24h, _rsi7d, _rsi25d, _bb24h, _bb7d, _bb25d);

    // Update DB
    result.forEach(async (elm, i) => {
      await mg.update(mongo.db, mongo.collection, { _id: elm._id }, elm);
      console.log(elm);
    });

  } catch(e) { console.log(e); }
}


mainTask();
