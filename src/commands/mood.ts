import { SlashCommandBuilder } from '@discordjs/builders'
import { MessageActionRow, MessageSelectMenu, MessageSelectOptionData } from 'discord.js'
import { recordModel } from '../database/models/record'
import { getUser } from '../database/models/user'
import { Command } from '../interfaces/command'
import { jobs } from '../jobs/scheduleReminderJob'

const moodRate = new Map<string, number>()
moodRate.set('1️⃣', 1)
moodRate.set('2️⃣', 2)
moodRate.set('3️⃣', 3)
moodRate.set('4️⃣', 4)
moodRate.set('5️⃣', 5)

const emotions = ['antusias', 'gembira', 'takjub', 'semangat', 'bangga', 'penuh cinta', 'santai', 'tenang', 'puas',
  'marah', 'takut', 'stress', 'waspada', 'kesal', 'malu', 'cemas', 'lesu', 'sedih', 'duka', 'bosan', 'kesepian', 'bingung']

const emotionOptions : MessageSelectOptionData[] = []

for (const emotion of emotions) {
  emotionOptions.push({ label: emotion, value: emotion })
}

const emotionSource = ['keluarga', 'pekerjaan', 'teman', 'percintaan', 'kesehatan', 'pendidikan', 'tidur', 'perjalanan', 'bersantai', 'makanan',
  'olahraga', 'hobi', 'cuaca', 'belanja', 'hiburan', 'keuangan', 'ibadah']

const emotionSourceOptions: MessageSelectOptionData[] = []

for (const emotion of emotionSource) {
  emotionSourceOptions.push({ label: emotion, value: emotion })
}

export const mood: Command = {
  data: new SlashCommandBuilder()
    .setName('mood')
    .setDescription('Record your moood for the day'),
  async run (interaction) {
    const reply = await interaction.reply({ content: 'Rate your mood today!', fetchReply: true })
    const message = await interaction.channel?.messages.fetch(reply.id)

    if (!message) return

    for (const reaction of moodRate.keys()) {
      await message.react(reaction)
    }

    try {
      const reactions = await message.awaitReactions({
        max: 1,
        filter: (reaction, user) => {
          return !!reaction.emoji.name && moodRate.has(reaction.emoji.name) && interaction.user.id === user.id
        },
        time: 20_000
      })

      if (reactions.size === 0) {
        throw Error('No reactions collected')
      }

      const rate = moodRate.get(reactions.first()?.emoji.name!)

      await message.edit(`Rate mood anda adalah ${rate}`)
      await message.reactions.removeAll()

      const emotionRow = new MessageActionRow().addComponents(
        new MessageSelectMenu()
          .setCustomId('emotion')
          .setPlaceholder('Nothing selected')
          .setMinValues(1)
          .setMaxValues(5)
          .addOptions(emotionOptions)
      )

      const messageEmotion = await interaction.channel?.messages.fetch((
        await interaction.followUp({
          content: 'Emosi apa saja yang sedang kamu rasakan?',
          components: [emotionRow],
          fetchReply: true
        })).id)

      const emotions = await messageEmotion?.awaitMessageComponent({
        filter: (i) => {
          i.deferUpdate()
          return i.user.id === interaction.user.id
        },
        componentType: 'SELECT_MENU',
        time: 30_000
      })

      await messageEmotion?.edit({ content: `Emosi anda adalah ${emotions?.values.join(', ')}`, components: [] })

      const emotionSourceRow = new MessageActionRow().addComponents(
        new MessageSelectMenu()
          .setCustomId('emotion-cause')
          .setPlaceholder('Nothing selected')
          .setMinValues(1)
          .setMaxValues(5)
          .addOptions(emotionSourceOptions)
      )

      const messageEmotionSource = await interaction.channel?.messages.fetch(
        (
          await interaction.followUp({
            content: 'Dari mana datangnya emosi tersebut?',
            components: [emotionSourceRow],
            fetchReply: true
          })
        ).id
      )

      const emotionSources = await messageEmotionSource?.awaitMessageComponent({
        filter: (i) => {
          i.deferUpdate()
          return i.user.id === interaction.user.id
        },
        componentType: 'SELECT_MENU',
        time: 30_000
      })

      await messageEmotionSource?.edit({ content: `Sumber emosi anda adalah ${emotionSources?.values.join(', ')}`, components: [] })

      const user = await getUser(interaction.user.id)
      await recordModel.create({
        discordId: user.discordId,
        emotion: emotions?.values,
        emotionSource: emotionSources?.values,
        moodLevel: rate
      })

      if (user.reminder) {
        if (jobs.has(user.discordId)) {
          jobs.get(user.discordId)?.stop()
        }
      }

      await interaction.followUp('Mood berhasil tercatat!')
    } catch (error) {
      await interaction.followUp('Input gagal karena batas waktu untuk menjawab telah berakhir')
    }
  }
}
