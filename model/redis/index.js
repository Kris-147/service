const Redis = require('ioredis')
const { redisConfig } = require("../../config/config.default")

const redis = new Redis(redisConfig)

redis.on('error', err => {
    if (err) {
        console.log(err);
        redis.quit()
    }
})

redis.on('ready', () => {
    console.log('redis ready');
})

exports.redis = redis