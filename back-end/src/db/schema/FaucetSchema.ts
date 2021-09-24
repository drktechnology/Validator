import { Schema } from 'mongoose'

export const Faucet = {
  ip: String,
  to: String,
  amount: Number,
  txHash: String,
}
