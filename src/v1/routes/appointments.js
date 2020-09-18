const express = require('express');
const dotenv = require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
const status_codes = require('../utils/status_codes');
const checkers = require('../utils/entry_checker');
const options = require('../utils/dbConnectionOptions');
const collection_names = require('../settings/collection_names');
const AppointmentMaster = require('../utils/appointment_master');

const router = express.Router();
const appointmentMaster = new AppointmentMaster();

router.post('/', async (req, res, next) => {

    const body = req.body;
    const formatted_start_dt = appointmentMaster.format_start_date(body.time);
    const formatted_end_dt = appointmentMaster.get_end_time(body.time, formatted_start_dt)

    const appointment = {
        user: ObjectId(body.user),
        business: ObjectId(body.business),
        employees: body.employees.map(employee => ObjectId(employee)),
        time: {
            start: formatted_start_dt,
            end: formatted_end_dt,
            duration: Number(body.time.duration),
        },
        services: body.services.map(service => ObjectId(service)),
        rating: body.rating,
        status: "pending"   // Automatically assign "pending" status
    }
    const check_result = checkers.appointment_entry_checker(appointment);

    //hard yes
    //check_result.valid=true

    if(check_result.valid) {
        const client = await MongoClient.connect(process.env.MONGO_URI, options);
        const db = client.db(process.env.DB_NAME);
        const collection = db.collection(collection_names.APPOINTMENT);

        const query = {
            $or: [
                {
                    user: appointment.user,
                    $or: [
                        {'time.start': { $gte: appointment.time.start, $lte: appointment.time.end } },
                        {'time.end':   { $gte: appointment.time.start, $lte: appointment.time.end } },
                    ]
                },
                {
                    business: appointment.business,
                    $or: [
                        {'time.start': { $gte: appointment.time.start, $lte: appointment.time.end } },
                        {'time.end':   { $gte: appointment.time.start, $lte: appointment.time.end } },
                    ]
                },
            ]
        }

        collection.countDocuments(query)
        .then(count => {
            if(count > 0) {
                res.status(status_codes.CONFLICT).send("Appointment has a conflict.");
                next();
            }
            else {
                collection.insertOne(appointment)
                .then(response => {
                    // Success condition everything ok
                    if(response.result.ok || response !== null) {
                        res.sendStatus(status_codes.SUCCESS);
                    }
                })
                .catch(error => {
                    console.log(error);
                    res.status(status_codes.ERROR).send(error)
                })
                .finally(_ => client.close());
            }
        })
    }
    else {
        res.status(status_codes.BAD_REQUEST).send(check_result.reason);
    }
})

router.get('/uid/:userId', async (req, res) => {
    const client = await MongoClient.connect(process.env.MONGO_URI, options);
    const db = client.db(process.env.DB_NAME);
    const collection = db.collection(collection_names.APPOINTMENT);

    collection.aggregate([
        { $match: { user: ObjectId(req.params.userId) } },
        {
            $project: {
                user: "$user",
                business: "$business",
                services: "$services",
                employees: "$employees",
                time: "$time",
                rating: "$rating",
                status: "$status"
            }
        },
        {
            $lookup: {
                from: collection_names.SERVICE,
                let: { services: "$services" },
                pipeline: [
                    { $match: { $expr: { $in: [ "$_id", "$$services" ] } } },
                    {
                        $project: {
                            _id: 0,
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
                let: { employees: "$employees" },
                pipeline: [
                    { $match: { $expr: { $in: [ "$_id", "$$employees" ] } } },
                    {
                        $project: {
                            _id: 0,
                            name: 1,
                            rating: 1,
                        }
                    }
                ],
                as: "employees"
            }
        },
        // {
        //     $lookup: {
        //         from: collection_names.BUSINESS,
        //         let: { business_id: "$business" },
        //         pipeline: [
        //             { $match: { $expr: { $eq: ["$_id","$$business_id"] } } },
        //             {
        //                 $project: {
        //                     _id: 0,
        //                     name: 1,
        //                     address: 1,
        //                     location: 1,
        //                     contact: 1
        //                 }
        //             }
        //         ],
        //         as: "business"
        //     }
        // },
    ]).toArray()
    .then(response => {
        if(response) res.status(status_codes.SUCCESS).send(response);
        else         res.status(status_codes.BAD_REQUEST).send("Appointment ID does not exist.");
    })
    .catch(error => res.status(status_codes.ERROR).send(error))
    .finally(_ => client.close());
})

// Has search params to be added, param is date
// Format:
// ?date[day]=&date[month]=&date[year]=
router.get('/bid/:businessId/search', async (req, res) => {
    const client = await MongoClient.connect(process.env.MONGO_URI, options);
    const db = client.db(process.env.DB_NAME);
    const collection = db.collection(collection_names.APPOINTMENT);
    const date_str = `${req.query.date.year}-${req.query.date.month}-${req.query.date.day}`;
    const time_start = { date: date_str, start: {hour:0, minute:0}};
    const time_end = { date: date_str, start: {hour:23, minute:59}};

    collection.aggregate([
        {
            $match: {
                business: ObjectId(req.params.businessId),
                'time.start': { $gte: appointmentMaster.format_start_date(time_start), $lte: appointmentMaster.format_start_date(time_end) }
            }
        },
        {
            $lookup: {
                from: "user",
                let: { userId: "$user" },
                pipeline: [
                    { $match: { $expr: { $eq: ["$_id","$$userId"] } } },
                    { $project: {  _id: 0, name: 1, contact: 1, } }
                ],
                as: "user"
            }
        },
        { $sort: { 'time.start': 1 } },
        {
            $project: {
                employees: "$employees",
                services: "$services",
                time: "$time",
                status: "$status",
                user: { $arrayElemAt: ["$user", 0] }
            }
        }
    ]).toArray()
    .then(response =>  res.status(status_codes.SUCCESS).send(response))
    .catch(error => res.status(status_codes.ERROR).send(error))
    .finally(_ => client.close());
})

router.put('/aid/:appointmentId/status/:newStatus', async (req, res, next) => {
    const client = await MongoClient.connect(process.env.MONGO_URI, options);
    const db = client.db(process.env.DB_NAME);
    const collection = db.collection(collection_names.APPOINTMENT);
    const appointmentId = req.params.appointmentId;
    const newStatus = req.params.newStatus.toLowerCase();

    if(!appointmentMaster.is_status_valid(newStatus)){
        res
        .status(status_codes.BAD_REQUEST)
        .send(`Status update ${newStatus} is not valid, options are: ${appointmentMaster.status_types.join(',')}.`);
        next();
    }

    collection.findOneAndUpdate({ _id: ObjectId(appointmentId)}, { $set: { status: newStatus } })
    .then(response => {
        if(response.value) res.status(status_codes.SUCCESS).send(response);
        else               res.status(status_codes.BAD_REQUEST).send("Appointment ID does not exist.");
    })
    .catch(error => {
        console.log('err: ', error)
        res.status(status_codes.ERROR).send(error)
    })
    .finally(_ => client.close())
})

router.put('/aid/:appointmentId/rate', async (req, res, next) => {
    const client = await MongoClient.connect(process.env.MONGO_URI, options);
    const db = client.db(process.env.DB_NAME);
    const collection_appointment = db.collection(collection_names.APPOINTMENT);
    const collection_rating = db.collection(collection_names.RATING);
    const appointmentId = req.params.appointmentId;

    // Find the appointment that is being rated
    const appointment = await collection_appointment.findOne({ _id: ObjectId(appointmentId) });


    if(!(req.body.rating instanceof Array)) {
        res.status(status_codes.ERROR).send('Type of rate in body has to be an Array.');
        client.close();
        return next();
    }

    let type_count = 0;
    for (let i=0; i<req.body.rating.length; i++){
        if (typeof req.body.rating[i] === "number"){
            type_count++;
        }
    }
    if (req.body.rating.length !== type_count){
        res.status(status_codes.ERROR).send('Type of rate has to be a number.');
    }

    // rate array [0] = Business [1]=employee
    if(req.body.rating.length !== 2) {
        res.status(status_codes.BAD_REQUEST).send('There can only be ratings for employee and the business. Array length must be equal to 2.');
        client.close();
    }

    const query = {
        _id: ObjectId(appointmentId)
    };
    const update = {
        $set: {
            rating: req.body.rating
        }
    };

    if (apoointment === null || appointment === undefined){
        res.send("Could not find the appointment")
    }else{
        let responseValue = appointment;
        responseValue.rating = req.body.rating;
        collection_appointment.findOneAndUpdate(query, update)
            .then(response => res.status(status_codes.SUCCESS).send(responseValue))
            .catch(error => res.status(status_codes.ERROR).send(error))
            .finally(_ => client.close())
    }

})

router.delete('/aid/:appointmentId', async (req, res) => {
    const client = await MongoClient.connect(process.env.MONGO_URI, options);
    const db = client.db(process.env.DB_NAME);
    const collection = db.collection(collection_names.APPOINTMENT);

    collection.findOneAndDelete({ _id: ObjectId(req.params.appointmentId) })
    .then(response => {
        if(response.value) res.status(status_codes.SUCCESS).send(response);
        else               res.status(status_codes.BAD_REQUEST).send("Appointment ID does not exist.");
    })
    .catch(error => res.status(status_codes.ERROR).send(error))
    .finally(_ => client.close());
})

module.exports = router;
