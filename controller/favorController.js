const Favor = require("../model/favorModel")
const { redis } = require("../model/redis/index")
const jwt = require('jsonwebtoken')
const { promisify } = require('util')
const verify = promisify(jwt.verify)
const { uuid } = require('../config/config.default')

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
    let uids = hg.split(",").map(Number)
    let flag = false
    for (let i = 0; i < uids.length; i++) {
        if (uids[i] == uid) {
            flag = true
            break
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
    console.log(hk)
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