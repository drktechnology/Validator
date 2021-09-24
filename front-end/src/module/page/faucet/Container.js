import {createContainer} from '@/util'
import Component from './Component'
import _ from 'lodash'

import FaucetService from '@/service/FaucetService'

export default createContainer(Component, (state) => {
  return {
  }
}, () => {
  const faucetService = new FaucetService()
  return {
    async listFaucets() {
      return await faucetService.listFaucets()
    },
    async claimFaucet(to) {
      return await faucetService.claimFaucet(to)
    },
  }
})
