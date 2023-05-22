const User = require('../model/userModel')
const jwt = require('jsonwebtoken')
const { createToken } = require('../utils/jwt')
const { promisify } = require('util')
const verify = promisify(jwt.verify)
const { uuid } = require('../config/config.default')
const svgCaptcha = require('svg-captcha')
const { Op } = require("sequelize")
const { redis } = require('../model/redis/index')
const mailSend = require("../utils/mail")
const LocalStorage = require("node-localstorage").LocalStorage
localStorage = new LocalStorage('./scratch')


exports.login = async(req, res) => {
    let loginInfo = {
        username: req.body.username,
        password: req.body.password,
        userrole: "admin"
    }
    let code = req.body.code.toLowerCase()
        // console.log(code);
        // console.log(req.session.captcha);
    if (code !== req.session.captcha) {
        res.send({
            code: 0,
            msg: '验证码不正确'
        })
    } else {
        const user = await User.findOne({
                attributes: ['id', 'username'],
                where: {...loginInfo }
            })
            // console.log(user.dataValues);
        if (user) {
            delete req.session.captcha
            let r = Object.assign({}, user.dataValues)
            JSON.stringify(r)
                // console.log(r);
            r.token = await createToken(r)
            console.log(r);
            res.status(200).json({
                code: 1,
                msg: '登录成功',
                data: r
            })
        } else {
            res.status(200).json({
                code: 0,
                msg: '账号或密码错误'
            })
        }
    }
}

exports.getCaptcha = async(req, res) => {
    const cap = svgCaptcha.create({
        inverse: false,
        fontSize: 30,
        noise: 3,
        width: 100,
        height: 40
    })
    req.session.captcha = cap.text.toLowerCase()
        // console.log(req.session)
        // res.json({
        //     code: 200,
        //     msg: 'success',
        //     data: cap.data
        // })
    res.send(cap.data)
}

exports.getAllUser = async(req, res) => {
    const { count, rows } = await User.findAndCountAll({
        offset: Number(req.query.offset),
        limit: Number(req.query.limit),
        where: {
            username: {
                [Op.ne]: "admin"
            }
        }
    })
    let userData = []
    for (let i = 0; i < rows.length; i++) {
        let { id, username, userrole, email, createdAt, updatedAt } = rows[i].dataValues
        let u = {
            id: id,
            username: username,
            userrole: userrole,
            email: email,
            createdAt: createdAt,
            updatedAt: updatedAt
        }
        userData.push(u)
    }
    res.status(200).json({
        code: 1,
        msg: 'success',
        data: { userData, count }
    })
}

exports.updateUser = async(req, res) => {
    let id = req.body.id
    let username = req.body.username
    let email = req.body.email
    if (!username) {
        res.json({
            code: 0,
            msg: "用户名不能为空"
        })
    } else if (!email) {
        res.json({
            code: 0,
            msg: "邮箱不能为空"
        })
    } else {
        User.update({
            username: username,
            email: email
        }, {
            where: {
                id: id
            }
        }).then(r => {
            res.json({
                code: 1,
                msg: "修改成功",
                data: null
            })
        }).catch(err => {
            console.log(err);
            res.json({
                code: 0,
                msg: "邮箱和用户名不能重复",
                data: null
            })
        })
    }
}

exports.addUser = async(req, res) => {
    let name = req.body.username
    let email = req.body.email
    if (!name) {
        res.status(200).json({
            code: 0,
            msg: "用户名不能为空",
            data: null
        })
        return
    } else if (!email) {
        res.status(200).json({
            code: 0,
            msg: "邮箱不能为空",
            data: null
        })
        return
    } else {
        const u = await User.findOne({
            where: {
                username: name
            }
        })
        if (u) {
            res.status(409).json({
                code: 0,
                msg: "用户名已存在",
                data: null
            })
            return
        } else {
            const ee = await User.findOne({
                where: {
                    email: email
                }
            })
            if (ee) {
                res.status(409).json({
                    code: 0,
                    msg: "邮箱已存在",
                    data: null
                })
                return
            }
            User.create({
                username: name,
                password: "12345678",
                userrole: "user",
                email: email
            }).then(r => {
                res.status(201).json({
                    code: 1,
                    msg: "添加成功",
                    data: null
                })
            }).catch(err => {
                res.status(500).json({
                    code: 0,
                    msg: "顺序或名称不能重复",
                    data: null
                })
            })
        }
    }
}

exports.delUser = async(req, res) => {
    let id = req.body.id
    User.destroy({
        where: {
            id: id
        }
    }).then(r => {
        res.json({
            code: 1,
            msg: "删除成功",
            data: null
        })
    }).catch(err => {
        res.json({
            code: 0,
            msg: "删除失败",
            data: null
        })
    })
}

exports.searchUser = async(req, res) => {
    const { count, rows } = await User.findAndCountAll({
        offset: Number(req.query.offset),
        limit: Number(req.query.limit),
        where: {
            username: {
                [Op.ne]: "admin",
                [Op.substring]: req.query.searchName
            }
        }
    })
    let userData = []
    for (let i = 0; i < rows.length; i++) {
        let { id, username, userrole, email, createdAt, updatedAt } = rows[i].dataValues
        let u = {
            id: id,
            username: username,
            userrole: userrole,
            email: email,
            createdAt: createdAt,
            updatedAt: updatedAt
        }
        userData.push(u)
    }
    res.status(200).json({
        code: 1,
        msg: 'success',
        data: { userData, count }
    })
}

exports.userlogin = async(req, res) => {
    let loginInfo = {
        username: req.body.username,
        password: req.body.password,
        userrole: "user"
    }
    let code = req.body.code.toLowerCase()
    if (code !== req.session.captcha) {
        res.send({
            code: 0,
            msg: '验证码不正确'
        })
    } else {
        const user = await User.findOne({
            attributes: ['id', 'username'],
            where: {...loginInfo }
        })
        if (user) {
            delete req.session.captcha
            let r = Object.assign({}, user.dataValues)
            JSON.stringify(r)
                // console.log(r);
            r.token = await createToken(r)
            console.log(r);
            res.status(200).json({
                code: 1,
                msg: '登录成功',
                data: r
            })
        } else {
            res.status(200).json({
                code: 0,
                msg: '账号或密码错误'
            })
        }
    }
}

exports.userreg = async(req, res) => {
    let username = req.body.username
    let password = req.body.password
    let email = req.body.email
    let code = req.body.code

    const e = await User.findAll({
        where: {
            email: email
        }
    })
    if (e.length) {
        res.json({
            code: 0,
            msg: "邮箱已存在",
            data: null
        })
        return
    } else {
        let findPass = localStorage.getItem(req.body.email)
        findPass = JSON.parse(findPass)
        const nowtime = new Date().getTime()
        if (nowtime - findPass.time >= 60 * 1000) {
            res.json({
                code: 0,
                msg: "验证码已过期"
            })
            return
        }
        if (findPass.code == req.body.code) {
            const u = await User.findAll({
                where: {
                    username: username
                }
            })
            if (u.length) {
                res.json({
                    code: 0,
                    msg: "用户名已存在",
                    data: null
                })
            } else {
                const n = await User.create({
                    username: username,
                    password: password,
                    email: email
                })
                if (n) {
                    localStorage.removeItem(findPass.email)
                    res.json({
                        code: 1,
                        msg: "注册成功",
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
        } else {
            res.json({
                code: 0,
                msg: "验证码错误"
            })
        }
    }
}

exports.findpassword = async(req, res) => {
    let email = req.body.email
    let password = req.body.password
    let code = req.body.code

    let findPass = localStorage.getItem(req.body.email)
    findPass = JSON.parse(findPass)
    const nowtime = new Date().getTime()
    if (nowtime - findPass.time >= 60 * 1000) {
        res.json({
            code: 0,
            msg: "验证码已过期"
        })
        return
    }
    if (findPass.code == req.body.code) {
        if (!req.body.password) {
            res.json({
                code: 0,
                msg: "密码不能为空"
            })
            return
        }
        const e = await User.findAll({
            where: {
                email: email
            }
        })
        if (e.length) {
            let updPass = await User.update({
                password: req.body.password
            }, {
                where: {
                    email: req.body.email
                }
            })
            if (updPass) {
                localStorage.removeItem(findPass.email)
                res.json({
                    code: 1,
                    msg: "修改成功"
                })
            }
        } else {
            res.json({
                code: 0,
                msg: "邮箱不存在",
                data: null
            })
        }
    } else {
        res.json({
            code: 0,
            msg: "验证码错误"
        })
    }
}

exports.resetpwd = async(req, res) => {
    let id = req.body.id
    let token = req.headers.authorization
    token = token ? token.split('Bearer ')[1] : null
    let userinfo = await verify(token, uuid)
    let uid = userinfo.userinfo.id
    if (uid == 1) {
        const u = await User.update({
            password: "12345678"
        }, {
            where: {
                id: id
            }
        })
        res.json({
            code: 1,
            msg: "success",
            data: null
        })
    } else {
        res.status(401).json({
            code: 0,
            msg: "unauthorization",
            data: null
        })
    }

}

exports.getCode = async(req, res) => {
    let email = req.body.email
    console.log(email);
    if (!email) {
        res.json({
            code: 0,
            msg: "邮箱不能为空"
        })
        return
    }
    let type = req.body.type
    if (type == "find") {
        const exist = await User.findOne({
            where: {
                email: email
            }
        })
        if (exist) {
            const cap = svgCaptcha.create({
                inverse: false,
                fontSize: 30,
                noise: 3,
                width: 100,
                height: 40
            })
            req.session.emailCaptcha = cap.text.toLowerCase()
            let findPass = {}
            findPass.email = email
            let time = new Date().getTime()
            findPass.time = time
            findPass.code = cap.text.toLowerCase()
            findPass = JSON.stringify(findPass)
            localStorage.setItem(email, findPass)
            let m = {
                from: "<15280889836@163.com>",
                subject: "验证码",
                to: email,
                text: "修改密码验证码为：" + cap.text.toLowerCase() + "(有效时间1分钟)"
            }
            mailSend(m)
            res.json({
                code: 1,
                msg: "发送成功"
            })
            return
        } else {
            res.json({
                code: 0,
                msg: "邮箱不存在"
            })
            return
        }
    } else if (type == "reg") {
        const cap = svgCaptcha.create({
            inverse: false,
            fontSize: 30,
            noise: 3,
            width: 100,
            height: 40
        })
        req.session.emailCaptcha = cap.text.toLowerCase()
        let findPass = {}
        findPass.email = email
        let time = new Date().getTime()
        findPass.time = time
        findPass.code = cap.text.toLowerCase()
        findPass = JSON.stringify(findPass)
        localStorage.setItem(email, findPass)
        let m = {
            from: "<15280889836@163.com>",
            subject: "验证码",
            to: email,
            text: "修改密码验证码为：" + cap.text.toLowerCase() + "(有效时间1分钟)"
        }
        mailSend(m)
        res.json({
            code: 1,
            msg: "发送成功"
        })
        return
    }
}

exports.jiaoyan = async(req, res) => {
    let findPass = localStorage.getItem(req.body.email)
    findPass = JSON.parse(findPass)
    const nowtime = new Date().getTime()
    if (nowtime - findPass.time >= 60 * 1000) {
        res.json({
            code: 0,
            msg: "验证码已过期"
        })
        return
    }
    if (findPass.code == req.body.code) {
        if (!req.body.password) {
            res.json({
                code: 0,
                msg: "密码不能为空"
            })
        }
        let updPass = await User.update({
            password: req.body.password
        }, {
            where: {
                email: req.body.email
            }
        })
        if (updPass) {
            localStorage.removeItem(findPass.email)
            res.json({
                code: 1,
                msg: "修改成功"
            })
        }
    } else {
        res.json({
            code: 0,
            msg: "验证码错误"
        })
    }
}