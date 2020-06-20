const express = require('express');
router = express.Router();

const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

const schemaValidator = require('../schema/schema_validator');
const userModel = require("../schema/user");
schemaValidator.addSchema(userModel,'user');

// Register: POST Create User

//create user
router.post("/", schemaValidator.validateSchema('user'), (req,res) => {

    // if the user does not have valid name or the request doesn't have required properties- via validateSchema

    MongoClient.connect(process.env.MONGO_URI, function (err, client)  {
        if(err) throw err;

        // if the user exists
        client.db('dev_test').collection('user').countDocuments({contact: {email: req.body.contact.email, phone: req.body.contact.phone }})
            .then((count) => {
               if (count > 0){
                   console.log("User exists");
                   res.send({
                       status: 'failed',
                       errors: "The user already exists"
                   });
               } else{
                   res.send(req.body);
                   // if the user does not have valid email
                   //console.log(req.body.contact.email);
                   // if the user does not have valid tel
                   //console.log(req.body.contact.phone);
                   client.db('dev_test').collection('user').insertOne(req.body);
                   console.log('Data inserted.');
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
        if (req.body._id === undefined){
            client.db('dev_test').collection('user').find().toArray(function(err, items) {
                if(err) throw err;
                //console.log(items);
                res.send(items).status(201).end();
            });
        }else{
            let x = ObjectID(req.body._id); // if get by id
            client.db('dev_test').collection('user').find({_id : x}).toArray(function(err, items) {
                if(err) throw err;
                //console.log(items);
                res.send(items).status(201).end();
            });
        }

    });
});

// Change user information: UPDATE user



// Deleting the account: DELETE user
// Add business to favorites: POST businessID to user.favorites
// Remove business from favorites: DELETE businessID from user.favorites
// Apply for appointment: POST appointment
// Cancel appointment: DELETE appointment
// See appointments for future: GET appointments
// See appointments for past: GET appointments







module.exports = router;
