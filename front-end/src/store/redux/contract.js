import BaseRedux from '@/model/BaseRedux'

class ContractRedux extends BaseRedux {
  defineTypes() {
    return ['contract']
  }

  defineDefaultState() {
    return {
      loading: false,
      validators: null,
      events: null,
      states: null,
    }
  }
}

export default new ContractRedux()
