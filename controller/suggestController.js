const Suggest = require('../model/suggestModel')
const User = require('../model/userModel')
const { redis } = require("../model/redis/index")
const jwt = require('jsonwebtoken')
const { promisify } = require('util')
const verify = promisify(jwt.verify)
const { uuid } = require('../config/config.default')
const sequelize = require("../model")
const { QueryTypes } = require("sequelize")
const { Op } = require("sequelize")

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

exports.initTable = async(req, res) => {
    let token = req.headers.authorization
    token = token ? token.split('Bearer ')[1] : null
    let userinfo = await verify(token, uuid)
    let uid = userinfo.userinfo.id
    if (uid == 1) {
        let offset = 0
        let limit = 10
        if (req.query.offset) {
            offset = Number(req.query.offset)
        }
        if (req.query.limit) {
            limit = Number(req.query.limit)
        }
        let data = []
        if (req.query.searchName) {
            const us = await User.findAll({
                attributes: ['id', 'username'],
                where: {
                    username: {
                        [Op.substring]: req.query.searchName
                    }
                }
            })
            if (us.length) {
                let uids = []
                for (let i = 0; i < us.length; i++) {
                    uids.push(us[i].dataValues.id)
                }
                const { count, rows } = await Suggest.findAndCountAll({
                    attributes: ["id", "uid", "content", "handle", "createdAt"],
                    where: {
                        uid: {
                            [Op.in]: uids
                        }
                    },
                    order: [
                        ['handle', 'ASC'],
                        ['createdAt', 'DESC']
                    ],
                    offset: offset,
                    limit: limit
                })
                if (count) {
                    for (let i = 0; i < rows.length; i++) {
                        let obj = {}
                        const name = await User.findOne({
                            where: {
                                id: rows[i].dataValues.uid
                            }
                        })
                        obj.username = name.dataValues.username
                        obj.id = rows[i].dataValues.id
                        obj.uid = rows[i].dataValues.uid
                        obj.content = rows[i].dataValues.content
                        obj.handle = rows[i].dataValues.handle
                        obj.createdAt = rows[i].dataValues.createdAt
                        data.push(obj)
                    }
                    res.json({
                        code: 1,
                        msg: "success",
                        data: {
                            count: count,
                            data: data
                        }
                    })
                } else {
                    res.json({
                        code: 1,
                        msg: "success",
                        data: {
                            count: 0,
                            data: []
                        }
                    })
                }
            } else {
                res.json({
                    code: 1,
                    msg: "success",
                    data: {
                        count: 0,
                        data: []
                    }
                })
            }
        } else {
            const { count, rows } = await Suggest.findAndCountAll({
                attributes: ["id", "uid", "content", "handle", "createdAt"],
                order: [
                    ['handle', 'ASC'],
                    ['createdAt', 'DESC']
                ],
                offset: offset,
                limit: limit
            })
            for (let i = 0; i < rows.length; i++) {
                let obj = {}
                obj.id = rows[i].dataValues.id
                const un = await User.findOne({
                    where: {
                        id: rows[i].dataValues.uid
                    }
                })
                obj.username = un.dataValues.username
                obj.uid = rows[i].dataValues.uid
                obj.content = rows[i].dataValues.content
                obj.handle = rows[i].dataValues.handle
                obj.createdAt = rows[i].dataValues.createdAt
                data.push(obj)
            }
            res.json({
                code: 1,
                msg: "success",
                data: {
                    data: data,
                    count: count
                }
            })
        }
    } else {
        res.status(401).json({
            code: 0,
            msg: "unauthorization",
            data: null
        })
    }
}

exports.handleSug = async(req, res) => {
    let token = req.headers.authorization
    token = token ? token.split('Bearer ')[1] : null
    let userinfo = await verify(token, uuid)
    let uid = userinfo.userinfo.id
    if (uid == 1) {
        let sid = Number(req.body.id)
        const s = await Suggest.update({
            handle: 1
        }, {
            where: {
                id: sid
            }
        })
        if (s) {
            res.json({
                code: 1,
                msg: "success",
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
        res.status(401).json({
            code: 0,
            msg: "unauthorization",
            data: null
        })
    }

}

exports.delSug = async(req, res) => {
    let token = req.headers.authorization
    token = token ? token.split('Bearer ')[1] : null
    let userinfo = await verify(token, uuid)
    let uid = userinfo.userinfo.id

    if (uid == 1) {
        let id = Number(req.body.id)
        const d = await Suggest.destroy({
            where: {
                id: id
            }
        })
        if (d) {
            res.json({
                code: 1,
                msg: "删除成功",
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
        res.status(401).json({
            code: 0,
            msg: "unauthorizaiton",
            data: null
        })
    }
}