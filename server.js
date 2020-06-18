const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const dotenv = require('dotenv');
const MongoClient = require('mongodb').MongoClient;
const check_setup = require('./src/v1/setup');

// Routers for versions of the API
const routerV1 = require('./src/v1/routes/main');

const app = express();
dotenv.config();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = 3000;

// It will connect to database test
// Later it will be changed to production when needed
MongoClient.connect(process.env.MONGO_URI, function (err, client)  {
    if(err) throw err;
    
    console.log('Connected to MongoDB...');

    check_setup(client.db('dev_test'));
})

// Add the routes to the app
app.use('/v1', routerV1);

app.listen(PORT, () => console.log(`Listening on port ${PORT}`)); 
