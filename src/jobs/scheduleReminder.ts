import { CronJob } from 'cron'
import { Client } from 'discord.js'
import { scheduleReminderJob } from './scheduleReminderJob'

export const scheduleReminder = async (client:Client) => {
  const job = new CronJob('0 0 * * *', async () => {
    await scheduleReminderJob(client)
  })

  job.start()
}
