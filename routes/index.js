var express = require('express');
var router = express.Router();

router.use('/user', require('./user'))
router.use("/chapter", require('./chapter'))
router.use("/knowledge", require("./knowledge"))
router.use("/favor", require("./favor"))
router.use("/likes", require("./likes"))

module.exports = router;