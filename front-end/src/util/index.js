import { connect } from 'react-redux'
import _ from 'lodash'
import { withRouter } from 'react-router'
import { api_request, upload_file } from './request'
import * as helps from './helps'
import { loginRedirectWithQuery } from './login'
import * as permissions from './permissions'
import * as url from './url'
import * as editor from './editor'
import * as logger from './logger'

/**
 * Helper for React-Redux connect
 *
 * @param component
 * @param mapState - map state to props
 * @param mapDispatch - map dispatch to props
 */
export const createContainer = (component, mapState, mapDispatch = _.noop()) => {
  const tmp_mapState = (state, ownProps) => {
    const s = {
      lang: state.language.language,
    }

    return _.merge(s, mapState(state, ownProps))
  }
  return withRouter(connect(tmp_mapState, mapDispatch)(component))
}

export const constant = (moduleName, detailArray) => {
  const result = {}
  _.each(detailArray, (detail) => {
    result[detail] = `${moduleName}/${detail}`
  })

  return result
}

export {
  api_request,
  upload_file,
  loginRedirectWithQuery,
  permissions,
  url,
  editor,
  logger,
  helps
}
