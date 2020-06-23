const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
const checkers = require('../utils/entry_checker');
const bcrypt = require('bcrypt');
const express = require('express');
const status_codes = require('../utils/status_codes');
const dotenv = require('dotenv').config();
const options = require('../utils/dbConnectionOptions');
const check_type = require('../utils/type_checker');

router = express.Router();



module.exports = router;