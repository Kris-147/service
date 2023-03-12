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