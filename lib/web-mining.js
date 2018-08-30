/**
 * Web mining functions
 */
 
/* read modules */
const client = require('cheerio-httpcli');

module.exports = {

    getHtml : function(url) {
        return new Promise((resolve, reject) => {
            client.fetch(url, function (err, $, res, body) {
                if (err) reject(err);
                else resolve(body);
            });
        });
    },

    getHtmlQuery : function(url, q) {
        return new Promise((resolve, reject) => {
            client.fetch(url, q, function (err, $, res, body) {
                if (err) reject(err);
                else resolve(body);
            });
        });
    },
}

