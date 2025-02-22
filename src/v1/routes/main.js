const express = require('express');
const path = require('path');
router = express.Router();

const businessRouter = require('./businesses');
const userRouter = require('./users');
const employeeRouter = require('./employees');
const serviceRouter = require('./services');
const appointmentRouter = require('./appointments');
const emailServiceRouter = require('./emailService');
const adminRouter = require('./admin');

router.use('/static', express.static(path.join(__dirname, '../../../uploads')))
router.use('/businesses', businessRouter);
router.use('/users', userRouter);
router.use('/employees', employeeRouter);
router.use('/services', serviceRouter);
router.use('/appointments', appointmentRouter);
router.use('/email', emailServiceRouter);
router.use('/admin', adminRouter);

module.exports = router;
