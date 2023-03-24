var express = require('express')
var router = express.Router()
const { verifyToken } = require("../utils/jwt")
const likesController = require('../controller/likesController')

router
    .post("/addlikes", verifyToken(), likesController.addlikes)
    .post('/dellikes', verifyToken(), likesController.dellikes)
    .post("/islikes", verifyToken(), likesController.islikes)
    .get("/count", likesController.count)


module.exports = router