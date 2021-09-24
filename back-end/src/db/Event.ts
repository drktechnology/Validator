import Base from './Base'
import {Event} from './schema/EventSchema'

export default class extends Base {
    protected getSchema(){
        return Event
    }
    protected getName(){
        return 'Event'
    }
}