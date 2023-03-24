var express = require('express')
var router = express.Router()
const { verifyToken } = require("../utils/jwt")
const favorController = require('../controller/favorController')

router
    .post("/addfavor", verifyToken(), favorController.addfavor)
    .post('/delfavor', verifyToken(), favorController.delfavor)
    .post("/isfavor", verifyToken(), favorController.isfavor)
    .get("/allfavor", verifyToken(), favorController.allfavor)
    .get("/count", favorController.count)
    .get("/getallfavor", verifyToken(), favorController.getallfavor)


module.exports = router