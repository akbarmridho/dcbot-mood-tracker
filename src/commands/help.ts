import { SlashCommandBuilder } from '@discordjs/builders'
import { MessageEmbed } from 'discord.js'
import { Command } from '../interfaces/command'

export const help: Command = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Provides information on using this bot.'),
  async run (interaction) {
    await interaction.deferReply()
    const embed = new MessageEmbed()
    embed.setTitle('100 days of code bot!')
    embed.setDescription(
      'This discord bot is designed to help you track and share your 100 days of code progress'
    )
    embed.addField(
      "Create today's update",
      "Use the '/100' command to create your update for today. The 'message' will be displayed in your embed"
    )
    embed.addField(
      "Edit today's update",
      "Do you see a typo in your embed? Right click it and copy the ID (you may need developer mode on this), and use the '/edit' command to update that embed with a new message"
    )
    embed.addField(
      'Show your progress',
      "To see your current progress in the challenge, and the day you last checked in, use '\\view'"
    )
    embed.setFooter({ text: `Version ${process.env.npm_package_version}` })
    await interaction.editReply({ embeds: [embed] })
  }
}
