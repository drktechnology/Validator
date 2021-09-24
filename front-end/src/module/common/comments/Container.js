import { createContainer } from '@/util'
import Component from './Component'
import CommentService from '@/service/CommentService'
import CouncilService from '@/service/CouncilService'
import { message } from 'antd'
import _ from 'lodash'
import { logger } from '@/util'

export default createContainer(Component, (state) => {
  const commentables = ['task', 'submission', 'team', 'member', 'elip']

  const props = {
    currentUserId: state.user.current_user_id,
    all_users: _.values(state.council.council_members || []),
    loading: {},
  }

  _.each(commentables, (commentable) => {
    props[commentable] = state[commentable].detail
    props.loading[commentable] = state[commentable].loading
  })

  return props
}, () => {
  const commentService = new CommentService()
  const councilService = new CouncilService()

  return {
    async postComment(type, reduxType, detailReducer, returnUrl, parentId, comment, headline) {
      try {
        const rs = await commentService.postComment(type, reduxType, detailReducer,
          returnUrl, parentId, comment, headline)

        if (rs) {
          message.success('Your comment has been posted.')
        }
      } catch (err) {
        message.error(err.message)
        logger.error(err)
      }
    },

    async listUsers() {
      try {
        return await councilService.getCouncilMembers()
      } catch (err) {
        message.error(err.message)
        logger.error(err)
      }
    },

    async subscribe(type, parentId) {
      try {
        await commentService.subscribe(type, parentId)
      } catch (err) {
        message.error(err.message)
        logger.error(err)
      }
    },

    async unsubscribe(type, parentId) {
      try {
        await commentService.unsubscribe(type, parentId)
      } catch (err) {
        message.error(err.message)
        logger.error(err)
      }
    },
  }
})
