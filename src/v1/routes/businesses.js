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
const collection_names = require('../settings/collection_names');
const AppointmentMaster = require('../utils/appointment_master');
const service_settings = require('../settings/service');
const multer = require('multer');

router = express.Router();
appointment_master = new AppointmentMaster();
const upload = multer();

router.post('/login', async function(req, res, next) {
    const client = await MongoClient.connect(process.env.MONGO_URI, options);
    // Connect to database, get collection
    const db = client.db(process.env.DB_NAME);
    const collection = db.collection(collection_names.BUSINESS);
    let { email, password } = req.body;
    console.log(req.body)
    if(email.trim() === '' || password.trim() === '') {
        res.sendStatus(status_codes.BAD_REQUEST);
        client.close();
        next();
    }

    const businessDoc = await collection.findOne({ 'contact.email': email });

    // Check if the business email exists in the system
    if(businessDoc) {
        // res.status(200).send(businessDoc);
        bcrypt.compare(password, businessDoc.password, function(error, result) {
            if(error) {
                res.sendStatus(status_codes.ERROR);
                client.close();
                next();
            }
            if(result) res.sendStatus(status_codes.SUCCESS);
            else       res.status(status_codes.BAD_REQUEST).send("Yanlis sifre.");
        })
    }
    else {
        res.sendStatus(status_codes.NOT_FOUND);
    }

    client.close();
})

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
        opTime: [
            {start: {hour: 0, min: 0}, end: {hour: 0, min: 0}}, //Monday
            {start: {hour: 0, min: 0}, end: {hour: 0, min: 0}}, //Tuesday
            {start: {hour: 0, min: 0}, end: {hour: 0, min: 0}}, //Wednesday
            {start: {hour: 0, min: 0}, end: {hour: 0, min: 0}}, //Thursday
            {start: {hour: 0, min: 0}, end: {hour: 0, min: 0}}, //Friday
            {start: {hour: 0, min: 0}, end: {hour: 0, min: 0}}, //Saturday
            {start: {hour: 0, min: 0}, end: {hour: 0, min: 0}}  //Sunday
        ],
        created: new Date()
    }
    // Check the values sent
    const check_result = checkers.business_entry_checker(business);

    // Hash the password entered
    bcrypt.genSalt(Number(process.env.SALT_ROUNDS), (err, salt) => {
        if(err)  throw error;
        bcrypt.hash(req.body.password, salt, async (err, hash) => {
            if(err) throw err;
            business.password = hash;

            // Only connects if the check is valid
            if(check_result.valid) {
                const client = await MongoClient.connect(process.env.MONGO_URI, options)

                // Connect to database, get collection
                const db = client.db(process.env.DB_NAME);
                const collection = db.collection(collection_names.BUSINESS);

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
    })
})

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
    const category = Object.keys(service_settings).includes(query_init.category) ? [query_init.category] : Object.keys(service_settings);

    // Clean the  query object
    for(let[key, value] of Object.entries(query_init)) {
        if(value === undefined) {
            delete query_init[key];
        }
        else if(key === "offset" || key === "numDocs" || key === "range" || key === "category") {
            delete query_init[key];
        }
    }

    // Correct location format
    let correct_format_loc;
    if(query_init.location) {
        correct_format_loc = query_init.location.split(",");
        correct_format_loc = correct_format_loc.map(loc => Double(loc));
    }

    const client = await MongoClient.connect(process.env.MONGO_URI, options);

    if(!client) {
        res.status(status_codes.ERROR).send(error);
        next();
    }
    // Connect to database, get collection
    const db = client.db(process.env.DB_NAME);
    const collection = db.collection(collection_names.BUSINESS);

    let re_name = new RegExp(query_init.name ? query_init.name : "", 'i')                   // 'i' for case insensitive
    let re_addr = new RegExp(query_init.location_name ? query_init.location_name : "", 'i')

    // Create the time object from the data in the query
    const query_date = query_init.date;
    const query_time = query_init.time;
    const time = {
        date: `${query_date.year}-${query_date.month}-${query_date.day}`,
        start: { hour: Number(query_time.hr), minute: Number(query_time.min)}
    }
    // Adjust the time component of the date
    const appointment_start_req = appointment_master.format_start_date(time);

    collection.aggregate([
        {
            $geoNear: {
                near: { type: "Point", coordinates: correct_format_loc, },
                key: 'location',
                distanceField: 'location.dist',
                maxDistance: range * 1000,  // 1000 meters
                query: { name: re_name, 'address.street': re_addr },
                spherical: true,
            }
        },
        {
            $lookup: {
                from: collection_names.SERVICE,
                let: { business: "$_id" },
                pipeline: [
                    { $match: { $expr: { $eq: ["$business", "$$business"] } } },
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                            price: 1,
                            category: 1,
                            duration: 1,
                        }
                    }
                ],
                as: "services"
            }
        },
        {
            $lookup: {
                from: collection_names.EMPLOYEE,
                let: { services: '$services._id' },
                pipeline: [
                    {
                        $project: {
                            name: 1,
                            description: 1,
                            rating: 1,
                            image_path: 1,
                            services: 1,
                            service_ids: { $setIntersection: ['$services', '$$services'] }
                        }
                    },
                    { $match: { $expr: { $eq: ['$services', '$service_ids'] } } },
                    { $project: { service_ids: 0, } }
                ],
                as: "employees"
            }
        },
        {
            $lookup: {
                from: collection_names.APPOINTMENT,
                let: { business: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ["$business", "$$business"]
                            },
                            'time.end': { $not: { $lte: appointment_start_req } },
                            'time.start': { $not: { $gte: appointment_start_req } },
                            status: { $not: { $eq: 'completed' } }
                        }
                    }
                ],
                as: "appointment_conflict"
            }
        },
        {
            $lookup: {
                from: collection_names.RATING,
                let: { business: "$_id" },
                pipeline: [
                    { $match: { $expr: { $eq: ["$business", "$$business"] }, } },
                    { $unwind: '$rating' },
                    { $group: { _id: null, rating: { $push: '$rating' } } },
                    { $project: { _id: 0, average: { $avg: '$rating' }, count: { $size: '$rating' } } },
                ],
                as: "rating"
            }
        },
        {
            $project: {
                 name: "$name",
                 address: "$address",
                 location: "$location",
                 contact: "$contact",
                 description: "$description",
                 image_paths: "$image_paths",
                 services: '$services',
                 employees: '$employees',
                 rating: { $arrayElemAt: ["$rating", 0] },
                 appointment_conflict: { $size: "$appointment_conflict" }
            }
        },
    ]).toArray()
    .then(businesses => {
        let new_business_arr = businesses.map(business => {
            let has_category = false;
            for(let service of business.services) {
                if(category.includes(service.category)) {
                    has_category = true;
                    break;
                }
            }
            return has_category ? business : null;
        })
        return new_business_arr.filter(business => business !== null);
    })
    .then(response => {
        if(response) res.status(status_codes.SUCCESS).send(response)
        else         res.status(status_codes.BAD_REQUEST).send("No result.")
    })
    .catch(error => {console.log(error);res.status(status_codes.ERROR).send(error)})
    .finally(_ => client.close());
})

// Get specific business document
router.get('/bid/:businessId', async function(req, res) {

    const client = await MongoClient.connect(process.env.MONGO_URI, options);

    // Connect to database, get collection
    const db = client.db(process.env.DB_NAME);
    const collection = db.collection(collection_names.BUSINESS);

    collection.aggregate([
       { $match: { _id: ObjectId(req.params.businessId) } },
       {
            $lookup: {
                    from: collection_names.SERVICE,
                    localField: "_id",
                    foreignField: "business",
                    as: "services"
            }
        },
        {
            $lookup: {
                from: collection_names.RATING,
                let: { business: "$_id" },
                pipeline: [
                    { $match: { $expr: { $eq: ["$business", "$$business"] }, } },
                    { $unwind: '$rating' },
                    { $group: { _id: null, rating: { $push: '$rating' } } },
                    { $project: { _id: 0, average: { $avg: '$rating' }, count: { $size: '$rating' } } },
                ],
                as: "rating"
            }
        },
        {
           $project: {
                name: "$name",
                address: "$address",
                location: "$location.coordinates",
                contact: "$contact",
                description: "$description",
                image_paths: "$image_paths",
                rating: { $arrayElemAt: ["$rating", 0] },
                opTime: "$opTime",
           }
        },
    ]).toArray()
    .then(response => {
        if(response) res.status(status_codes.SUCCESS).send(response)
        else         res.status(status_codes.BAD_REQUEST).send("Business ID does not exist.")
    })
    .catch(error => res.status(status_codes.ERROR).send(error))
    .finally(_ => client.close());
})

// Get all associated with a specific business document
router.get('/bid/:businessId/services', async function(req, res) {

    const client = await MongoClient.connect(process.env.MONGO_URI, options);

    // Connect to database, get collection
    const db = client.db(process.env.DB_NAME);
    const collection = db.collection(collection_names.SERVICE);

    collection.aggregate([
        { $match: { business: ObjectId(req.params.businessId) } },
        {
            $group: {
                _id: "$category",
                services: {
                    $push:  {
                        name: "$name",
                        price: "$price",
                        id: "$_id",
                        duration: "$duration",
                        description: "$description",
                    }
                }
            }
        },
    ]).toArray()
    .then(result => res.status(status_codes.SUCCESS).send(result))
    .catch(error => res.status(status_codes.ERROR).send(error))
    .finally(_ => client.close())
})

// Get all associated employees with a specific business document
router.get('/bid/:businessId/employees', async function(req, res) {

    const client = await MongoClient.connect(process.env.MONGO_URI, options);

    // Connect to database, get collection
    const db = client.db(process.env.DB_NAME);
    const collection = db.collection(collection_names.EMPLOYEE);

    collection.aggregate([
        { $match: { business: ObjectId(req.params.businessId) } },
        {
            $lookup: {
                    from: collection_names.SERVICE,
                    localField: "_id",
                    foreignField: "business",
                    as: "services"
            }
        },
    ]).toArray()
    .then(result => res.status(status_codes.SUCCESS).send(result))
    .catch(error => res.status(status_codes.ERROR).send(error))
    .finally(_ => client.close())
})

router.put('/bid/:businessId', upload.fields([]), async function(req, res) {
    const client = await MongoClient.connect(process.env.MONGO_URI, options);

    // Connect to database, get collection
    const db = client.db(process.env.DB_NAME);
    const collection = db.collection(collection_names.BUSINESS);
    const businessId = ObjectId(req.params.businessId);
    const businessData = req.body;
    let revisedData = {};


    for(let [k, v] of Object.entries(businessData)) {
        if     (k === 'address')         revisedData.address = {...revisedData.address, street: v};
        else if(k === 'address-country') revisedData.address = {...revisedData.address, country: v};
        else if(k === 'address-city')    revisedData.address = {...revisedData.address, city: v};
        else if(k === 'opStart')         revisedData.opTime = {...revisedData.opTime, start: {hour: Number(v.split(':')[0]), min: Number(v.split(':')[1])}};
        else if(k === 'opEnd')           revisedData.opTime = {...revisedData.opTime, end: {hour: Number(v.split(':')[0]), min: Number(v.split(':')[1])}};
        else if(k === 'contact')         revisedData.contact = {...revisedData.contact, phone: v};
        else revisedData[k] = v;
    }

    console.log(revisedData);
    collection.findOneAndUpdate({_id: businessId}, {$set: revisedData})
    .then(response => {
        if(response.value) res.status(status_codes.SUCCESS).send(response);
        else               res.status(status_codes.BAD_REQUEST).send("Business ID does not exist.");
    })
    .catch(error => {
        console.log('err: ', error)
        res.status(status_codes.ERROR).send(error)
    })
    .finally(_ => client.close())
})

// Delete specific business document
router.delete('/bid/:businessId', async function(req, res) {

    const client = await MongoClient.connect(process.env.MONGO_URI, options);

    // Connect to database, get collection
    const db = client.db(process.env.DB_NAME);
    const collection = db.collection(collection_names.BUSINESS);

    collection.findOneAndDelete({ _id: ObjectId(req.params.businessId) })
    .then(response => {
        if(response.value) {
            res.status(status_codes.SUCCESS).send(response);
            next();
        }
        else res.status(status_codes.BAD_REQUEST).send("Business ID does not exist.");
    })
    .catch(error => res.status(status_codes.ERROR).send(error))
    .finally(_ => client.close());
})

module.exports = router;
