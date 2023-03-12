const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('./index')

const Knowledge = sequelize.define('Knowledge', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    knowledgeName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    freezeTableName: true
})

module.exports = Knowledge