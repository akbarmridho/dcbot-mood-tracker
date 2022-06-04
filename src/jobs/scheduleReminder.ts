import { CronJob } from 'cron'
import { Client } from 'discord.js'
import { jobs, scheduleReminderJob } from './scheduleReminderJob'

export const scheduleReminder = async (client:Client) => {
  const job = new CronJob('0 0 * * *', async () => {
    jobs.forEach(each => each.stop())
    jobs.clear()

    await scheduleReminderJob(client)
  })

  job.start()
}
