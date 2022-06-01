import dayjs from 'dayjs'
import { model, Schema } from 'mongoose'

export interface RecordInterface{
  discordId: string,
  emotion: string[],
  emotionSource: string[],
  moodLevel: number,
  createdAt: Date,
  updatedAt: Date
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

export const getRecordRange = async (discordId: string, from: dayjs.Dayjs, to: dayjs.Dayjs) => {
  return await recordModel.find({
    discordId,
    createdAt: {
      $gte: from,
      $lte: to
    }
  })
}
