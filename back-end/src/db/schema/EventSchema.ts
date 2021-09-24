import { Schema } from 'mongoose'

export const Event = {
  validator: Schema.Types.ObjectId,
  name: String,
  blockNumber: Number,
  data: Object
}
