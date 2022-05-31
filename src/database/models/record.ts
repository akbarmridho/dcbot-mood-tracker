import { model, Schema, SchemaTimestampsConfig } from 'mongoose'

export interface RecordInterface extends SchemaTimestampsConfig{
  discordId: string,
  emotion: string[],
  emotionSource: string[],
  moodLevel: number
}

export const recordSchema = new Schema<RecordInterface>(
  {
    discordId: { type: String, required: true },
    emotion: [{ type: String, lowercase: true }],
    emotionSource: [{ type: String, lowercase: true }],
    moodLevel: { type: Number, min: 1, max: 5, required: true }
  },
  { timestamps: true }
)

export const recordModel = model<RecordInterface>('Record', recordSchema)
