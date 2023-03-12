var express = require('express');
var router = express.Router();

router.use('/user', require('./user'))
router.use("/chapter", require('./chapter'))

module.exports = router;