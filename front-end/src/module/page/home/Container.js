import _ from 'lodash'
import {createContainer} from '@/util'
import Component from './Component'

import ValidatorService from '@/service/ValidatorService'

export default createContainer(Component, (state) => {
  return {
    validators: state.contract.validators,
    contractStates: state.contract.states
  }
}, () => {
  const validatorService = new ValidatorService()
  return {
    async loadValidators() {
      return await validatorService.loadValidators()
    },
    async loadContractStates() {
      return await validatorService.loadContractStates()
    },
  }
})
