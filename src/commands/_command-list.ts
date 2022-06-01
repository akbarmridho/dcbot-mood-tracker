import { Command } from '../interfaces/command'
import { Collection } from 'discord.js'
import { help } from './help'
import { mood } from './mood'
import { remind } from './remind'
import { history } from './history'
import { show } from './show'

const commandList : Command[] = [help, mood, remind, history, show]

const commandCollection: Collection<string, Command> = new Collection()

for (const command of commandList) {
  commandCollection.set(command.data.name, command)
}

export {
  commandCollection,
  commandList
}
