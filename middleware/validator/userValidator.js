const { body, validationResult } = require('express-validator')
const validate = require('./errorBack')

module.exports.login = validate([
    body('username')
    .notEmpty().withMessage('用户名不能为空').bail(),
    body('password')
    .notEmpty().withMessage('密码不能为空').bail(),
    body('code')
    .notEmpty().withMessage('验证码不能为空').bail()
])

module.exports.reg = validate([
    body('username')
    .notEmpty().withMessage('用户名不能为空').bail()
    .isLength({ min: 5, max: 10 }).withMessage("用户名长度为5到10位").bail(),
    body('password')
    .notEmpty().withMessage('密码不能为空').bail()
    .isLength({ min: 8, max: 16 }).withMessage("密码长度为8到16位").bail(),
    body('email')
    .notEmpty().withMessage('邮箱不能为空').bail()
    .isEmail().withMessage("邮箱格式不正确").bail(),
])

module.exports.find = validate([
    body('password')
    .notEmpty().withMessage('密码不能为空').bail()
    .isLength({ min: 8, max: 16 }).withMessage("密码长度为8到16位").bail(),
    body('email')
    .notEmpty().withMessage('邮箱不能为空').bail()
    .isEmail().withMessage("邮箱格式不正确").bail(),
])