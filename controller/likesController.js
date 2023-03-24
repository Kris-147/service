const Favor = require("../model/favorModel")
const { redis } = require("../model/redis/index")
const jwt = require('jsonwebtoken')
const { promisify } = require('util')
const verify = promisify(jwt.verify)
const { uuid } = require('../config/config.default')

exports.addlikes = async(req, res) => {
    let token = req.headers.authorization
    token = token ? token.split('Bearer ')[1] : null
    let userinfo = await verify(token, uuid)
    let uid = userinfo.userinfo.id

    let kid = req.body.kid
    let g = await redis.hget('likes', kid)
    let m = new Map()
    if (g) {
        let uids = g.split(",").map(Number)
        uids.push(uid)
        uids = [...new Set(uids)]
        let str = uids.join(',')
        m.set(kid, str)
        let s = await redis.hset('likes', m)
    } else {
        m.set(kid, String(uid))
        let s1 = await redis.hset('likes', m)
    }
    res.json({
        code: 1,
        msg: "点赞成功",
        data: null
    })
}

exports.dellikes = async(req, res) => {
    let token = req.headers.authorization
    token = token ? token.split('Bearer ')[1] : null
    let userinfo = await verify(token, uuid)
    let uid = userinfo.userinfo.id

    let kid = req.body.kid
    let v = await redis.hget('likes', kid)
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
    let hs = await redis.hset('likes', m)
    res.json({
        code: 1,
        msg: "取消点赞成功",
        data: null
    })
}

exports.islikes = async(req, res) => {
    let token = req.headers.authorization
    token = token ? token.split('Bearer ')[1] : null
    let userinfo = await verify(token, uuid)
    let uid = userinfo.userinfo.id
    let kid = req.body.kid
    let hg = await redis.hget('likes', kid)
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

exports.count = async(req, res) => {
    let kid = req.query.kid
    let c = await redis.hget('likes', kid)
    let count = 0
    if (c) {
        count = c.split(",").length
    }
    res.json({
        code: 1,
        msg: "success",
        data: count
    })
}