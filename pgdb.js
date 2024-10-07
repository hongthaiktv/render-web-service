'use strict';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pubRoot = path.join(__dirname, "public");
const app = express();
const port = process.env.PORT || 3001;

// Environment variables: PGUSER, PGPASSWORD, PGHOST, PGPORT, PGDATABASE
const { Client } = pg;
const client = new Client({database: process.env.PGDATABASE || 'plates'});
await client.connect().catch(error => console.error(error));
await client.query(`CREATE TABLE IF NOT EXISTS usa (
    id smallserial PRIMARY KEY,
    state text,
    code text UNIQUE NOT NULL,
    description text,
    timestamp timestamptz
    );`)
.catch(error => console.error(error));

app.use(express.json());
app.use(express.static(pubRoot));

app.get('/admin', (req, res) => {
    let fileName = "admin.html";
    let options = {root: pubRoot};
    res.sendFile(fileName, options);
});

app.get('/get', async (req, res) => {
    let result = {};
    const query = {
        name: 'get', //for query caching to refresh
        text: 'SELECT * FROM usa;'
    };

    let qrResult = await client.query(query)
    .catch(error => {
        result.message = error.message;
        result.code = error.code;
        console.error(error);
    });
    if (qrResult && qrResult.rows && qrResult.rows.length) {
        result.result = qrResult.rows;
        console.log("Get data success.");
        res.json(result);
    } else res.status(500).json(result);
});

app.post('/add', async (req, res) => {
    let data = req.body;
    let result = {};
    const query = {
        text: `INSERT INTO usa VALUES (DEFAULT, $1, $2, $3, CURRENT_TIMESTAMP(0));`,
        values: [data.state, data.code, data.description]
    };

    let qrResult = await client.query(query)
    .catch(error => {
        result.message = error.message;
        result.code = error.code;
        console.error(error);
    });
    if (qrResult) {
        result.result = "Add data success.";
        console.log(result.result);
        res.json(result);
    } else res.status(500).json(result);
});

app.post('/clear', async (req, res) => {
    const key = req.body.key;
    let result = {};

    if (key === "123321") {
        const query = {
            text: `DELETE FROM usa;`
        };
    
        let qrResult = await client.query(query)
        .catch(error => {
            result.message = error.message;
            result.code = error.code;
            console.error(error);
        });
        if (qrResult) {
            result.result = "Data deleted success.";
            console.log(result.result);
            res.json(result);
        } else res.status(500).json(result);
    } else {
        result.message = "Wrong key!!!";
        console.error(result.message);
        res.status(500).json(result);
    }
});

app.all('*', (req, res) => {
    res.status(404).json({message: "Not Found!!!"});
});

const server = app.listen(port, () => console.log(`License Plates App listening on port ${port}!`));

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
