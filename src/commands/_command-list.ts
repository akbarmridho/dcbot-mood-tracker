import { Command } from '../interfaces/command'
import { Collection } from 'discord.js'
import { help } from './help'
import { mood } from './mood'

const commandList : Command[] = [help, mood]

const commandCollection: Collection<string, Command> = new Collection()

for (const command of commandList) {
  commandCollection.set(command.data.name, command)
}

export {
  commandCollection,
  commandList
}
