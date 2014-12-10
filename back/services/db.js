/* Connect to Mongo DB */
var db = require('promised-mongo')(process.env.MONGODB || 'patremoniumbeheer');

exports.db = function () {
  return db;
};
