const express = require('express');
const dotenv = require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
const status_codes = require('../utils/status_codes');
const options = require('../utils/dbConnectionOptions');
const collection_names = require('../settings/collection_names');
const jwt = require('jsonwebtoken')
router = express.Router();

// Add tokens to user
router.post("/uid/:userID", async (req, res) => {
    const client = await MongoClient.connect(process.env.MONGO_URI, options);
    // Connect to database, get collection
    const db = client.db(process.env.DB_NAME);
    const collection = db.collection(collection_names.USER);

    const userID = req.params.userID;
    const user = await collection.findOne({ _id: ObjectId(userID)})
    const createdAccessToken = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET);
    //user.accessToken = createdAccessToken;


    const query = {
        _id : ObjectId(req.params.userID)
    }
    collection.findOneAndUpdate(query, { $set: { accessToken: createdAccessToken } })
        .then(async (response) => {
            if(response.value) {
                const user = response.value;
                res.send(user)
            }
            else res.status(status_codes.BAD_REQUEST).send("User does not exist.");
        })
        .catch(error => res.status(status_codes.ERROR).send(error))
        .finally(_ => client.close())
});


module.exports = router;
