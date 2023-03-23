var express = require('express')
const { body, validationResult } = require('express-validator')
var router = express.Router()
const validator = require('../middleware/validator/userValidator')
const userController = require('../controller/userController')
const { verifyToken } = require("../utils/jwt")

router
    .post('/login', validator.login, userController.login)
    .get('/captcha', userController.getCaptcha)
    .get("/getall", verifyToken(), userController.getAllUser)
    .post("/update", verifyToken(), userController.updateUser)
    .post("/add", verifyToken(), userController.addUser)
    .post("/del", verifyToken(), userController.delUser)
    .get("/search", verifyToken(), userController.searchUser)
    .post('/userlogin', validator.login, userController.userlogin)
    .post('/userreg', validator.reg, userController.userreg)
    .post('/findpassword', validator.find, userController.findpassword)
    .post('/test', userController.test)

module.exports = router