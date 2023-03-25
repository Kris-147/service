const Politics = require("../model/politicsModel")
const Knowledge = require("../model/knowledgeModel")
const { redis } = require("../model/redis/index")
const jwt = require('jsonwebtoken')
const { promisify } = require('util')
const verify = promisify(jwt.verify)
const { uuid } = require('../config/config.default')
const sequelize = require("../model")
const { QueryTypes, Op } = require("sequelize")

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
            const { count, rows } = await Politics.findAndCountAll({
                attributes: ["id", "kid", "iname"],
                offset: offset,
                limit: limit,
                where: {
                    iname: {
                        [Op.substring]: req.query.searchName
                    }
                }
            })
            if (count) {
                for (let i = 0; i < rows.length; i++) {
                    const kn = await Knowledge.findOne({
                        attributes: ['knowledgeName'],
                        where: {
                            id: rows[i].dataValues.kid
                        }
                    })
                    let obj = {}
                    obj.id = rows[i].dataValues.id
                    obj.iname = rows[i].dataValues.iname
                    obj.kname = kn.dataValues.knowledgeName
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
            } else {
                res.json({
                    code: 1,
                    msg: "success",
                    data: {
                        data: data,
                        count: 0
                    }
                })
            }
        } else {
            const { count, rows } = await Politics.findAndCountAll({
                attributes: ["id", "kid", "iname"],
                offset: offset,
                limit: limit
            })
            for (let i = 0; i < rows.length; i++) {
                const kn = await Knowledge.findOne({
                    attributes: ['knowledgeName'],
                    where: {
                        id: rows[i].dataValues.kid
                    }
                })
                let obj = {}
                obj.id = rows[i].dataValues.id
                obj.iname = rows[i].dataValues.iname
                obj.kname = kn.dataValues.knowledgeName
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

exports.getContent = async(req, res) => {
    let token = req.headers.authorization
    token = token ? token.split('Bearer ')[1] : null
    let userinfo = await verify(token, uuid)
    let uid = userinfo.userinfo.id
    if (uid == 1) {
        let pid = req.query.id
        const r = await Politics.findOne({
            attributes: ['content', "kid"],
            where: {
                id: pid
            }
        })
        res.json({
            code: 1,
            msg: "success",
            data: {
                content: r.dataValues.content,
                kid: r.dataValues.kid
            }
        })
    } else {
        res.json({
            code: 0,
            msg: "unauthorization",
            data: null
        })
    }
}

exports.updatePolitics = async(req, res) => {
    let iname = req.body.iname
    let content = req.body.content
    if (iname) {
        if (content) {
            let id = req.body.id
            let kid = req.body.kid
            const r = await Politics.update({
                kid: kid,
                content: content,
                iname: iname
            }, {
                where: {
                    id: id
                }
            })
            if (r) {
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
            res.json({
                code: 0,
                msg: "思政素材内容不能为空",
                data: null
            })
        }
    } else {
        res.json({
            code: 0,
            msg: "思政素材名称不能为空",
            data: null
        })
    }
}

exports.addPolitics = async(req, res) => {
    let content = req.body.content
    let kid = Number(req.body.kid)
    let iname = req.body.iname
    if (!iname) {
        res.json({
            code: 0,
            msg: "思政素材名称不能为空",
            data: null
        })
        return
    }
    if (!kid) {
        res.json({
            code: 0,
            msg: "思政素材关联知识点不能为空",
            data: null
        })
        return
    }
    if (!content) {
        res.json({
            code: 0,
            msg: "思政素材内容不能为空",
            data: null
        })
        return
    }
    let r = await Politics.create({
        kid: kid,
        content: content,
        iname: iname
    })
    if (r) {
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
}

exports.delPolitics = async(req, res) => {
    let id = req.body.id
    if (id) {
        let r = await Politics.destroy({
            where: {
                id: id
            }
        })
        if (r) {
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
        res.json({
            code: 0,
            msg: "id不能为空",
            data: null
        })
    }

}