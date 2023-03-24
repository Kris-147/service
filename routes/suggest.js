var express = require('express')
const { body, validationResult } = require('express-validator')
var router = express.Router()
const validator = require('../middleware/validator/userValidator')
const suggestController = require("../controller/suggestController")
const { verifyToken } = require("../utils/jwt")

router
    .post("/submit", verifyToken(), suggestController.submitSug)

module.exports = router