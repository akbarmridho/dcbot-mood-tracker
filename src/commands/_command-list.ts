import { Command } from '../interfaces/command'
import { Collection } from 'discord.js'
import { help } from './help'
import { mood } from './mood'
import { remind } from './remind'

const commandList : Command[] = [help, mood, remind]

const commandCollection: Collection<string, Command> = new Collection()

for (const command of commandList) {
  commandCollection.set(command.data.name, command)
}

export {
  commandCollection,
  commandList
}
