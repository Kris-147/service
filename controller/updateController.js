const TaskSchduler = require("../utils/DatabaseUpdate")
const Likes = require("../model/likesModel")
const Favor = require("../model/favorModel")
const { redis } = require("../model/redis/index")

const task = async() => {
    let likes = await redis.hgetall('likes')
    if (likes) {
        for (let i in likes) {
            let ex1 = await Likes.findOne({
                where: {
                    kid: Number(i)
                }
            })
            if (!ex1) {
                let l = await Likes.create({
                    kid: Number(i),
                    uids: likes[i]
                })
            } else {
                let u = await Likes.update({
                    uids: likes[i]
                }, {
                    where: {
                        kid: Number(i)
                    }
                })
            }
        }
    }
    let favor = await redis.hgetall('favor')
    if (favor) {
        for (let i in favor) {
            let ex1 = await Favor.findOne({
                where: {
                    kid: Number(i)
                }
            })
            if (!ex1) {
                let l = await Favor.create({
                    kid: Number(i),
                    uids: favor[i]
                })
            } else {
                let u = await Favor.update({
                    uids: favor[i]
                }, {
                    where: {
                        kid: Number(i)
                    }
                })
            }
        }
    }
}

module.exports = new TaskSchduler('0 0 3 * * *', task)