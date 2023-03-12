const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('./index')

const Chapter_Merge_Knowledge = sequelize.define("Chapter_Merge_Knowledge", {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    cid: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    kid: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    freezeTableName: true
})

module.exports = Chapter_Merge_Knowledge