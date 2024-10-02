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

app.use(express.json());
app.use(express.static(pubRoot));

app.get('/get', (req, res) => {
    const db = new sqlite3.Database('usa_license_plates.db');
    const tblName = "plates";
    db.all(`SELECT rowid AS id, state, code, description, timestamp FROM ${tblName}`, (err, rows) => {
        let result = {};
        if (rows[0]) {
            result.result = rows;
            result.status = "ok";
            result.ok = true;
        } else {
            result.error = "Null Data.";
            result.status = "error";
            result.ok = false;
        }

        db.close();
        console.log(`Get data from table: ${tblName}`);
        res.json(result);
    });
});

app.post('/add', (req, res) => {
    let data = req.body;
    const db = new sqlite3.Database('usa_license_plates.db');
    const tblName = "plates";

    db.serialize(() => {
        //db.run("CREATE TABLE plates (state TEXT, code TEXT, description TEXT, timestamp INT)");
    
        const insertData = db.prepare(`INSERT INTO ${tblName} VALUES (?, ?, ?, CURRENT_TIMESTAMP)`);
        insertData.run(data.state, data.code, data.description);
        insertData.finalize();
        
    });

    let result = {
        result: "Data added.",
        status: "ok",
        ok: true
    };

    db.close();
    console.log(`Data added to table: ${tblName}`);
    res.json(result);
});

app.post('/clear', (req, res) => {
    const db = new sqlite3.Database('usa_license_plates.db');
    const tblName = req.body.table;
    const key = req.body.key;
    let result = {};

    if (key === "123321") {
        db.run(`DELETE FROM ${tblName}`);
        result.result = "Data cleared.";
        result.status = "ok";
        result.ok = true;
        console.log(`Clear data from table: ${tblName}`);
    } else {
        result.error = "Wrong key!!!";
        result.status = "error";
        result.ok = false;
        console.log(result.error);
    }
    db.close();
    res.json(result);
});

const server = app.listen(port, () => console.log(`License Plates App listening on port ${port}!`));

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
