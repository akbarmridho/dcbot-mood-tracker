import { SlashCommandBuilder } from '@discordjs/builders'
import dayjs from 'dayjs'
import { MessageActionRow, MessageButton, MessageEmbed, User } from 'discord.js'
import { getRecordRange } from '../database/models/record'
import { Command } from '../interfaces/command'
import { BLACK_EMOJI, FIVE_EMOJI, FOUR_EMOJI, ONE_EMOJI, RED_EMOJI, THREE_EMOJI, TWO_EMOJI } from '../interfaces/emojis'
import { sliceIntoChunks } from '../utils/slice-into-chunks'

const moodRate : Map<number, string> = new Map()
moodRate.set(1, ONE_EMOJI)
moodRate.set(2, TWO_EMOJI)
moodRate.set(3, THREE_EMOJI)
moodRate.set(4, FOUR_EMOJI)
moodRate.set(5, FIVE_EMOJI)

const generateEmbed = async (user:User, dateRef: dayjs.Dayjs, type: 'week'|'month') => {
  const from = dateRef.startOf(type).startOf('day')
  const to = dateRef.endOf(type).endOf('day')
  const records = await getRecordRange(user.id, from, to)

  const embed = new MessageEmbed()
  embed.setTitle('User Mood History')
  embed.setAuthor({
    name: user.tag,
    iconURL: user.displayAvatarURL()
  })
  embed.addField('From: ', from.format('DD-MM-YYYY'), true)
  embed.addField('To: ', to.format('DD-MM-YYYY'), true)

  const dayNames = ['\u{1F1F8}', '\u{1F1F2}', '\u{1F1F9}', '\u{1F1FC}', '\u{1F1F9}', '\u{1F1EB}', '\u{1F1F8}']

  if (type === 'week') {
    const weeklyHistory = [RED_EMOJI, RED_EMOJI, RED_EMOJI, RED_EMOJI, RED_EMOJI, RED_EMOJI, RED_EMOJI]

    for (const record of records) {
      weeklyHistory[dayjs(record.createdAt).day()] = moodRate.get(record.moodLevel)!
    }

    embed.setDescription(
      dayNames.join(' ').concat('\n\n').concat(weeklyHistory.join(' '))
    )
  } else {
    const tileCount = (dateRef.endOf('month').day() === 6 ? (dateRef.endOf('month').date() + dateRef.startOf('month').day()) : (dateRef.endOf('month').date() + dateRef.startOf('month').day() + 6 - dateRef.endOf('month').day()))
    const monthlyHistory = []

    for (let i = 0; i < tileCount; i++) {
      if (i >= dateRef.startOf('month').day() && i <= dateRef.endOf('month').date() + dateRef.startOf('month').day() - 1) {
        monthlyHistory.push(RED_EMOJI)
      } else {
        monthlyHistory.push(BLACK_EMOJI)
      }
    }

    for (const record of records) {
      monthlyHistory[record.createdAt.getDate() + dateRef.startOf('month').day() - 1] = moodRate.get(record.moodLevel)
    }

    embed.setDescription(dayNames.join(' ').concat('\n\n').concat(sliceIntoChunks(monthlyHistory, 7).map(row => row.join(' ')).join('\n')))
  }

  return embed
}

export const history: Command = {
  data: new SlashCommandBuilder()
    .setName('history')
    .setDescription('Display record history.')
    .addStringOption(option => option.setName('type')
      .setDescription('Display history range.')
      .addChoices(
        { name: 'Weekly', value: 'week' },
        { name: 'Monthly', value: 'month' }
      )),
  async run (interaction) {
    const message = await interaction.deferReply({ fetchReply: true })
    const type = interaction.options.getString('type', false) || 'week'

    if (!(type === 'week' || type === 'month')) return

    let date = dayjs()

    const embed = await generateEmbed(interaction.user, date, type)

    const row = new MessageActionRow()
      .addComponents(new MessageButton().setCustomId('prev').setLabel('Previous').setStyle('PRIMARY'))
      .addComponents(new MessageButton().setCustomId('next').setLabel('Next').setStyle('PRIMARY'))

    await interaction.editReply({ embeds: [embed], components: [row] })

    const collector = (await interaction.channel?.messages.fetch(message.id))?.createMessageComponentCollector({
      componentType: 'BUTTON',
      time: 30_000
    })

    collector?.on('collect', async i => {
      if (i.user.id === interaction.user.id) {
        if (i.customId === 'prev') {
          date = date.subtract(1, type)
        } else if (i.customId === 'next') {
          date = date.add(1, type)
        }

        await i.deferUpdate()
        await interaction.editReply({ embeds: [await generateEmbed(interaction.user, date, type)], components: [row] })
      } else {
        await i.reply('An error occured')
      }
    })
  }
}
