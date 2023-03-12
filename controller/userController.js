const User = require('../model/userModel')
const jwt = require('jsonwebtoken')
const { createToken } = require('../utils/jwt')
const svgCaptcha = require('svg-captcha')
const { Op } = require("sequelize")

exports.login = async(req, res) => {
    let loginInfo = {
        username: req.body.username,
        password: req.body.password
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
        let { id, username, userrole } = rows[i].dataValues
        let u = {
            id: id,
            username: username,
            userrole: userrole
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
    if (username) {
        let u = await User.findOne({
            where: {
                username: username
            }
        })
        if (u) {
            res.status(409).json({
                code: 0,
                msg: "用户名不能重复",
                data: null
            })
        } else {
            User.update({
                username: username
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
                res.status(500).json({
                    code: 0,
                    msg: "修改失败",
                    data: null
                })
            })
        }
    } else {
        res.status(200).json({
            code: 0,
            msg: "字段不能为空",
            data: null
        })
    }
}

exports.addUser = async(req, res) => {
    let name = req.body.username
    console.log(name);
    if (!name) {
        res.status(200).json({
            code: 0,
            msg: "字段不能为空",
            data: null
        })
    } else {
        const u = await User.findOne({
            where: {
                username: name
            }
        })
        console.log(u);
        if (u) {
            res.status(409).json({
                code: 0,
                msg: "用户名不能重复",
                data: null
            })
        } else {
            User.create({
                username: name,
                password: "123456",
                userrole: "user"
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
    console.log(req.query.searchName);
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
        let { id, username, userrole } = rows[i].dataValues
        let u = {
            id: id,
            username: username,
            userrole: userrole
        }
        userData.push(u)
    }
    res.status(200).json({
        code: 1,
        msg: 'success',
        data: { userData, count }
    })
}