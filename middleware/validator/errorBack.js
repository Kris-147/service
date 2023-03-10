const { body, validationResult } = require('express-validator')

module.exports = validator => {
    return async(req, res, next) => {
        await Promise.all(validator.map(validate => validate.run(req)))
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(401).json({
                code: 401,
                msg: errors.errors[0].msg,
                data: null
            })
        }
        next()
    }
}