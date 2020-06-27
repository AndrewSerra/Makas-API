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
    const client = await MongoClient.connect(process.env.MONGO_URI, options);
    const db = client.db(process.env.DB_NAME);
    const collection = db.collection(collection_names.APPOINTMENT);
    const body = req.body;

    const appointment = {
        user: ObjectId(body.user),
        business: ObjectId(body.business),
        employees: body.employees.map(employee => ObjectId(employee)),
        time: {
            date: new Date(body.time.date),
            start: {
                hour: Number(body.time.start.hour),
                minute: Number(body.time.start.minute),
            },
            end: appointmentMaster.get_end_time(body.time),
            duration: Number(body.time.duration),
        },
        services: body.services.map(service => ObjectId(service)),
        status: "Pending"   // Automatically assign "pending" status
    }
    const check_result = checkers.appointment_entry_checker(appointment);

    if(check_result.valid) {
        const client = await MongoClient.connect(process.env.MONGO_URI, options);
        const db = client.db(process.env.DB_NAME);
        const collection = db.collection(collection_names.APPOINTMENT);

        const query = {
            $or: [
                {
                    user: appointment.user,
                    'time.date': appointment.time.date,
                    $or: [
                        {
                            'time.start.hour': { $lte: appointment.time.end.hour },
                            'time.start.minute': { $lte: appointment.time.end.minute },
                        },
                        {
                            'time.end.hour':   { $gte: appointment.time.start.hour },
                            'time.end.minute':   { $gte: appointment.time.start.minute }
                        }
                    ]
                },
                {
                    business: appointment.business,
                    'time.date': appointment.time.date,
                    $or: [
                        {
                            'time.start.hour': { $lte: appointment.time.end.hour },
                            'time.start.minute': { $lte: appointment.time.end.minute },
                        },
                        {
                            'time.end.hour':   { $gte: appointment.time.start.hour },
                            'time.end.minute':   { $gte: appointment.time.start.minute }
                        }
                    ]
                }
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
                .catch(error => res.status(status_codes.ERROR).send(error)) 
                .finally(_ => client.close());
            }
        })
    }
    else {
        res.status(status_codes.BAD_REQUEST).send(check_result.reason);
    }
})

module.exports = router;