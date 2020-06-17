const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const PORT = 3000;
const client = require('./dev/client');

app.get('/', async (req, res) => {
    client.connect()
    .then(res => console.log(res))
    .then(client => client.query("SELECT * FROM business"))
    .then((r) => {
        client.end();
        res.send({res: r.rows})
    })
    .catch((err) => res.send({err: err}))
})

app.listen(PORT, () => console.log(`Listening on port ${PORT}`)); 
