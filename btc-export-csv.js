/**
 * Export btc data form DB as csv format
 */
 
/* Read modules */
var mg = require(__dirname+'/lib/mongo-util.js');
var ut = require(__dirname+'/lib/util.js');

const mongo = { db: 'coin', collection: 'btc' };
const csvfile = __dirname+'/output/btc.csv';
let btcDocs = [];
const interval = 24;

async function mainTask() { 
  try {

    // Get all btc docs
    btcDocs = await mg.findByOption(mongo.db, mongo.collection ,{} , {'sort':'t'});

    let _output = "";

    btcDocs.forEach((elm, i) => {

      // Skip interval data
      if (i % interval != 0) return;

      // Header
      if (i === 0) {
        Object.keys(elm).forEach(key => { _output += key + ","; });
        _output += '\n';
      }

      Object.keys(elm).forEach(key => { _output += elm[key] + ","; });
      _output += '\n';

    });

    await ut.writeFile(csvfile, _output);

  } catch(e) { console.log(e); }
}


mainTask();
