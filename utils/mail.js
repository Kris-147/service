const nodemailer = require('nodemailer')
const { mailConfig } = require('../config/config.default')

const config = {
    host: mailConfig.host,
    port: mailConfig.port,
    auth: mailConfig.auth
}

const transporter = nodemailer.createTransport(config)

module.exports = function(mail) {
    transporter.sendMail(mail, function(err, info) {
        if (err) {
            return console.log(err)
        }
        console.log('mail sent:', info.response);
    })
}