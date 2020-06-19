const express = require('express');
router = express.Router();

const Model = require("../schema/business");

// Create a business
router.post('/', function(req, res) {
    res.send(req.body);
    console.log(Model.bsonType);
});

module.exports = router;
