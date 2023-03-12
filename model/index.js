const { Sequelize, DataTypes } = require('sequelize')

const sequelize = new Sequelize('teachingweb', 'root', '123456', {
    host: 'localhost',
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    logging: console.log
})

async function main() {
    try {
        await sequelize.authenticate();
        console.log('mysql连接成功');

    } catch (error) {
        console.error('连接失败:', error);
    }
}
main()

module.exports = sequelize