import { createContainer } from '@/util'
import Component from './Component'
import ElipService from '@/service/ElipService'

const mapState = state => ({
  user: state.user,
  currentUserId: state.user.current_user_id,
  isLogin: state.user.is_login,
  isSecretary: state.user.is_secretary
})

const mapDispatch = () => {
  const service = new ElipService()
  return {
    async listData(param) {
      return service.listData(param)
    }
  }
}

export default createContainer(Component, mapState, mapDispatch)
