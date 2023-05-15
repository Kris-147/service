const schedule = require("node-schedule")

/*
 * TODO:编写 Cron 表达式时，有五个占位符可以使用，分别表示分钟、小时、日期、月份和星期几。
 *      每个占位符可以使用特定的值、值范围、逗号分隔的值列表和通配符等等
 *
 *       * * * * * *
 *       | | | | | |
 *       | | | | | day of week
 *       | | | | month
 *       | | | day of month
 *       | | hour
 *       | minute
 *       second ( optional )
 *
 *      示例 Cron 表达式：
 *           每分钟的第30秒触发： 30 * * * * *
 *           每小时的1分30秒触发 ：30 1 * * * *
 *           每天的凌晨1点1分30秒触发 ：30 1 1 * * *
 *           每月的1日1点1分30秒触发 ：30 1 1 1 * *
 *           每年的1月1日1点1分30秒触发 ：30 1 1 1 1 *
 *           每周1的1点1分30秒触发 ：30 1 1 * * 1
 * */
class TaskSchduler {
    constructor(cronExpression, task) {
        this.cronExpression = cronExpression
        this.task = task
        this.job = null
    }

    start() {
        if (!this.job) {
            this.job = schedule.scheduleJob(this.cronExpression, this.task)
            console.log('定时任务启动', this.cronExpression);
        }
    }

    stop() {
        if (this.job) {
            this.job.cancel()
            console.log('定时任务停止', this.cronExpression);
            this.job = null
        }
    }
}

module.exports = TaskSchduler