var sqlite3 = require('sqlite3').verbose();
var config = require('../config');

var db = new sqlite3.Database(config.dbPath);
db.run("PRAGMA foreign_keys = ON");
// See
// https://github.com/developmentseed/node-sqlite3/issues/9#issuecomment-1977744.
// This helps avoid concurrency issues.
db.run("PRAGMA journal_mode = WAL");
exports.db = db;

/* TODO: call dbCleanup on SIG{INT,KILL,TERM}. */
function dbCleanup() {
  console.log("Closing database connection.");
  db.close();
}

exports.Question = require('./question').Question;
exports.Session = require('./session').Session;
exports.Stats = require('./stats').Stats;
