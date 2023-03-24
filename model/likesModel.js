const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('./index')

const Likes = sequelize.define('Likes', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    kid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    },
    uids: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    freezeTableName: true
})

module.exports = Likes