const e = require('express')
const jwt = require('jsonwebtoken')
const { promisify } = require('util')
const { uuid } = require('../config/config.default')

const toJwt = promisify(jwt.sign)
const verify = promisify(jwt.verify)

module.exports.createToken = async userinfo => {
    return await toJwt({ userinfo }, uuid, {
        expiresIn: 60 * 60 * 24
    })
}

module.exports.verifyToken = function(required = true) {
    return async(req, res, next) => {
        let token = req.headers.Authorization
        token = token ? token.split('Bearer ')[1] : null
        if (token) {
            try {
                let userinfo = await verify(token, uuid)
                JSON.stringify(userinfo)
                delete userinfo.password
                req.user = userinfo
                next()
            } catch (error) {
                res.status(402).json({
                    code: 402,
                    msg: '登录信息无效,请重新登录',
                    data: null
                })
            }
        } else if (required) {
            res.status(402).json({
                code: 402,
                msg: '请先登录',
                data: null
            })
        } else {
            next()
        }
    }
}