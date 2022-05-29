import { model, Schema } from 'mongoose'

export interface UserInterface {
  discordId: string,
  reminder: boolean,
  reminderTime: string
}

export const userSchema = new Schema<UserInterface>(
  {
    discordId: String,
    reminder: { type: Boolean, default: false },
    reminderTime: { type: String, default: '00:00' }
  }
)

export const userModel = model<UserInterface>('User', userSchema)

export const getUser = async (id: string) => {
  return (await userModel.findOne({ discordId: id })) ||
    (await userModel.create({
      discordId: id
    }))
}
