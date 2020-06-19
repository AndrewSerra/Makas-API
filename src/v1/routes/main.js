const express = require('express');
router = express.Router();

const businessRouter = require('./businesses');
const userRouter = require('./users');
const appointmentsRouter = require("./appointments");

router.use('/business', businessRouter);
router.use('/user', userRouter);
router.use('/appointments', appointmentsRouter);

module.exports = router;
