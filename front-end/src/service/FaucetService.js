import BaseService from '../model/BaseService'
import { api_request } from '@/util'

export default class extends BaseService {
  async listFaucets() {
    const result = await api_request({
      path: '/api/test/list_faucet',
      method: 'get',
    })
    return result
  }

  async claimFaucet(to) {
    const result = await api_request({
      path: '/api/test/claim_faucet',
      method: 'post',
      data: {
        to
      }
    })
    // console.log('xxx rs', result)
    return result ? result.txHash : null
  }
}
