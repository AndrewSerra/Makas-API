const express = require('express');
router = express.Router();

const MongoClient = require('mongodb').MongoClient;

const schemaValidator = require('../schema/schema_validator');
const userModel = require("../schema/user");
schemaValidator.addSchema(userModel,'user');



//create user
router.post("/", schemaValidator.validateSchema('user'), (req,res) => {
   res.send(req.body).status(201).end();
   MongoClient.connect(process.env.MONGO_URI, function (err, client)  {
        if(err) throw err;

       client.db('dev_test').collection('user').insertOne(req.body);
       console.log('data inserted');
    });
});

//get users
//request with body will find users that suits the data in body
// request without body will find all users
router.get("/", (req,res) => {
    //res.send(req.body).status(201).end();
    MongoClient.connect(process.env.MONGO_URI, function (err, client)  {
        if(err) throw err;

        client.db('dev_test').collection('user').find(req.body).toArray(function(err, items) {
            if(err) throw err;
            //console.log(items);
            res.send(items).status(201).end();
        });

    });
});


module.exports = router;
