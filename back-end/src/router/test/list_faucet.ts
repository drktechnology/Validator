import Base from '../Base'
import {getState} from '../../contract'
import TestService from '../../service/TestService'
import * as requestIp from 'request-ip'
export default class extends Base {
    protected needLogin = false
    async action(){
        let param = await this.getParam()
        // const ip = requestIp.getClientIp(this.req)
        // param.ip = ip
        const testService = this.buildService(TestService)
        const rs = await testService.listFaucet(param)
        return this.result(1, rs)
    }
}
