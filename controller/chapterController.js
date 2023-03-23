const Chapter = require("../model/chapterModel")
const Chapter_Merge_Knowledge = require("../model/chapter_merge_knowledgeModel")
const jwt = require('jsonwebtoken')
const { createToken } = require('../utils/jwt')
const sequelize = require("../model")
const { Op, QueryTypes } = require("sequelize")

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
    const cmk = await Chapter_Merge_Knowledge.findAll({
        where: {
            cid: id
        }
    })
    if (cmk.length) {
        res.json({
            code: 0,
            msg: "删除失败，章节内还含有知识点"
        })
    } else {
        const c = await Chapter.findOne({
            where: {
                id: id
            }
        })
        if (c) {
            Chapter.destroy({
                where: {
                    id: id
                }
            }).then(r => {
                res.json({
                    code: 1,
                    msg: "删除成功",
                })
            }).catch(err => {
                res.json({
                    code: 0,
                    msg: "删除失败",
                })
            })
        } else {
            res.json({
                code: 0,
                msg: "不存在该章节"
            })
        }

    }
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

exports.getAllChapter = async(req, res) => {
    const c = await Chapter.findAll({
        order: [
            ["chapterSort", "ASC"]
        ]
    })
    let chapterData = []
    for (let i = 0; i < c.length; i++) {
        let { id, chapterName } = c[i].dataValues
        let d = {
            id: id,
            chapterName: chapterName
        }
        chapterData.push(d)
    }
    res.json({
        code: 1,
        msg: "success",
        data: chapterData
    })
}

exports.usergetall = async(req, res) => {
    const result = await sequelize.query('SELECT chapterName,knowledge.id,knowledgeName FROM chapter,knowledge,chapter_merge_knowledge WHERE chapter.id = chapter_merge_knowledge.cid AND knowledge.id = chapter_merge_knowledge.kid ORDER BY chapterSort,knowledgeSort', { type: QueryTypes.SELECT })
    const ans = []
    let cn = result[0].chapterName
    let kn = result[0].knowledgeName
    let obj = { chapterName: cn, children: [{ knowledgeName: kn, kid: result[0].id }] }
    for (let i = 1; i < result.length; i++) {
        if (result[i].chapterName == cn) {
            let o = { knowledgeName: result[i].knowledgeName, kid: result[i].id }
            obj.children.push(o)
        } else {
            ans.push(obj)
            cn = result[i].chapterName
            obj = { chapterName: cn, children: [{ knowledgeName: result[i].knowledgeName, kid: result[i].id }] }
        }
    }
    ans.push(obj)
    res.json({
        code: 1,
        msg: "success",
        data: ans
    })
}

exports.getcontent = async(req, res) => {
    let kid = req.query.kid
    const result = await sequelize.query(`SELECT chapter.chapterName,knowledge.knowledgeName,knowledge.content,knowledge.updatedAt,chapter.chapterSort,knowledge.knowledgeSort from chapter,knowledge,chapter_merge_knowledge WHERE knowledge.id=${kid} AND kid=${kid} AND chapter.id=cid`, { type: QueryTypes.SELECT })
    res.json({
        code: 1,
        msg: "success",
        data: result[0]
    })
}