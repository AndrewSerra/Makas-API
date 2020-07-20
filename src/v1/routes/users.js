const express = require('express');
const dotenv = require('dotenv').config();
const bcrypt = require('bcrypt');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
const status_codes = require('../utils/status_codes');
const checkers = require('../utils/entry_checker');
const options = require('../utils/dbConnectionOptions');
const collection_names = require('../settings/collection_names');

router = express.Router();

// Register
router.post("/", async (req, res) => {
    // Add created date
    const date = new Date();
    const body = req.body;
    const user = { 
        name: body.name,
        password: body.password,
        contact: {
            email: {
                address: body.email || "",
                verified: false,
            },
            phone: {
                number: body.phone || "",
                verified: false,
            },
        },
        appointments: [],
        favorites: [],
        created: date,
        last_login: date,
    };

    const check_result = checkers.user_entry_checker(user);

    const query = {
        $or: [
            {"contact.email.address": user.contact.email.address},
            {"contact.phone.number": user.contact.phone.number},
        ]
    };

    if(check_result.valid) {
        const client = await MongoClient.connect(process.env.MONGO_URI, options);

        // Connect to database, get collection
        const db = client.db(process.env.DB_NAME);
        const collection = db.collection(collection_names.USER);

        // hash the password entered
        bcrypt.genSalt(Number(process.env.SALT_ROUNDS), (err, salt) => {
            if(err)  throw error;
            bcrypt.hash(req.body.password, salt, (err, hash) => {
                if(err) throw err;
                user.password = hash;
            })
        });

        collection.countDocuments(query)
        .then((count) => {
            // If the user exists
            if (count > 0){
                //either email or phone should be new to create a new user
                res.status(status_codes.CONFLICT).send("User already exists");
            } 
            else{
                // If the user does not have valid email
                // If the user does not have valid tel
                collection.insertOne(user)
                .then(response => {
                    // Success condition everything ok
                    if(response.result.ok || response !== null) {
                        res.status(status_codes.SUCCESS).send(response.insertedId);
                    }
                })
                .catch(error => {
                    res.status(status_codes.ERROR).send(error);
                }) 
                .finally(_ => client.close());
            }
         });
    }
    else {
        res.status(status_codes.BAD_REQUEST).send(check_result.reason);
    }
});

// Authentication
router.post('/login', async (req, res, next) => {
    const client = await MongoClient.connect(process.env.MONGO_URI, options);
    // Connect to database, get collection
    const db = client.db(process.env.DB_NAME);
    const collection = db.collection(collection_names.USER);
    // Deconstruct the data from body
    const { contact, password } = req.body;
    
    if(contact.trim() === "" || password.trim() === "" ||
       contact === null       || password === null ||
       contact === undefined  || password === undefined) {
        res.status(status_codes.BAD_REQUEST).send('Values sent are not valid.');
        next();
    }

    const query = {
        $or: [
            {"contact.email.address": contact},
            {"contact.phone.number": contact},
        ],
    }
    // To see if active user
    const date = new Date();

    collection.findOneAndUpdate(query, { $set: { last_login: date } })
    .then(async (response) => {
        if(response.value) {
            const user = response.value;
            bcrypt.compare(password, user.password, function(error, result) {
                if(error) res.status(status_codes.ERROR).send(error);
                // Check the result
                if(result) {
                    res.status(status_codes.SUCCESS).send(response.value._id);
                }
                else {
                    res.status(status_codes.BAD_REQUEST).send("Password invalid");
                }
            })
        }
        else res.status(status_codes.BAD_REQUEST).send("User does not exist.");
    })
    .catch(error => res.status(status_codes.ERROR).send(error))
    .finally(_ => client.close())
})

// Get all user data for admin page
router.get("/", async (req, res) => {

    const client = await MongoClient.connect(process.env.MONGO_URI, options);
    // Connect to database, get collection
    const db = client.db(process.env.DB_NAME);
    const collection = db.collection(collection_names.USER);
    // Create a date object and go back two months back to check 
    // whether a user is active on the platform
    const date = new Date();
    date.setMonth(date.getMonth() - 2);

    collection.aggregate([
        {
            $facet: {
                "users": [
                    {
                        $project: {
                            _id: 0,
                            name: "$name",
                            date: "$created",
                        }
                    },
                    { $count: "count" }
                ],
                "active_users": [
                    { $match: {  "last_login": { $gte: date } } },
                    { $count: "count" }
                ]
            }
        }
    ]).toArray()
    .then(response => {
        if(response) res.status(status_codes.SUCCESS).send(response)
        else         res.status(status_codes.BAD_REQUEST).send("Business ID does not exist.")
    })
    .catch(error => res.status(status_codes.ERROR).send(error))
    .finally(_ => client.close());
});

// Get specific user
router.get("/uid/:userId", async (req, res) => {

    const client = await MongoClient.connect(process.env.MONGO_URI, options);
    // Connect to database, get collection
    const db = client.db(process.env.DB_NAME);
    const collection = db.collection(collection_names.USER);

    const query_options = {
        projection: {
            password: 0,
            created: 0,
            last_login: 0,
        }
    }

    collection.findOne({ _id: ObjectId(req.params.userId) }, query_options)
    .then(response => {
        if(response) res.status(status_codes.SUCCESS).send(response);
        else         res.status(status_codes.BAD_REQUEST).send("User ID does not exist.");
    })
    .catch(error => res.status(status_codes.ERROR).send(error))
    .finally(_ => client.close());
});

// Delete user account
router.delete("/uid/:userId", async (req, res) => {
    const client = await MongoClient.connect(process.env.MONGO_URI, options);
    // Connect to database, get collection
    const db = client.db(process.env.DB_NAME);
    const collection = db.collection(collection_names.USER);

    if(req.params.userId === undefined || req.params.userId === null || req.params.userId === "") {
        res.status(status_codes.BAD_REQUEST).send("User ID not sent.");
        next();
    }
    
    collection.findOneAndDelete({ _id: ObjectId(req.params.userId) })
    .then(response => {
        if(response.value) {
            res.status(status_codes.SUCCESS).send(response);
            next();
        }
        else res.status(status_codes.BAD_REQUEST).send("User ID does not exist.");
    })
    .catch(error => res.status(status_codes.ERROR).send(error))
    .finally(_ => client.close());
});

// Add business to favorites: Add businessID from user.favorites
router.put("/uid/:userId/favorites/add/:businessId", async (req, res) => {
    const client = await MongoClient.connect(process.env.MONGO_URI, options);
    const db = client.db(process.env.DB_NAME);
    const collection = db.collection(collection_names.USER);

    const query = { 
        _id: ObjectId(req.params.userId), 
        favorites: { $nin: [ObjectId(req.params.businessId)] }
    }
    const update = { $push: { favorites: ObjectId(req.params.businessId) } }
    collection.findOneAndUpdate(query, update)
    .then(response => res.status(status_codes.SUCCESS).send(response))
    .catch(error => res.status(status_codes.ERROR).send(error))
    .finally(_ => client.close())
});

// Remove business from favorites: Remove businessID from user.favorites
router.put("/uid/:userId/favorites/remove/:businessId", async (req, res) => {
    const client = await MongoClient.connect(process.env.MONGO_URI, options);
    const db = client.db(process.env.DB_NAME);
    const collection = db.collection(collection_names.USER);

    const query = { 
        _id: ObjectId(req.params.userId), 
        favorites: { $eq: ObjectId(req.params.businessId) }
    }
    const update = { $pull: { favorites: ObjectId(req.params.businessId) } }
    collection.findOneAndUpdate(query, update)
    .then(response => res.status(status_codes.SUCCESS).send(response))
    .catch(error => res.status(status_codes.ERROR).send(error))
    .finally(_ => client.close())
});

module.exports = router;
