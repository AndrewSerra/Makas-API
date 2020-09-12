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
        favorites: [],
        verificationCode: [],
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
                            const revisedUser = response.ops[0];
                            delete revisedUser.password;
                            delete revisedUser.created;
                            delete revisedUser.last_login;
                            // Success condition everything ok
                            if(response.result.ok || response !== null) {
                                res.status(status_codes.SUCCESS).send(revisedUser);
                            }
                        })
                        .catch(error => {
                            res.status(status_codes.ERROR).send(error);
                        })
                        .finally(_ => client.close());
                    }
                });
            })
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
                    let revisedUser = response.value;
                    delete revisedUser.password;
                    delete revisedUser.created;
                    delete revisedUser.last_login;
                    res.status(status_codes.SUCCESS).send(revisedUser);
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

// Verify user contact
router.post('/verify', async (req, res, next) => {
    const client = await MongoClient.connect(process.env.MONGO_URI, options);
    const db = client.db(process.env.DB_NAME);
    const collectionUsers = db.collection(collection_names.USER);

    //check if the user exists
    const userId = req.body._id;
    const user = await collectionUsers.findOne({ _id: ObjectId(userId)})

    const verificationCode = req.body.verificationCode;

    let count = 0;
    for (let i=0; i<verificationCode.length; i++){
        if (verificationCode[i] === user.verificationCode[i]){
            count++;
        }
    }
    if (count === user.verificationCode.length){
        console.log("True")
        res.send("OK")
    }else{
        console.log("Error")
        res.send("Error")
    }


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

// Change name of a user
router.put("/name/uid/:userId", async (req, res) => {
    const client = await MongoClient.connect(process.env.MONGO_URI, options);
    const db = client.db(process.env.DB_NAME);
    const collection = db.collection(collection_names.USER);

    const query = {
        _id: ObjectId(req.params.userId),
    };

    //get user
    const user = await collection.findOne({ _id: ObjectId(req.params.userId) }, query);
    const new_user = {
        $set : {
            name: req.body.new_name,
            password: user.password,
            contact: user.contact,
            favorites: user.favorites
        }
    };
    collection.findOneAndUpdate(query, new_user)
        .then(response => res.status(status_codes.SUCCESS).send(response))
        .catch(error => res.status(status_codes.ERROR).send(error.message))
        .finally(_ => client.close());

});


// Change phone number of a user
router.put("/phone/uid/:userId", async (req, res) => {
    const client = await MongoClient.connect(process.env.MONGO_URI, options);
    const db = client.db(process.env.DB_NAME);
    const collection = db.collection(collection_names.USER);

    const query = {
        _id: ObjectId(req.params.userId),
    };

    //get user
    const user = await collection.findOne({ _id: ObjectId(req.params.userId) }, query);
    const phone_number = {
        $or: [
            {"contact.phone.number": req.body.new_number},
        ]
    }
    const number_exists = await collection.countDocuments(phone_number);
    // if number_exists === 0 means the new number is not owned by some other user
    if (number_exists === 0){
        // get the new user query
        const new_contact = {
            email: user.contact.email,
            phone:{
                number: req.body.new_number,
                verified: user.contact.phone.verified
            }
        }
        const new_user = {
            $set : {
                name: user.name,
                password: user.password,
                contact: new_contact,
                favorites: user.favorites
            }
        };
        // find and update
        collection.findOneAndUpdate(query, new_user)
            .then(response => res.status(status_codes.SUCCESS).send(response))
            .catch(error => res.status(status_codes.ERROR).send(error.message))
            .finally(_ => client.close());
    }else{
        res.status(status_codes.CONFLICT).send("Number already exists");
    }
});


// Change email address of a user
router.put("/email/uid/:userId", async (req, res) => {
    const client = await MongoClient.connect(process.env.MONGO_URI, options);
    const db = client.db(process.env.DB_NAME);
    const collection = db.collection(collection_names.USER);

    const query = {
        _id: ObjectId(req.params.userId),
    };

    //get user
    const user = await collection.findOne({ _id: ObjectId(req.params.userId) }, query);
    const email_address = {
        $or: [
            {"contact.email.address": req.body.new_address},
        ]
    }
    const address_exists = await collection.countDocuments(email_address);
    // if number_exists === 0 means the new number is not owned by some other user
    if (address_exists  === 0){
        // get the new user query
        const new_contact = {
            email:{
                address: req.body.new_address,
                verified: user.contact.email.verified
            },
            phone: user.contact.phone
        }
        const new_user = {
            $set : {
                name: user.name,
                password: user.password,
                contact: new_contact,
                favorites: user.favorites
            }
        };
        // find and update
        collection.findOneAndUpdate(query, new_user)
            .then(response => res.status(status_codes.SUCCESS).send(response))
            .catch(error => res.status(status_codes.ERROR).send(error.message))
            .finally(_ => client.close());
    }else{
        res.status(status_codes.CONFLICT).send("Address already exists");
    }
});

// Change password of a user
router.put("/password/uid/:userId", async (req, res) => {
    const client = await MongoClient.connect(process.env.MONGO_URI, options);
    const db = client.db(process.env.DB_NAME);
    const collection = db.collection(collection_names.USER);

    const query = {
        _id: ObjectId(req.params.userId),
    };

    //get user
    const user = await collection.findOne({ _id: ObjectId(req.params.userId) }, query);
    const password_authenticate = await bcrypt.compare(req.body.old_password, user.password);
    // if old password matches encrypt the new password
    if (password_authenticate){
        // hash the password entered
        bcrypt.genSalt(Number(process.env.SALT_ROUNDS), (err, salt) => {
            if(err)  throw error;
            bcrypt.hash(req.body.new_password, salt, (err, hash) => {
                if(err) throw err;

                const new_user = {
                    $set : {
                        name: user.name,
                        password: hash,
                        contact: user.contact,
                        favorites: user.favorites
                    }
                };
                // find and update
                collection.findOneAndUpdate(query, new_user)
                    .then(response => res.status(status_codes.SUCCESS).send(response))
                    .catch(error => res.status(status_codes.ERROR).send(error.message))
                    .finally(_ => client.close());

            })
        });
    }else{
        res.status(status_codes.ERROR).send("Password Invalid")
    }

});


module.exports = router;
