const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
const checkers = require('../utils/entry_checker');
const bcrypt = require('bcrypt'); // This is here just in case we want to hash something
const express = require('express');
const status_codes = require('../utils/status_codes');
const dotenv = require('dotenv').config();
const options = require('../utils/dbConnectionOptions');
const check_type = require('../utils/type_checker');
const col_names = require('../settings/collection_names');

router = express.Router();

router.post('/', async function(req, res, next) {

    const body = req.body;

    let service = {
        name: body.name,
        business: ObjectId(body.business),
        price: Number(body.price),
        category: body.category,
        description: body.description || "",
        rating: 0,  // Default to 0
    }
    
    const check_result = checkers.service_entry_checker(service);

    // Only connects if the check is valid
    if(check_result.valid) {
        const client = await MongoClient.connect(process.env.MONGO_URI, options)

        // Connect to database, get collection
        const db = client.db(process.env.DB_NAME);
        const collection = db.collection(col_names.SERVICE);

        // Check if the employee exists
        const query = {
            business: service.business,
            name: service.name,
            category: service.category,
        }
        const doc_count = await collection.countDocuments(query); 
    
        if(doc_count) {
            res.status(status_codes.CONFLICT).send("Service already exists");
            client.close();
            next();
        }
        else {
            // Insert the document to the database
            collection.insertOne(service) 
            .then(response => {
                // Success condition everything ok
                if(response.result.ok || response !== null) {
                    res.sendStatus(status_codes.SUCCESS);
                }
                else {
                    res.status(status_codes.BAD_REQUEST).send(response);
                }
            })
            .catch(error => {
                res.status(status_codes.ERROR).send(error.message);
            }) 
            .finally(_ => client.close());
        }
    }
    else {
        res.status(status_codes.BAD_REQUEST).send(check_result.reason);
    }
})

// Get specific business document
router.get('/sid/:serviceId', async function(req, res) {

    const client = await MongoClient.connect(process.env.MONGO_URI, options);

    // Connect to database, get collection
    const db = client.db(process.env.DB_NAME);
    const collection = db.collection(col_names.SERVICE);

    collection.findOne({ _id: ObjectId(req.params.serviceId) })
    .then(response => {
        if(response) res.status(status_codes.SUCCESS).send(response);
        else         res.status(status_codes.BAD_REQUEST).send("Service ID does not exist.");
    })
    .catch(error => res.status(status_codes.ERROR).send(error))
    .finally(_ => client.close());
})

// Delete specific business document
router.delete('/sid/:serviceId', async function(req, res) {

    const client = await MongoClient.connect(process.env.MONGO_URI, options);

    // Connect to database, get collection
    const db = client.db(process.env.DB_NAME);
    const collection = db.collection(col_names.SERVICE);

    collection.findOneAndDelete({ _id: ObjectId(req.params.serviceId) })
    .then(response => {
        if(response.value) res.status(status_codes.SUCCESS).send(response);
        else               res.status(status_codes.BAD_REQUEST).send("Service ID does not exist.");
    })
    .catch(error => res.status(status_codes.ERROR).send(error))
    .finally(_ => client.close());
})

module.exports = router;