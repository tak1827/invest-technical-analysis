/**
 * Util functions
 */
 
/* read modules */
const fs = require('fs');

module.exports = {

    writeFile : function(file, data) {
        return new Promise((resolve, reject) => {
            fs.writeFile(file, data, 'utf8', function(err){
                if (err) { reject(err); }
                else { resolve(data); }
            });
        });
    },

    appendFile : function(file, data) {
        return new Promise((resolve, reject) => {
             fs.appendFile(file, data, 'utf8', function(err){
                if (err) { reject(err); }
                else { resolve(data); }
             });
         });
     },

    readFile : function(file) {
        return new Promise((resolve, reject) => {
            fs.readFile(file, 'utf8', function(err, data){
                if (err) { reject(err); }
                else { resolve(data); }
            });
        });
    },

    sleep : function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

}
