import Base from './Base'
import {Validator} from './schema/ValidatorSchema'

export default class extends Base {
    protected getSchema(){
        return Validator
    }
    protected getName(){
        return 'Validator'
    }
}