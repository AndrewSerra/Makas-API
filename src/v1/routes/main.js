const express = require('express');
router = express.Router();

const businessRouter = require('./businesses');

router.use('/businesses', businessRouter);

module.exports = router;
