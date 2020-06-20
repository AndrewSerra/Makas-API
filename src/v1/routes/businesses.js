const express = require('express');
router = express.Router();

const Model = require("../schema/business");

// Create a business
router.post('/', function(req, res) {
    res.send(req.body);

});

module.exports = router;
