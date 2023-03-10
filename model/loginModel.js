const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('./index')

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    userrole: {
        type: DataTypes.STRING,
        defaultValue: "user"
    }
}, {
    freezeTableName: true
})

// async function tongbu() {
//     await sequelize.sync({ force: true });
//     console.log("所有模型均已成功同步.");
// }

// tongbu()

module.exports = User