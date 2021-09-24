import Base from '../Base'
import ValidatorService from '../../service/ValidatorService'

export default class extends Base {
    protected needLogin = false
    async action(){
        const validatorService = this.buildService(ValidatorService)
        const rs = await validatorService.list()
        return this.result(1, rs)
    }
}
