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
        status: "pending"   // Automatically assign "pending" status
    }
    const check_result = checkers.appointment_entry_checker(appointment);
    check_result.valid=true
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
            console.log(count)
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
        {
            $lookup: {
                from: collection_names.BUSINESS,
                let: { business_id: "$business" },
                pipeline: [
                    { $match: { $expr: { $eq: ["$_id","$$business_id"] } } },
                    {
                        $project: {
                            _id: 0,
                            name: 1,
                            address: 1,
                            location: 1,
                            contact: 1
                        }
                    }
                ],
                as: "business"
            }
        },
    ]).toArray()
    .then(response => {
        if(response) res.status(status_codes.SUCCESS).send(response);
        else         res.status(status_codes.BAD_REQUEST).send("Appointment ID does not exist.");
    })
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

router.delete('/aid/:appointmentId', async (req, res, next) => {
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