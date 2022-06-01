import { SlashCommandBuilder } from '@discordjs/builders'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { MessageEmbed } from 'discord.js'
import { getRecordRange } from '../database/models/record'
import { Command } from '../interfaces/command'
import { alternateJoin } from '../utils/alternate-join'

dayjs.extend(customParseFormat)

export const show: Command = {
  data: new SlashCommandBuilder()
    .setName('show')
    .setDescription('Show a mood record details.')
    .addStringOption(option => option.setName('date')
      .setDescription('Date in DD-MM-YYYY format')
      .setRequired(true)),
  async run (interaction) {
    await interaction.deferReply()

    const date = dayjs(interaction.options.getString('date', true), ['DD-MM-YYYY', 'D-M-YYYY'], true)

    if (date.isValid()) {
      const records = await getRecordRange(interaction.user.id, date.startOf('day'), date.endOf('day'))

      if (records.length === 0) {
        await interaction.editReply(`Tidak ditemukan riwayat pada tanggal ${date.format('DD-MM-YYYY')}.`)
      } else {
        const embed = new MessageEmbed()
        embed.setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
        embed.setTitle('User Mood Record')
        embed.addField('Tanggal', date.format('DD-MM-YYYY'))
        embed.addField('Mood level', records[0].moodLevel.toString())
        embed.addField('Emosi yang dirasakan', alternateJoin(records[0].emotion))
        embed.addField('Sumber emosi', alternateJoin(records[0].emotionSource))

        await interaction.editReply({ embeds: [embed] })
      }
    } else {
      await interaction.editReply('Masukan tidak valid!')
    }
  }
}
