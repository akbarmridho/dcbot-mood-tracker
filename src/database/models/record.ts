import { model, Schema } from 'mongoose'

export interface RecordInterface {
  discordId: string,
  emotion: string[],
  cause: string[],
  moodLevel: number,
  comment: string
}

export const recordSchema = new Schema<RecordInterface>(
  {
    discordId: { type: String, required: true },
    emotion: [{ type: String, lowercase: true }],
    cause: [{ type: String, lowercase: true }],
    moodLevel: { type: Number, min: 1, max: 5, required: true },
    comment: String
  }
)

export const recordModel = model<RecordInterface>('Record', recordSchema)
