const Knowledge = require("../model/knowledgeModel")
const Chapter_Merge_Knowledge = require("../model/chapter_merge_knowledgeModel")
const jwt = require('jsonwebtoken')
const { createToken } = require('../utils/jwt')
const sequelize = require("../model")
const { Op } = require("sequelize")
const { promisify } = require('util')
const fs = require('fs')
const rename = promisify(fs.rename)
    // const driver = require('../model/neo4j/index')
const neo4j = require('neo4j-driver')


exports.getKnowledgeByChapterId = async(req, res) => {
    const kids = await Chapter_Merge_Knowledge.findAll({
        where: {
            cid: req.query.chapterId
        }
    })
    let k = []
    for (let i = 0; i < kids.length; i++) {
        k.push(kids[i].dataValues.kid)
    }
    const { count, rows } = await Knowledge.findAndCountAll({
        where: {
            id: {
                [Op.in]: k
            }
        },
        order: [
            ["knowledgeSort", "ASC"]
        ],
        offset: Number(req.query.offset),
        limit: Number(req.query.limit)
    })
    let knowledgeData = []
    for (let i = 0; i < rows.length; i++) {
        let { id, knowledgeName, knowledgeSort } = rows[i].dataValues
        let d = {
            id: id,
            knowledgeName: knowledgeName,
            knowledgeSort: knowledgeSort
        }
        knowledgeData.push(d)
    }
    res.json({
        code: 1,
        msg: "success",
        data: {
            knowledgeData,
            count
        }
    })
}

exports.searchByChapterId = async(req, res) => {
    const kids = await Chapter_Merge_Knowledge.findAll({
        where: {
            cid: req.query.chapterId
        }
    })
    let k = []
    for (let i = 0; i < kids.length; i++) {
        k.push(kids[i].dataValues.kid)
    }
    const { count, rows } = await Knowledge.findAndCountAll({
        where: {
            [Op.and]: [{
                id: {
                    [Op.in]: k
                }
            }, {
                knowledgeName: {
                    [Op.substring]: req.query.searchName
                }
            }]
        },
        offset: Number(req.query.offset),
        limit: Number(req.query.limit),
        order: [
            ["knowledgeSort", "ASC"]
        ]
    })
    let knowledgeData = []
    for (let i = 0; i < rows.length; i++) {
        let { id, knowledgeName, knowledgeSort } = rows[i].dataValues
        let d = {
            id: id,
            knowledgeName: knowledgeName,
            knowledgeSort: knowledgeSort
        }
        knowledgeData.push(d)
    }
    res.json({
        code: 1,
        msg: "success",
        data: {
            knowledgeData,
            count
        }
    })
}

exports.contentImg = async(req, res) => {
    let fileArr = req.file.originalname.split(".")
    console.log(fileArr);
    let fileType = fileArr[fileArr.length - 1]
    try {
        await rename("./public/images/" + req.file.filename, './public/images/' + req.file.filename + '.' + fileType)
        res.send({
            errno: 0,
            data: {
                url: 'http://127.0.0.1:3000/images/' + req.file.filename + '.' + fileType,
                alt: req.file.filename + '.' + fileType,
                href: ""
            }
        })
    } catch (err) {
        res.send({
            "errno": 1, // 只要不等于 0 就行
            "message": err
        })
    }
}

exports.addKnowledge = async(req, res) => {
    if (!req.body.knowledgeName) {
        res.json({
            code: 0,
            msg: "知识点名字不能为空"
        })
    }
    if (!req.body.knowledgeSort) {
        res.json({
            code: 0,
            msg: "知识点顺序不能为空"
        })
    }
    const kids = await Chapter_Merge_Knowledge.findAll({
        where: {
            cid: req.body.chapterId
        }
    })
    let k = []
    for (let i = 0; i < kids.length; i++) {
        k.push(kids[i].dataValues.kid)
    }
    const r = await Knowledge.findAll({
        where: {
            id: {
                [Op.in]: k
            }
        }
    })
    for (let i = 0; i < r.length; i++) {
        if (r[i].dataValues.knowledgeName == req.body.knowledgeName) {
            res.json({
                code: 0,
                msg: "知识点名称不能重复",
                data: null
            })
        } else if (r[i].dataValues.knowledgeSort == req.body.knowledgeSort) {
            res.json({
                code: 0,
                msg: "同一章节的知识点顺序不能重复",
                data: null
            })
        }
    }
    const insertk = await Knowledge.create({
        knowledgeName: req.body.knowledgeName,
        content: req.body.content,
        knowledgeSort: req.body.knowledgeSort
    })
    const insertMerge = await Chapter_Merge_Knowledge.create({
        cid: req.body.chapterId,
        kid: insertk.dataValues.id
    })
    res.json({
        code: 1,
        msg: "添加成功"
    })
}

exports.delKnowledge = async(req, res) => {
    let kid = req.body.id
    const delk = Knowledge.destroy({
        where: {
            id: kid
        }
    })
    const delmerge = Chapter_Merge_Knowledge.destroy({
        where: {
            kid: kid
        }
    })
    res.json({
        code: 1,
        msg: "删除成功"
    })
}

exports.getContent = async(req, res) => {
    let kid = req.query.id
    let r = await Knowledge.findOne({
        where: {
            id: kid
        },
        attributes: ["content"]
    })
    res.json({
        code: 1,
        msg: "获取成功",
        data: r.dataValues
    })
}

exports.updateKnowledge = async(req, res) => {
    let id = req.body.id
    let kn = req.body.knowledgeName
    let ks = req.body.knowledgeSort
    let c = req.body.content

    if (!kn) {
        res.json({
            code: 0,
            msg: "知识点名称不能为空"
        })
        return;
    }

    if (!ks) {
        res.json({
            code: 0,
            msg: "知识点顺序不能为空"
        })
        return;
    }

    const skn = await Knowledge.findAll({
        where: {
            knowledgeName: kn
        }
    })
    for (let i = 0; i < skn.length; i++) {
        if (skn[i].dataValues.id != id) {
            res.json({
                code: 0,
                msg: "知识点名称不能重复"
            })
            return;
        }
    }

    const sks = await Knowledge.findAll({
        where: {
            knowledgeSort: ks
        }
    })
    for (let i = 0; i < sks.length; i++) {
        if (sks[i].dataValues.id != id) {
            res.json({
                code: 0,
                msg: "知识点顺序不能重复"
            })
            return;
        }
    }

    const uk = await Knowledge.update({
        knowledgeName: kn,
        knowledgeSort: ks,
        content: c
    }, {
        where: {
            id: id
        }
    })
    res.json({
        code: 1,
        msg: "更新成功"
    })
}

exports.getmap = async(req, res) => {
    const driver = neo4j.driver('neo4j://localhost:7687', neo4j.auth.basic('neo4j', '12345678'))
    const session = driver.session()
    const relation = '包含'
    const result = await session.executeRead(tx =>
        tx.run(
            `match (c:Chapter)-[r:${relation}]->(k:Knowledge) return c,r,k`
        )
    )
    const records = result.records
    console.log(records[0].get(0));
    console.log(records[0].get(1));
    console.log(records[0].get(2));
    await session.close()
    await driver.close()
    res.send('11')
}