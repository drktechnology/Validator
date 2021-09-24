import {
  createContainer,
} from '@/util'
import {
  SUGGESTION_STATUS
} from '@/constant'
import SuggestionService from '@/service/SuggestionService'
import CommentService from '@/service/CommentService'
import Component from './Component'

const mapState = (state) => {
  const currentUserId = state.user.current_user_id
  // const isAdmin = state.user.role === USER_ROLE.ADMIN

  const suggestionState = {
    ...state.suggestion,
    tagsIncluded: state.suggestion.tags_included,
    referenceStatus: state.suggestion.reference_status,
    dataList: state.suggestion.all_suggestions,
    total: state.suggestion.all_suggestions_total,
    currentUserId,
    filter: state.suggestion.filter || {},
    isLogin: state.user.is_login,
  }

  return suggestionState
}

const mapDispatch = () => {
  const service = new SuggestionService()
  const commentService = new CommentService()

  return {
    async changePage(page) {
      return service.changePage(page)
    },

    async onSortByChanged(sortBy) {
      return service.saveSortBy(sortBy)
    },

    async onTagsIncludedChanged(tagsIncluded) {
      return service.saveTagsIncluded(tagsIncluded)
    },

    async onReferenceStatusChanged(referenceStatus) {
      return service.saveReferenceStatus(referenceStatus)
    },

    async getList(query) {

      query = Object.assign({
        status: SUGGESTION_STATUS.ACTIVE
      }, query)

      return service.list(query)
    },

    async loadMore(query) {

      query = Object.assign({
        status: SUGGESTION_STATUS.ACTIVE
      }, query)

      return service.loadMore(query)
    },

    resetAll() {
      return service.resetAll()
    },

    async create(doc) {
      return service.create(doc)
    },

    async reportAbuse(id) {
      return service.reportAbuse(id)
    },
    async subscribe(id) {
      return commentService.subscribe('suggestion', id)
    },

    async unsubscribe(id) {
      return commentService.unsubscribe('suggestion', id)
    },
  }
}

export default createContainer(Component, mapState, mapDispatch)
