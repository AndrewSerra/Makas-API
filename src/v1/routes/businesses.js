const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
const checkers = require('../utils/entry_checker');
const bcrypt = require('bcrypt');
const express = require('express');
const status_codes = require('../utils/status_codes');
const dotenv = require('dotenv').config();
const options = require('../utils/dbConnectionOptions');
const check_type = require('../utils/type_checker');
const { Double } = require('mongodb');
const col_names = require('../settings/collection_names');

router = express.Router();

// TODO:
// 1- Write tests for endpoints for POST /

// Create a business for the first time
router.post('/', async function(req, res, next) {

    const body = req.body;
    // Add the date and hashed password to the object
    // Correct the location property format
    const business = { 
        ...body, 
        location: {
            type: "Point",
            coordinates: req.body.location,
        },
        description: body.description ? body.description : "",
        image_paths: [],
        ratings: [],
        created: new Date() 
    }
    // Check the values sent
    const check_result = checkers.business_entry_checker(business);
    
    // Hash the password entered
    bcrypt.genSalt(Number(process.env.SALT_ROUNDS), (err, salt) => {
        if(err)  throw error;
        bcrypt.hash(req.body.password, salt, (err, hash) => {
            if(err) throw err;
            business.password = hash;
        })
    })
    
    // Only connects if the check is valid
    if(check_result.valid) {
        const client = await MongoClient.connect(process.env.MONGO_URI, options)

        // Connect to database, get collection
        const db = client.db(process.env.DB_NAME);
        const collection = db.collection(col_names.BUSINESS);

        // Check if the business exists
        const query = {
            "contact.email": business.contact.email,
        }
        
        const doc = await collection.findOne(query);  // Only returns the id as doc object
        
        if(doc) {
            res.status(status_codes.CONFLICT).send("Business already exists");
            client.close();
            next();
        }
        else {
            // Insert the document to the database
            collection.insertOne(business) 
            .then(response => {
                // Success condition everything ok
                if(response.result.ok || response !== null) {
                    res.sendStatus(status_codes.SUCCESS);
                }
            })
            .catch(error => {
                res.status(status_codes.ERROR).send(error);
            }) 
            .finally(_ => client.close());
        }
    }
    else {
        res.status(status_codes.BAD_REQUEST).send(check_result.reason);
    }
})

// TODO: 
// Get businesses with query parameters from the business search page 
// Structure:
// ?range=0.5&name=ekm&location=meksika+sokagi&date[day]=23&date[month]=01&date[year]=2020&time[hr]=10&time[min]=30&numDocs=10&offset=0
router.get('/', async function(req, res, next) {

    // Scream at the developer who doesn't send proper data with their types
    const scream = (error) => { res.status(status_codes.ERROR).send(error) }

    const query_init = req.query;
    const range = Number(query_init.range) ? Number(query_init.range) : 10;           // Defaults to 10km
    const offset = Number(query_init.offset) ? Number(query_init.offset) : 0;         // Defaults to offset of 0
    const num_docs =  Number(query_init.num_docs) ? Number(query_init.num_docs) : 10; // Defaults the limit to 10 docs

    // Clean the  query object
    for(let[key, value] of Object.entries(query_init)) {
        if(value === undefined) {
            delete query_init[key];
        }
        else if(key === "offset" || key === "numDocs" || key == "range") {
            delete query_init[key];
        }
    }

    // Correct location format 
    let correct_format_loc = query_init.location.split(",");
    correct_format_loc = correct_format_loc.map(loc => Double(loc));

    const client = await MongoClient.connect(process.env.MONGO_URI, options);

    if(!client) {
        res.status(status_codes.ERROR).send(error);
        next();
    }
    // Connect to database, get collection
    const db = client.db(process.env.DB_NAME);
    const collection = db.collection(col_names.BUSINESS);

    // Excluding fields
    const query_options = {
        projection: {
            password: 0,
            created: 0,
        },
        limit: num_docs,
        skip: offset,
    }
    let query = {
        name: {
            $regex: new RegExp(query_init.name ? query_init.name : ""),
            $options: 'i'
        },
        // address: { 
        //     street: {
        //         $regex: new RegExp(query_init.location_name ? query_init.location_name : ""),
        //         $options: 'i'
        //     }
        // },
        location: {
            $nearSphere: {
                $geometry: {
                    type: "Point",
                    coordinates: correct_format_loc,
                },
                $maxDistance: range * 1000  // 1000 meters
            }
        }
    }

    const docs = await collection.find(query, query_options).toArray() 
    
    res.status(status_codes.SUCCESS).send({count: docs.length, docs: docs});
    client.close();
})

// Get specific business document
router.get('/bid/:businessId', async function(req, res) {

    const client = await MongoClient.connect(process.env.MONGO_URI, options);

    // Connect to database, get collection
    const db = client.db(process.env.DB_NAME);
    const collection = db.collection(col_names.BUSINESS);

    // Excluding fields
    const query_options = {
        projection: {
            password: 0,
            created: 0,
        }
    }

    collection.findOne({ _id: ObjectId(req.params.businessId) }, query_options)
    .then(response => {
        if(response) res.status(status_codes.SUCCESS).send(response)
        else         res.status(status_codes.BAD_REQUEST).send("Business ID does not exist.")
    })
    .catch(error => res.status(status_codes.ERROR).send(error))
    .finally(_ => client.close());
})

// Delete specific business document
router.delete('/bid/:businessId', async function(req, res) {

    const client = await MongoClient.connect(process.env.MONGO_URI, options);

    // Connect to database, get collection
    const db = client.db(process.env.DB_NAME);
    const collection = db.collection(col_names.BUSINESS);

    collection.findOneAndDelete({ _id: ObjectId(req.params.businessId) })
    .then(response => {
        if(response.value) res.status(status_codes.SUCCESS).send(response)
        else               res.status(status_codes.BAD_REQUEST).send("Business ID does not exist.")
    })
    .catch(error => res.status(status_codes.ERROR).send(error))
    .finally(_ => client.close());
})

module.exports = router;