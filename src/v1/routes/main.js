const express = require('express');
router = express.Router();

const businessRouter = require('./businesses');
const userRouter = require('./users');
const employeeRouter = require('./employees');
const serviceRouter = require('./services');

router.use('/businesses', businessRouter);
router.use('/users', userRouter);
router.use('/employees', employeeRouter);
router.use('/services', serviceRouter);

module.exports = router;
