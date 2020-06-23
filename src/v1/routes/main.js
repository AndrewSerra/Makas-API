const express = require('express');
router = express.Router();

const businessRouter = require('./businesses');
const userRouter = require('./users');
const employeeRouter = require('./employees');

router.use('/businesses', businessRouter);
router.use('/users', userRouter);
router.use('/employees', employeeRouter);

module.exports = router;
