const express = require('express');
const dotenv = require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
const status_codes = require('../utils/status_codes');
const options = require('../utils/dbConnectionOptions');
const collection_names = require('../settings/collection_names');
const jwt = require('jsonwebtoken')
router = express.Router();


// Coming Features
router.get("/features", async (req, res) => {
    const features = {
        featureList : [
            {featureName: "Özellik 1", featurePicture:"https://i4.hurimg.com/i/hurriyet/75/1200x675/5eadfe087152d80570fb95f3.jpg", featureDeploymentDate:"2 Kasım 2020", featureText:"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat "},
            {featureName: "Özellik 1", featurePicture:"https://i4.hurimg.com/i/hurriyet/75/1200x675/5eadfe087152d80570fb95f3.jpg", featureDeploymentDate:"2 Kasım 2020", featureText:"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat "},
            {featureName: "Özellik 1", featurePicture:"https://i4.hurimg.com/i/hurriyet/75/1200x675/5eadfe087152d80570fb95f3.jpg", featureDeploymentDate:"2 Kasım 2020", featureText:"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat "},
            {featureName: "Özellik 1", featurePicture:"https://i4.hurimg.com/i/hurriyet/75/1200x675/5eadfe087152d80570fb95f3.jpg", featureDeploymentDate:"2 Kasım 2020", featureText:"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat "},
        ]
    }
    res.send(features);
});


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
