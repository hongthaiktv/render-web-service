'use strict';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite from 'sqlite3';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pubRoot = path.join(__dirname, "public");
const app = express();
const port = process.env.PORT || 3001;

const sqlite3 = sqlite.verbose();
// const db = new sqlite3.Database('plates.db');
// db.run("CREATE TABLE plates (state TEXT, code TEXT UNIQUE, description TEXT, timestamp INT)");
// db.close();

app.use(express.json());
app.use(express.static(pubRoot));

app.get('/admin', (req, res) => {
    let fileName = "admin.html";
    let options = {root: pubRoot};
    res.sendFile(fileName, options);
});

app.get('/get', (req, res) => {
    const db = new sqlite3.Database('plates.db');
    const tblName = "plates";
    db.all(`SELECT rowid AS id, state, code, description, timestamp FROM ${tblName}`, (err, rows) => {
        let result = {};
        if (rows[0]) {
            result.result = rows;
        } else {
            result.message = "Null Data.";
        }

        db.close();
        console.log(`Get data from table: ${tblName}`);
        res.json(result);
    });
});

app.post('/add', (req, res) => {
    let data = req.body;
    const db = new sqlite3.Database('plates.db');
    const tblName = "plates";

    db.serialize(() => {
        const insertData = db.prepare(`INSERT INTO ${tblName} VALUES (?, ?, ?, CURRENT_TIMESTAMP)`);
        insertData.run(data.state, data.code, data.description, function(error) {
            console.error(error);
        });
        insertData.finalize();
    });

    let result = {
        result: "Data added."
    };

    db.close();
    console.log(`Data added to table: ${tblName}`);
    res.json(result);
});

app.post('/clear', (req, res) => {
    const db = new sqlite3.Database('plates.db');
    const tblName = req.body.table;
    const key = req.body.key;
    let result = {};

    if (key === "123321") {
        db.run(`DELETE FROM ${tblName}`);
        result.result = "Data cleared.";
        console.log(`Clear data from table: ${tblName}`);
    } else {
        result.message = "Wrong key!!!";
        console.log(result.message);
    }
    db.close();
    res.json(result);
});

app.all('*', (req, res) => {
    res.status(404).json({message: "Not Found!!!"});
});

const server = app.listen(port, () => console.log(`License Plates App listening on port ${port}!`));

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
