const User = require('../model/loginModel')
const jwt = require('jsonwebtoken')
const { createToken } = require('../utils/jwt')
const svgCaptcha = require('svg-captcha')

exports.login = async(req, res) => {
    let loginInfo = {
        username: req.body.username,
        password: req.body.password
    }
    let code = req.body.code.toLowerCase()
    console.log(code);
    console.log(req.session.captcha);
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
            r.token = await createToken(r)
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