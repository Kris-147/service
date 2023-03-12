const Knowledge = require("../model/knowledgeModel")
const Chapter_Merge_Knowledge = require("../model/chapter_merge_knowledgeModel")
const jwt = require('jsonwebtoken')
const { createToken } = require('../utils/jwt')
const sequelize = require("../model")
const { Op } = require("sequelize")

exports.getKnowledgeByChapterId = async(req, res) => {
    const kids = await Chapter_Merge_Knowledge.findAll({
        where: {
            cid: req.query.chapterId
        }
    })
    let k = []
    for (let i = 0; i < kids.length; i++) {
        k.push(kids[i].dataValues.kid)
    }
    const { count, rows } = await Knowledge.findAndCountAll({
        where: {
            id: {
                [Op.in]: k
            }
        },
        offset: Number(req.query.offset),
        limit: Number(req.query.limit)
    })
    let knowledgeData = []
    for (let i = 0; i < rows.length; i++) {
        let { id, knowledgeName } = rows[i].dataValues
        let d = {
            id: id,
            knowledgeName: knowledgeName
        }
        knowledgeData.push(d)
    }
    res.json({
        code: 1,
        msg: "success",
        data: knowledgeData
    })
}