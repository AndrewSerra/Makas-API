const express = require('express');
router = express.Router();

const MongoClient = require('mongodb').MongoClient;

const schemaValidator = require('../schema/schema_validator');
const appointmentsModel = require("../schema/appointments");
schemaValidator.addSchema(appointmentsModel,'appointments');



//create appointment
router.post("/", schemaValidator.validateSchema('appointments'), (req,res) => {
    res.send(req.body).status(201).end();
    MongoClient.connect(process.env.MONGO_URI, function (err, client)  {
        if(err) throw err;

        client.db('dev_test').collection('appointments').insertOne(req.body);
        console.log('Data inserted.');


    });
});


module.exports = router;
