import { Client } from 'discord.js'
import { scheduleReminder } from '../jobs/scheduleReminder'
import { scheduleReminderJob } from '../jobs/scheduleReminderJob'
import { updateCommands } from '../jobs/updateCommands'

export const onReady = async (client:Client) => {
  await updateCommands()
  await scheduleReminderJob(client)
  await scheduleReminder(client)

  console.log('Bot ready')
}
