var express = require('express')
const { body, validationResult } = require('express-validator')
var router = express.Router()
const validator = require('../middleware/validator/loginValidator')
const loginController = require('../controller/loginController')

router
    .post('/login', validator.login, loginController.login)
    .get('/captcha', loginController.getCaptcha)

module.exports = router