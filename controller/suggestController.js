const Suggest = require('../model/suggestModel')
const { redis } = require("../model/redis/index")
const jwt = require('jsonwebtoken')
const { promisify } = require('util')
const verify = promisify(jwt.verify)
const { uuid } = require('../config/config.default')
const sequelize = require("../model")
const { QueryTypes } = require("sequelize")

exports.submitSug = async(req, res) => {
    let token = req.headers.authorization
    token = token ? token.split('Bearer ')[1] : null
    let userinfo = await verify(token, uuid)
    let uid = userinfo.userinfo.id
    let content = req.body.content
    if (content) {
        let r = await Suggest.create({
            uid: uid,
            content: content,
            handle: 0
        })
        if (r) {
            res.json({
                code: 1,
                msg: "提交成功",
                data: null
            })
        } else {
            res.json({
                code: 0,
                msg: "未知错误",
                data: null
            })
        }
    } else {
        res.json({
            code: 0,
            msg: "内容不能为空",
            data: null
        })
    }
}