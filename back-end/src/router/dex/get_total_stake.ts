import Base from '../Base'
import {getTotalStake} from '../../contract'

export default class extends Base {
    protected needLogin = false
    async action(){
        const totalStake = await getTotalStake()
        return this.rawResult(1, {
            "stake": {
                "total": totalStake
            }
        })
    }
}
