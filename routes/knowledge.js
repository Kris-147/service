var express = require("express")
const { body, validationResult } = require('express-validator')
var router = express.Router()
    // const validator = require('../middleware/validator/userValidator')
const { verifyToken } = require("../utils/jwt")
const knowledgeController = require("../controller/knowledgeController")

router
    .get("/bychapter", verifyToken(), knowledgeController.getKnowledgeByChapterId)

module.exports = router