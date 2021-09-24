import * as _ from 'lodash'
import { Document } from 'mongoose'
import Base from './Base'
import { constant } from '../constant'

export default class extends Base {
  public async get(param) {
    if (!param.address) {
      throw 'address required'
    }
    const db_validator = this.getDBModel('Validator')
    const address = (param.address).toLowerCase()
    const rs = await db_validator.findOne({address: address})
    return rs
  }

  public async list() {
    const db_validator = this.getDBModel('Validator')
    const rs = await db_validator.getDBInstance().find({isActive: true})
    return rs
  }
}
