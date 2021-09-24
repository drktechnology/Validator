import Base from '../Base'
import ValidatorService from '../../service/ValidatorService'

export default class extends Base {
    protected needLogin = false
    async action(){
        const validatorService = this.buildService(ValidatorService)
        const param = await this.getParam()
        const rs = await validatorService.get(param)
        return this.result(1, rs)
    }
}
