const express = require('express');
router = express.Router();

const businessRouter = require('./businesses');
const userRouter = require('./users');

router.use('/businesses', businessRouter);
router.use('/users', userRouter);

module.exports = router;
