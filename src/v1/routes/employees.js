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
const multer = require('multer')
const shortid = require('shortid');
const path = require('path');
const fs = require('fs');
const url = require('url');

router = express.Router();
const employeeStorage = multer.diskStorage({ 
    destination: path.join(__dirname, '../../../uploads/employees/'),
    filename: function (req, file, cb){
        cb(null, `${shortid.generate() + path.parse(file.originalname).ext}`);
    }
});
const upload = multer({
    storage: employeeStorage,
 });
router.post('/', upload.single('imageFile'), async function(req, res, next) {

    const body = req.body;
    
    let employee = {
        name: body.name,
        business: ObjectId(body.business_id),
        appointments: [],
        description: body.description || "",
        rating: [],
        image_path: `${req.protocol}://${req.hostname}:5000/${req.file.path.replace(path.join(__dirname, '../../../uploads'), 'v1/static')}`,
        services: [],
        shifts: req.body.shifts
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
                    res.status(status_codes.SUCCESS).send(response.ops[0]);
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
router.get('/eid/:employeeId', async function(req, res) {

    const client = await MongoClient.connect(process.env.MONGO_URI, options);

    // Connect to database, get collection
    const db = client.db(process.env.DB_NAME);
    const collection = db.collection(col_names.EMPLOYEE);

    collection.findOne({ _id: ObjectId(req.params.employeeId) })
    .then(response => {
        if(response) res.status(status_codes.SUCCESS).send(response);
        else         res.status(status_codes.BAD_REQUEST).send("Employee ID does not exist.");
    })
    .catch(error => res.status(status_codes.ERROR).send(error))
    .finally(_ => client.close());
})

router.put('/eid/:employeeId', async function(req, res) {
    const client = await MongoClient.connect(process.env.MONGO_URI, options);

    // Connect to database, get collection
    const db = client.db(process.env.DB_NAME);
    const collection = db.collection(col_names.EMPLOYEE);
    const employeeId = ObjectId(req.body._id);
    let employeeData = req.body;
    delete employeeData._id;
    
    collection.findOneAndUpdate({_id: employeeId}, employeeData)
    .then(response => {
        if(response.value) res.status(status_codes.SUCCESS).send(response);
        else               res.status(status_codes.BAD_REQUEST).send("Employee ID does not exist.");
    })
    .catch(error => {
        console.log('err: ', error)
        res.status(status_codes.ERROR).send(error)
    })
    .finally(_ => client.close())
})

// Delete specific business document
router.delete('/eid/:employeeId', async function(req, res) {

    const client = await MongoClient.connect(process.env.MONGO_URI, options);

    // Connect to database, get collection
    const db = client.db(process.env.DB_NAME);
    const collection = db.collection(col_names.EMPLOYEE);

    collection.findOneAndDelete({ _id: ObjectId(req.params.employeeId) })
    .then((response) => {
        const urlParse = url.parse(response.value.image_path).pathname;
        const filePath = path.resolve(__dirname, urlParse.replace('/v1/static', '../../../uploads'));
        // Delete the image saved on the server for the employee        
        fs.unlink(filePath, (err) => {
            if (err) throw err;
            console.log(`${filePath} was deleted`);
        });
        
        if(response.value) res.status(status_codes.SUCCESS).send(response);
        else               res.status(status_codes.BAD_REQUEST).send("User ID does not exist.");
    })
    .catch(error => res.status(status_codes.ERROR).send(error))
    .finally(_ => client.close());
})

module.exports = router;