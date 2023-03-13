var express = require("express")
const { body, validationResult } = require('express-validator')
var router = express.Router()
const { verifyToken } = require("../utils/jwt")
const knowledgeController = require("../controller/knowledgeController")
const multer = require("multer")
const upload = multer({ dest: 'public/images' })

router
    .get("/bychapter", verifyToken(), knowledgeController.getKnowledgeByChapterId)
    .get("/searchbychapter", verifyToken(), knowledgeController.searchByChapterId)
    .post("/contentImg", verifyToken(), upload.single('contentImg'), knowledgeController.contentImg)
    .post("/add", verifyToken(), knowledgeController.addKnowledge)
    .post("/del", verifyToken(), knowledgeController.delKnowledge)
    .post("/update", verifyToken(), knowledgeController.updateKnowledge)
    .get("/content", verifyToken(), knowledgeController.getContent)

module.exports = router