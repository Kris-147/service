var express = require('express')
const { body, validationResult } = require('express-validator')
var router = express.Router()
const validator = require('../middleware/validator/userValidator')
const politicsController = require("../controller/politicsController")
const { verifyToken } = require("../utils/jwt")

router
    .get("/all", verifyToken(), politicsController.initTable)
    .get("/content", verifyToken(), politicsController.getContent)
    .post("/update", verifyToken(), politicsController.updatePolitics)
    .post("/add", verifyToken(), politicsController.addPolitics)
    .post("/del", verifyToken(), politicsController.delPolitics)

module.exports = router