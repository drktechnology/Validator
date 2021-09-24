import Base from '../Base'
import {getState} from '../../contract'

export default class extends Base {
    protected needLogin = false
    async action(){
        const rs = await getState()
        return this.result(1, rs)
    }
}
