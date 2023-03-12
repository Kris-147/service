const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('./index')

const Chapter = sequelize.define("Chapter", {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    chapterName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    chapterSort: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    }
}, {
    freezeTableName: true
})


module.exports = Chapter