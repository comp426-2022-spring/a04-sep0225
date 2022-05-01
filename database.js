"use strict";

const database = require('better-sqlite3')

const db = new database('log.db')

const stmt = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' and name = 'accesslog'`)

let row = stmt.get()

if (row === undefined) {
    console.log('Your log database is missing. Creating log database now.')
    const sqlInit = `CREATE TABLE accesslog ( 
                        id INTEGER PRIMARY KEY, 
                        remoteaddr VARCHAR, 
                        remoteuser VARCHAR, 
                        time VARCHAR,
                        method VARCHAR,
                        url TEXT,
                        protocol TEXT,
                        httpversion TEXT,
                        status TEXT,
                        referrer TEXT,
                        useragent TEXT );`
    db.exec(sqlInit)
} else {
    console.log("Log database already exists.")
}

module.exports = db