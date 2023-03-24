const Favor = require("../model/favorModel")
const Knowledge = require("../model/knowledgeModel")
const { redis } = require("../model/redis/index")
const jwt = require('jsonwebtoken')
const { promisify } = require('util')
const verify = promisify(jwt.verify)
const { uuid } = require('../config/config.default')
const sequelize = require("../model")
const { QueryTypes } = require("sequelize")

exports.addfavor = async(req, res) => {
    let token = req.headers.authorization
    token = token ? token.split('Bearer ')[1] : null
    let userinfo = await verify(token, uuid)
    let uid = userinfo.userinfo.id

    let kid = req.body.kid
    let g = await redis.hget('favor', kid)
    let m = new Map()
    if (g) {
        let uids = g.split(",").map(Number)
        uids.push(uid)
        uids = [...new Set(uids)]
        let str = uids.join(',')
        m.set(kid, str)
        let s = await redis.hset('favor', m)
    } else {
        m.set(kid, String(uid))
        let s1 = await redis.hset('favor', m)
    }
    res.json({
        code: 1,
        msg: "收藏成功",
        data: null
    })
}

exports.delfavor = async(req, res) => {
    let token = req.headers.authorization
    token = token ? token.split('Bearer ')[1] : null
    let userinfo = await verify(token, uuid)
    let uid = userinfo.userinfo.id

    let kid = req.body.kid
    let v = await redis.hget('favor', kid)
    let uids = v.split(",").map(Number)
    for (let i = 0; i < uids.length; i++) {
        if (uids[i] == uid) {
            uids.splice(i, 1)
            break
        }
    }
    let str = uids.join(',')
    let m = new Map()
    m.set(kid, str)
    let hs = await redis.hset('favor', m)
    res.json({
        code: 1,
        msg: "取消收藏成功",
        data: null
    })
}

exports.isfavor = async(req, res) => {
    let token = req.headers.authorization
    token = token ? token.split('Bearer ')[1] : null
    let userinfo = await verify(token, uuid)
    let uid = userinfo.userinfo.id
    let kid = req.body.kid
    let hg = await redis.hget('favor', kid)
    let flag = false
    if (hg) {
        let uids = hg.split(",").map(Number)
        for (let i = 0; i < uids.length; i++) {
            if (uids[i] == uid) {
                flag = true
                break
            }
        }
    }

    res.json({
        code: 1,
        msg: 'success',
        data: flag
    })
}

exports.allfavor = async(req, res) => {
    let token = req.headers.authorization
    token = token ? token.split('Bearer ')[1] : null
    let userinfo = await verify(token, uuid)
    let uid = userinfo.userinfo.id

    let hk = await redis.hkeys('favor')
    let ans = []
    for (let i = 0; i < hk.length; i++) {
        let vstr = await redis.hget('favor', Number(hk[i]))
        let varr = vstr.split(",").map(Number)
        for (let j = 0; j < varr.length; j++) {
            if (varr[j] == uid) {
                ans.push(Number(hk[i]))
                break
            }
        }
    }
    res.json({
        code: 1,
        msg: "success",
        data: ans
    })
}

exports.count = async(req, res) => {
    let kid = req.query.kid
    let c = await redis.hget('favor', kid)
    let count = 0
    if (c) {
        count = c.split(',').length
    }
    res.json({
        code: 1,
        msg: "success",
        data: count
    })
}

exports.getallfavor = async(req, res) => {
    let token = req.headers.authorization
    token = token ? token.split('Bearer ')[1] : null
    let userinfo = await verify(token, uuid)
    let uid = userinfo.userinfo.id

    let hk = await redis.hkeys('favor')
    let fans = []
    for (let i = 0; i < hk.length; i++) {
        let vstr = await redis.hget('favor', Number(hk[i]))
        let varr = vstr.split(",").map(Number)
        for (let j = 0; j < varr.length; j++) {
            if (varr[j] == uid) {
                fans.push(Number(hk[i]))
                break
            }
        }
    }
    let data = []
    for (let i = 0; i < fans.length; i++) {
        console.log(fans[i]);
        let obj = {}
        const z = await redis.hget('favor', fans[i])
        if (z) {
            let zlen = z.split(",").length || 0
            obj.favorCount = zlen
        } else {
            obj.favorCount = 0
        }
        const l = await redis.hget('likes', fans[i])
        if (l) {
            let llen = l.split(',').length
            obj.likesCount = llen
        } else {
            obj.likesCount = 0
        }
        const k = await sequelize.query(`select id,knowledgeName,content from knowledge where id=${fans[i]}`, { type: QueryTypes.SELECT })
        let result = k[0].content
        let content = result.replace(/<[^>]+>/g, '').substring(0, 60)
        obj.id = k[0].id
        obj.content = content
        obj.knowledgeName = k[0].knowledgeName
        data.push(obj)
    }
    res.json({
        code: 1,
        msg: "success",
        data: data
    })
}