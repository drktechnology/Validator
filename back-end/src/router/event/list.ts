import Base from '../Base'
import EventService from '../../service/EventService'

export default class extends Base {
    protected needLogin = false
    async action(){
        const eventService = this.buildService(EventService)
        const rs = await eventService.list()
        return this.result(1, rs)
    }
}
