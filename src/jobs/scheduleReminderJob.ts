import { CronJob } from 'cron'
import dayjs from 'dayjs'
import { Client } from 'discord.js'
import { userModel } from '../database/models/user'
import { userMention } from '@discordjs/builders'
import { recordModel } from '../database/models/record'

export const jobs:Map<string, CronJob> = new Map()

export const scheduleReminderJob = async (client:Client) => {
  const now = dayjs()
  const users = (await userModel.find({ reminder: true })).filter(user => {
    const [hour, minutes] = user.reminderTime.split(':')
    if (parseInt(hour) === now.hour()) {
      return parseInt(minutes) > now.minute()
    }

    return parseInt(hour) > now.hour()
  })

  const records = (await recordModel.find({
    createdAt: { $gte: now.hour(0).minute(0).second(0).millisecond(0).toDate() },
    discordId: {
      $in: users.map(user => {
        return user.discordId
      })
    }
  }))

  let i = 0

  for (const user of users) {
    const [hour, minutes] = user.reminderTime.split(':')
    const schedule = dayjs().minute(parseInt(minutes)).hour(parseInt(hour)).second(0)

    if (!records.find(record => record.discordId === user.discordId)) {
      const job = new CronJob(schedule.toDate(), async () => {
        const channel = await client.channels.fetch(user.reminderChannel!)
        if (channel && channel.type === 'GUILD_TEXT') {
          await channel.send(`${userMention(user.discordId)} Don't forget to track your daily mood.`)
        }
      })

      job.start()
      jobs.set(user.discordId, job)
      i++
    }
  }

  console.log(`Scheduled ${i} reminder`)
}
