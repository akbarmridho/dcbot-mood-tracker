import { CronJob } from 'cron'
import dayjs from 'dayjs'
import { Client } from 'discord.js'
import { userModel } from '../database/models/user'
import { userMention } from '@discordjs/builders'

export const scheduleReminderJob = async (client:Client) => {
  const now = dayjs()
  const users = (await userModel.find({ reminder: true })).filter(user => {
    const [hour, minutes] = user.reminderTime.split(':')
    if (parseInt(hour) === now.hour()) {
      return parseInt(minutes) > now.minute()
    }

    return parseInt(hour) > now.hour()
  })

  // To do: bagaimana jika user sudah mengisi mood hari ini?

  for (const user of users) {
    const [hour, minutes] = user.reminderTime.split(':')
    const schedule = dayjs().minute(parseInt(minutes)).hour(parseInt(hour)).second(0)

    const job = new CronJob(schedule.toDate(), async () => {
      const channel = await client.channels.fetch(user.reminderChannel!)
      if (channel && channel.type === 'GUILD_TEXT') {
        await channel.send(`${userMention(user.discordId)} Don't forget to track your daily mood.`)
      }
    })

    job.start()
  }

  console.log(`Scheduled ${users.length} reminder`)
}
