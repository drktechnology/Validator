import Base from './Base'
import * as _ from 'lodash'
import { constant } from '../constant'

export default class extends Base {
  private model: any
  protected init() {
    this.model = this.getDBModel('Event')
  }

  public async list() {
    const events = await this.model.getDBInstance().find({})
    return events
  }

  public async getLastBlockNumber() {
    const event = await this.model.findOne({}).sort({blockNumber: -1})
    if (event) {
      console.log('xxx event', event)
      return event.blockNumber
    }
    return 0
  }
}
