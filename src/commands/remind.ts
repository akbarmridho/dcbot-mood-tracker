import { SlashCommandBuilder } from '@discordjs/builders'
import { getUser } from '../database/models/user'
import { Command } from '../interfaces/command'

export const remind: Command = {
  data: new SlashCommandBuilder()
    .setName('remind')
    .setDescription('Ask the bot to remind you daily in this channel')
    .addBooleanOption(option => option.setName('remind')
      .setDescription('Set the reminder on or off')
      .setRequired(true))
    .addStringOption(option => option.setName('time')
      .setDescription('Time for the bot to remind you in HH:MM format')
      .setRequired(true)),
  async run (interaction) {
    await interaction.deferReply()
    const remind = interaction.options.getBoolean('remind', true)

    try {
      const [hour, minute] = interaction.options.getString('time', true).split(':')

      if (hour === undefined || hour === null || minute === undefined || minute === null) throw Error()

      const validHour = parseInt(hour) >= 0 && parseInt(hour) <= 23
      const validMinute = parseInt(minute) >= 0 && parseInt(minute) <= 60

      if (validHour && validMinute) {
        if (!interaction.channel) throw Error()

        const user = await getUser(interaction.user.id)
        user.reminderTime = interaction.options.getString('time', true)
        user.reminderChannel = interaction.channel.id
        user.reminder = remind
        await user.save()

        interaction.editReply(`Reminder has ben set every ${hour}:${minute}`)
      }
    } catch (error) {
      interaction.editReply('Masukan tidak valid!')
    }
  }
}
