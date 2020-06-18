const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const dotenv = require('dotenv');
const MongoClient = require('mongodb').MongoClient;

const app = express();
dotenv.config();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const PORT = 3000;

// It will connect to database test
// Later it will be changed to production when needed
MongoClient.connect(process.env.MONGO_URI, function (err, db)  {
    if(err) {
        console.log(err);
    }
    else {
        console.log('Connected to MongoDB.');
    }
})

app.listen(PORT, () => console.log(`Listening on port ${PORT}`)); 
