const express = require('express');
router = express.Router();

const businessRouter = require('./businesses');

router.use('/business', businessRouter);

module.exports = router
