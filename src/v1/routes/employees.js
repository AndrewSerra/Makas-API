const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
const checkers = require('../utils/entry_checker');
const bcrypt = require('bcrypt');
const express = require('express');
const status_codes = require('../utils/status_codes');
const dotenv = require('dotenv').config();
const options = require('../utils/dbConnectionOptions');
const check_type = require('../utils/type_checker');
const col_names = require('../settings/collection_names');

router = express.Router();

router.post('/', async function(req, res, next) {

    const body = req.body;

    let employee = {
        name: body.name,
        business: ObjectId(body.business_id),
        appointments: [],
        description: body.description || "",
        rating: [],
        image_path: "",
        services: [],
        shifts: []
    }
    
    const check_result = checkers.employee_entry_checker(employee);
    
    // Only connects if the check is valid
    if(check_result.valid) {
        const client = await MongoClient.connect(process.env.MONGO_URI, options)

        // Connect to database, get collection
        const db = client.db(process.env.DB_NAME);
        const collection = db.collection(col_names.EMPLOYEE);

        // Check if the employee exists
        const query = {
            business: employee.business,
            name: employee.name
        }
        const doc_count = await collection.countDocuments(query); 
        console.log(doc_count)
        if(doc_count) {
            res.status(status_codes.CONFLICT).send("Employee already exists");
            client.close();
            next();
        }
        else {
            // Insert the document to the database
            collection.insertOne(employee) 
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
router.get('/e/:employeeId', async function(req, res) {

    const client = await MongoClient.connect(process.env.MONGO_URI, options);

    // Connect to database, get collection
    const db = client.db(process.env.DB_NAME);
    const collection = db.collection(col_names.EMPLOYEE);

    // Excluding fields
    const query_options = {
        projection: {
            password: 0,
            created: 0,
        }
    }

    collection.findOne({ _id: ObjectId(req.params.employeeId) }, query_options)
    .then(response => {
        if(response) res.status(status_codes.SUCCESS).send(response);
        else         res.status(status_codes.BAD_REQUEST).send("Employee ID does not exist.");
    })
    .catch(error => res.status(status_codes.ERROR).send(error))
    .finally(_ => client.close());
})

// Delete specific business document
router.delete('/e/:employeeId', async function(req, res) {

    const client = await MongoClient.connect(process.env.MONGO_URI, options);

    // Connect to database, get collection
    const db = client.db(process.env.DB_NAME);
    const collection = db.collection(col_names.EMPLOYEE);

    collection.findOneAndDelete({ _id: ObjectId(req.params.employeeId) })
    .then(response => {
        if(response.value) res.status(status_codes.SUCCESS).send(response);
        else               res.status(status_codes.BAD_REQUEST).send("User ID does not exist.");
    })
    .catch(error => res.status(status_codes.ERROR).send(error))
    .finally(_ => client.close());
})

module.exports = router;