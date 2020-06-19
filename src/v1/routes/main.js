const express = require('express');
router = express.Router();

const businessRouter = require('./businesses');
const userRouter = require('./users');

router.use('/business', businessRouter);
router.use('/user', userRouter);

module.exports = router;
