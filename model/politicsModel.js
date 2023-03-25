const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('./index')

const Politics = sequelize.define('Politics', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    kid: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    iname: {
        type: DataTypes.STRING,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    freezeTableName: true
})


module.exports = Politics