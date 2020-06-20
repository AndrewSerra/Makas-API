const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
const checkers = require('../utils/entry_checker');
const bcrypt = require('bcrypt');
const express = require('express');
const status_codes = require('../utils/status_codes');
const dotenv = require('dotenv').config();
const options = require('../utils/dbConnectionOptions');

router = express.Router();

// TODO:
// 1- Write tests for endpoints for POST /

// Create a business for the first time
router.post('/', function(req, res, next) {

    // Add the date and hashed password to the object
    const business = { ...req.body, created: new Date() }
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
        MongoClient.connect(process.env.MONGO_URI, options, function(error, client) {
            if(error) {
                res.status(status_codes.ERROR).send(error);
                next();
            }

            // Connect to database, get collection
            const db = client.db('dev_test');
            const collection = db.collection("business");

            // Check if the business exists
            const query = {
                name: business.name,
                geo_loc: {
                    lat: business.geo_loc.lat,
                    lon: business.geo_loc.lon,
                },
            }
            collection.findOne(query, '_id', function(err, doc) {  // Only returns the id as doc object
                if(err) throw err;
                console.log(doc)
                if(doc) {
                    res.status(status_codes.CONFLICT).send("Business already exists");
                    client.close();
                    next();
                }

                // Insert the document to the database
                collection.insertOne(business, function(error, response) {
                    if(error) {
                        res.status(status_codes.ERROR).send(error);
                    }
                    // Success condition everything ok
                    if(response.result.ok || response !== null) {
                        res.sendStatus(status_codes.SUCCESS);
                    }
                    client.close();
                })
            })
        })
    }
    else {
        res.status(status_codes.BAD_REQUEST).send(check_result.response);
    }
})

// Get specific business document
router.get('/:businessId', function(req, res) {
    MongoClient.connect(process.env.MONGO_URI, options, function(error, client) {
        if(error) {
            res.status(status_codes.ERROR).send(error);
            next();
        }

        // Connect to database, get collection
        const db = client.db('dev_test');
        const collection = db.collection("business");

        // Excluding fields
        const options = {
            projection: {
                password: 0,
                created: 0,
            }
        }
        collection.findOne({ _id: ObjectId(req.params.businessId) }, options, function(error, doc) {
            if(error) {
                res.status(status_codes.ERROR).send(error);
                client.close();
                next();
            }
            if(doc) {
                res.status(status_codes.SUCCESS).send(doc);
            }
        })
    })
})

module.exports = router;
