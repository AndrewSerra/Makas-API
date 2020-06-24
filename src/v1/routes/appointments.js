const express = require('express');
router = express.Router();

const MongoClient = require('mongodb').MongoClient;

const schemaValidator = require('../schema/schema_validator');
const appointmentsModel = require("../schema/appointments");
schemaValidator.addSchema(appointmentsModel,'appointments');


router.post('/', function(req, res){
    res.send(req.body);
    MongoClient.connect(process.env.MONGO_URI, function (err, client)  {
        if(err) throw err;


        client.db('dev_test').collection('appointments').insertOne(req.body, function (error, result) {
            if(error) throw error;
            console.log(result);
        });
        console.log('Data inserted.');


    });
});


//create appointment
/*
router.post("/", schemaValidator.validateSchema('appointments'), (req,res) => {
    res.send(req.body).status(201).end();
    MongoClient.connect(process.env.MONGO_URI, function (err, client)  {
        if(err) throw err;

        client.db('dev_test').collection('appointments').insertOne(req.body);
        console.log('Data inserted.');


    });
});

*/

/*
* Example post operation that is tried
*
* {
    "user": "userID",
    "business": "businessID",
    "employee": "employeeID",
    "time" : {{$timestamp}},
    "service" : ["asmxa"],
    "status" : "pending"
} */

module.exports = router;
