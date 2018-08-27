/**
 * Mnogodb util functions
 */
 
/* read modules */
const MongoClient = require('mongodb').MongoClient;
const URL = 'mongodb://localhost:27017';

function connectMg(dbName, collectionName) {
    return new Promise((resolve, reject) => {
        MongoClient.connect(URL, { useNewUrlParser: true }, function(err, client) {
            if (err) reject(err);

            const db = client.db(dbName);
            const collection = db.collection(collectionName);
            resolve({col: collection, client: client});
        });
    });
}

module.exports = {

    insert : async function(dbName, collectionName, docs) {
        const mg = await connectMg(dbName, collectionName);
        return new Promise((resolve, reject) => {
            mg.col.insertMany(docs, function(err, result) {
                if (err) reject(err);
                else resolve(result);
                mg.client.close();
            });
        });
    },

    update : async function(dbName, collectionName, key, data) {
        const mg = await connectMg(dbName, collectionName);
        return new Promise((resolve, reject) => {
            mg.col.updateOne(key, {$set: data}, function(err, result) {
                if (err) reject(err);
                else resolve(result);
                mg.client.close();
            });
        });
    },

    remove : async function(dbName, collectionName, key) {
        const mg = await connectMg(dbName, collectionName);
        return new Promise((resolve, reject) => {
            mg.col.deleteOne(key, function(err, result) {
                if (err) reject(err);
                else resolve(result);
                mg.client.close();
            });
        });
    },

    findAll : async function(dbName, collectionName) {
        const mg = await connectMg(dbName, collectionName);
        return new Promise((resolve, reject) => {
            mg.col.find({}).toArray(function(err, docs) {
                if (err) reject(err);
                else resolve(docs);
                mg.client.close();
            });
        });
    },

    findBy : async function(dbName, collectionName, key) {
        const mg = await connectMg(dbName, collectionName);
        return new Promise((resolve, reject) => {
            mg.col.find(key).toArray(function(err, docs) {
                if (err) reject(err);
                else resolve(docs);
                mg.client.close();
            });
        });
    },

    findByOption : async function(dbName, collectionName, key, option) {
        const mg = await connectMg(dbName, collectionName);
        return new Promise((resolve, reject) => {
            mg.col.find(key, option).toArray(function(err, docs) {
                if (err) reject(err);
                else resolve(docs);
                mg.client.close();
            });
        });
    },

}

