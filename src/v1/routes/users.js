const express = require('express');
router = express.Router();

const bcrypt = require('bcrypt');

const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

const status_codes = require('../utils/status_codes');

const schemaValidator = require('../schema/schema_validator');
const userModel = require("../schema/user");
schemaValidator.addSchema(userModel,'user');

// Register: POST Create User

//create user
router.post("/", schemaValidator.validateSchema('user'), (req,res) => {

    // if the user does not have valid name or the request doesn't have required properties- via validateSchema

    // Add created date
    const user = { ...req.body, created: new Date()};

    // hash the password entered
    bcrypt.genSalt(Number(process.env.SALT_ROUNDS), (err, salt) => {
        if(err)  throw error;
        bcrypt.hash(req.body.password, salt, (err, hash) => {
            if(err) throw err;
            user.password = hash;
        })
    });


    var query = {
        contact:{
            email: user.contact.email,
            phone: user.contact.phone
        }
    };

    MongoClient.connect(process.env.MONGO_URI, function (err, client)  {
        if(err) {
            res.status(status_codes.ERROR).send(error);
            next();
        }

        // if the user exists
        client.db('dev_test').collection('user').countDocuments(query)
            .then((count) => {
               if (count > 0){
                   //either email or phone should be new to create a new user
                   res.status(status_codes.CONFLICT).send("User already exists");
               } else{

                   // if the user does not have valid email
                   // if the user does not have valid tel

                   client.db('dev_test').collection('user').insertOne(user, function (insertError, response) {
                       if (insertError){
                           res.status(status_codes.ERROR).send(insertError)
                       }
                       if (response.result.ok || response !== null){
                           res.sendStatus(status_codes.SUCCESS);
                       }
                       client.close();
                   });

               }
            });
        // password check will happen in the front end

    });

});

// Log in: GET user and authenticate

//get users || user
//request with body will find users that suits the data in body
// request without body will find all users
router.get("/", (req,res) => {
    MongoClient.connect(process.env.MONGO_URI, function (err, client)  {
        if(err) throw err;
        if (req.body._id === undefined){ //if the request is not done with id
            client.db('dev_test').collection('user').find().toArray(function(err, items) {
                if (err){
                    res.status(status_codes.ERROR).send(err);
                }else{
                    res.send(items).status(201).end();
                }
                client.close();

            });
        }else{ // if the request is done with id
            let x = ObjectID(req.body._id); // if get by id
            client.db('dev_test').collection('user').find({_id : x}).toArray(function(err, items) {
                if (err){
                    res.status(status_codes.ERROR).send(err);
                }else{
                    res.send(items).status(201).end();
                }
                client.close();
            });
        }

    });
});


// TODO:
// Change user information: UPDATE user
// Deleting the account: DELETE user
// Add business to favorites: POST businessID to user.favorites
// Remove business from favorites: DELETE businessID from user.favorites
// Apply for appointment: POST appointment
// Cancel appointment: DELETE appointment
// See appointments for future: GET appointments
// See appointments for past: GET appointments







module.exports = router;
