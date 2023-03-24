const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('./index')

const Favor = sequelize.define('Favor', {
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

module.exports = Favor