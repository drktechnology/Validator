import { Schema } from 'mongoose'

export const Validator = {
  address: {
    type: String,
    lowercase: true,
    unique: true
  },
  coinbase: String,
  isActive: {
    type: Boolean,
    default: true
  },
  isSlashed: {
    type: Boolean,
    default: false
  },
  name: String,
  logo: String,
  website: String,
  description: String,
  stake: String,
  credit: String,
  startTimerAtBlock: {
    type: Number,
    default: 0
  },
  frozenBalance: {
    type: String,
    default: '0'
  },
  claimedSum: {
    type: String,
    default: '0'
  },
  penalizedSum: {
    type: String,
    default: '0'
  },
  penalizedTimes: {
    type: Number,
    default: 0
  },
  royaltyPoint: {
    type: Number,
    default: 0
  },
  sealedBlocks: {
    type: Number,
    default: 0
  },
  unlockedAt: {
    type: Number,
    default: 0
  },
  metadata: {
    type: Object
  }
}
