const Chapter = require("../model/chapterModel")
const jwt = require('jsonwebtoken')
const { createToken } = require('../utils/jwt')
const sequelize = require("../model")
const { Op } = require("sequelize")

exports.getallchapter = async(req, res) => {
    const { count, rows } = await Chapter.findAndCountAll({
        order: [
            ["chapterSort", "ASC"]
        ],
        offset: Number(req.query.offset),
        limit: Number(req.query.limit)
    })
    let chapterData = []
    for (let i = 0; i < rows.length; i++) {
        let { id, chapterName, chapterSort } = rows[i].dataValues
        let d = {
            id: id,
            chapterName: chapterName,
            chapterSort: chapterSort
        }
        chapterData.push(d)
    }
    // console.log(count);
    res.status(200).json({
        code: 1,
        msg: 'success',
        data: { chapterData, count }
    })
}

exports.updateChapterName = async(req, res) => {
    let id = req.body.id
    let name = req.body.chapterName
    let sort = req.body.chapterSort
    if (!name || !sort) {
        res.status(200).json({
            code: 0,
            msg: "字段不能为空",
            data: null
        })
    } else {
        Chapter.update({
            chapterName: name,
            chapterSort: sort
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
            res.json({
                code: 0,
                msg: "字段名不能重复",
                data: null
            })
        })
    }
}

exports.addChapterName = async(req, res) => {
    let name = req.body.chapterName
    let sort = req.body.chapterSort
    const n = await Chapter.findOne({
        where: {
            [Op.or]: [
                { chapterName: name },
                { chapterSort: sort }
            ]
        }
    })
    if (n) {
        res.json({
            code: 0,
            msg: "顺序或名称不能重复",
            data: null
        })
    } else {
        const nc = await Chapter.create({
            chapterName: name,
            chapterSort: sort
        })
        res.status(201).json({
            code: 1,
            msg: "添加成功",
            data: null
        })
    }

}

exports.delChapterName = async(req, res) => {
    let id = req.body.id
    Chapter.destroy({
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

exports.searchChapter = async(req, res) => {
    const { count, rows } = await Chapter.findAndCountAll({
        order: [
            ["chapterSort", "ASC"]
        ],
        offset: Number(req.query.offset),
        limit: Number(req.query.limit),
        where: {
            chapterName: {
                [Op.substring]: req.query.searchName
            }
        }
    })
    let chapterData = []
    for (let i = 0; i < rows.length; i++) {
        let { id, chapterName, chapterSort } = rows[i].dataValues
        let d = {
            id: id,
            chapterName: chapterName,
            chapterSort: chapterSort
        }
        chapterData.push(d)
    }
    res.status(200).json({
        code: 1,
        msg: 'success',
        data: { chapterData, count }
    })
}