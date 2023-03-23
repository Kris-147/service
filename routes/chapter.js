var express = require('express')
const { body, validationResult } = require('express-validator')
var router = express.Router()
const { verifyToken } = require("../utils/jwt")
const chapterController = require("../controller/chapterController")

router
    .get('/getall', verifyToken(), chapterController.getallchapter)
    .post("/update", verifyToken(), chapterController.updateChapterName)
    .post("/add", verifyToken(), chapterController.addChapterName)
    .post("/del", verifyToken(), chapterController.delChapterName)
    .get("/search", verifyToken(), chapterController.searchChapter)
    .get("/getallchapter", verifyToken(), chapterController.getAllChapter)
    .get('/usergetall', chapterController.usergetall)
    .get('/getcontent', chapterController.getcontent)

module.exports = router