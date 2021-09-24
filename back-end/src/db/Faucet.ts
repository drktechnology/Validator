import Base from './Base'
import {Faucet} from './schema/FaucetSchema'

export default class extends Base {
    protected getSchema(){
        return Faucet
    }
    protected getName(){
        return 'Faucet'
    }
}