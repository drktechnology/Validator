import React from 'react'
import _ from 'lodash'
import moment from 'moment/moment'
import BaseComponent from '@/model/BaseComponent'
import { Table, Row, Col, Button } from 'antd'
import I18N from '@/I18N'
import { logger } from '@/util'
import { CVOTE_RESULT, CVOTE_STATUS } from '@/constant'
import VoteStats from '../stats/Component'
import userUtil from '@/util/user'

// style
import { Container, List, Item, ItemUndecided, StyledButton, StyledSearch, VoteFilter } from './style'

const FILTERS = {
  ALL: 'all',
  UNVOTED: CVOTE_RESULT.UNDECIDED,
}

export default class extends BaseComponent {
  constructor(p) {
    super(p)

    this.state = {
      list: [],
      loading: true,
      voteResult: sessionStorage.getItem('voteResult') || FILTERS.ALL,
      search: sessionStorage.getItem('proposalSearch') || '',
      page: 1
    }

    this.debouncedRefetch = _.debounce(this.refetch.bind(this), 300)
  }

  async componentDidMount() {
    this.refetch()
  }

  ord_render() {
    const { canManage, isCouncil } = this.props
    const map = {
      1: I18N.get('council.voting.type.newMotion'),
      2: I18N.get('council.voting.type.motionAgainst'),
      3: I18N.get('council.voting.type.anythingElse'),
    }

    const columns = [
      {
        title: I18N.get('council.voting.number'),
        dataIndex: 'vid',
        render: (vid, item, index) => (
          <a className="tableLink" onClick={this.toDetailPage.bind(this, item._id)}>
            {`#${vid}`}
          </a>
        ),
      },
      {
        title: I18N.get('council.voting.title'),
        dataIndex: 'title',
        width: '30%',
        render: (title, item) => (
          <a onClick={this.toDetailPage.bind(this, item._id)} className="tableLink">
            {title}
          </a>
        ),
      },
      {
        title: I18N.get('council.voting.type'),
        dataIndex: 'type',
        render: (type, item) => map[type],
      },
      {
        title: I18N.get('council.voting.author'),
        dataIndex: 'proposedBy',
      },
      {
        title: I18N.get('council.voting.votingEndsIn'),
        dataIndex: 'proposedAt',
        key: 'endsIn',
        render: (proposedAt, item) => {
          if (item.status === CVOTE_STATUS.DRAFT) return null
          // only show when status is PROPOSED
          const endsInFloat = moment.duration(moment(proposedAt || item.createdAt).add(7, 'd').diff(moment())).as('days')
          if (item.status !== CVOTE_STATUS.PROPOSED || endsInFloat <= 0) {
            return I18N.get('council.voting.votingEndsIn.ended')
          }
          if (endsInFloat > 0 && endsInFloat <= 1) {
            return <span style={{ color: 'red' }}>{`1 ${I18N.get('council.voting.votingEndsIn.day')}`}</span>
          }
          return `${Math.ceil(endsInFloat)} ${I18N.get('council.voting.votingEndsIn.days')}`
        },
      },
      {
        title: I18N.get('council.voting.voteByCouncil'),
        render: (id, item) => this.voteDataByUser(item),
      },
      {
        title: I18N.get('council.voting.status'),
        render: (id, item) => I18N.get(`cvoteStatus.${item.status}`) || '',
      },
      {
        title: I18N.get('council.voting.proposedAt'),
        dataIndex: 'proposedAt',
        render: (proposedAt, doc) => doc.published && moment(proposedAt || doc.createdAt).format('MMM D, YYYY'),
      },
    ]

    if (canManage) {
      columns.splice(1, 0, {
        dataIndex: 'published',
        render: (published, item, index) => (published ? <i className="fas fa-eye" /> : <i className="far fa-eye-slash" />),
      })
    }

    const statusIndicator = (
      <List>
        <Item status={CVOTE_RESULT.SUPPORT} />
        <span>{I18N.get('council.voting.type.support')}</span>
        <Item status={CVOTE_RESULT.REJECT} />
        <span>{I18N.get('council.voting.type.reject')}</span>
        <Item status={CVOTE_RESULT.ABSTENTION} />
        <span>{I18N.get('council.voting.type.abstention')}</span>
        <ItemUndecided status={CVOTE_RESULT.UNDECIDED} />
        <span>{I18N.get('council.voting.type.undecided')}</span>
      </List>
    )

    const createBtn = canManage && (
      <Row type="flex" align="middle" justify="end">
        <Col lg={8} md={12} sm={24} xs={24} style={{ textAlign: 'right' }}>
          <StyledButton onClick={this.createAndRedirect} className="cr-btn cr-btn-primary">
            {I18N.get('from.CVoteForm.button.add')}
          </StyledButton>
        </Col>
      </Row>
    )

    const filterBtnGroup = (
      <Button.Group className="filter-group">
        <StyledButton
          className={(this.state.voteResult === FILTERS.ALL && 'selected') || ''}
          onClick={this.clearFilters}
        >
          {I18N.get('council.voting.voteResult.all')}
        </StyledButton>
        <StyledButton
          className={(this.state.voteResult === FILTERS.UNVOTED && 'selected') || ''}
          onClick={() => this.setFilter(FILTERS.UNVOTED)}
        >
          {I18N.get('council.voting.voteResult.unvoted')}
        </StyledButton>
      </Button.Group>
    )
    const title = (
      <Col lg={8} md={8} sm={12} xs={24}>
        <h2 style={{ textAlign: 'left', paddingBottom: 0 }} className="komu-a cr-title-with-icon">
          {I18N.get('council.voting.proposalList')}
        </h2>
      </Col>
    )
    const searchInput = (
      <Col lg={8} md={8} sm={12} xs={24}>
        <StyledSearch
          defaultValue={this.state.search}
          onSearch={this.searchChangedHandler}
          placeholder={I18N.get('developer.search.search.placeholder')}
        />
      </Col>
    )
    const btns = (
      <Col lg={8} md={8} sm={12} xs={24}>
        {statusIndicator}
        {isCouncil && (
          <VoteFilter>
            <span>{`${I18N.get('council.voting.voteResult.show')}: `}</span>
            {filterBtnGroup}
          </VoteFilter>
        )}
      </Col>
    )
    const { list, loading, page } = this.state
    return (
      <Container>
        {createBtn}
        <Row type="flex" align="middle" justify="space-between" style={{ marginTop: 20 }}>
          {title}
          {searchInput}
          {btns}
        </Row>
        <Table
          columns={columns}
          loading={loading}
          dataSource={list}
          rowKey={record => record._id}
          pagination={{
            current: page,
            pageSize: 10,
            total: list && list.length,
            onChange: this.onPageChange,
          }}
        />
        {createBtn}
      </Container>
    )
  }

  onPageChange = (page, pageSize) => {
    this.setState({ page: parseInt(page) })
    sessionStorage.setItem('proposalPage', page)
  }

  createAndRedirect = async () => {
    sessionStorage.removeItem('proposalPage')
    sessionStorage.removeItem('voteResult')
    sessionStorage.removeItem('proposalSearch')

    const { user } = this.props
    const fullName = userUtil.formatUsername(user)
    const { createDraft } = this.props

    const param = {
      title: 'New Proposal',
      proposedBy: fullName,
      proposer: user._id,
    }

    this.ord_loading(true)

    try {
      const res = await createDraft(param)
      this.ord_loading(false)
      this.toEditPage(res._id)
    } catch (error) {
      this.ord_loading(false)
    }
  }

  getQuery = () => {
    const query = {}
    const voteResult = sessionStorage.getItem('voteResult') || this.state.voteResult
    query.voteResult = voteResult
    const searchStr = this.state.search || sessionStorage.getItem('proposalSearch')
    if (searchStr) {
      query.search = searchStr
    }

    return query
  }

  refetch = async () => {
    this.ord_loading(true)
    const { listData, canManage } = this.props
    const param = this.getQuery()
    try {
      const list = await listData(param, canManage)
      const page = sessionStorage.getItem('proposalPage')
      this.setState({ list, page: page && parseInt(page) || 1 })
    } catch (error) {
      logger.error(error)
    }

    this.ord_loading(false)
  }

  searchChangedHandler = (search) => {
    sessionStorage.removeItem('proposalPage')
    sessionStorage.setItem('proposalSearch', search)
    this.setState({ search }, this.debouncedRefetch)
  }

  onFilterChanged = (value) => {
    switch (value) {
      case FILTERS.ALL:
        this.clearFilters()
        break
      case FILTERS.UNVOTED:
        this.setFilter(FILTERS.UNVOTED)
        break
      default:
        this.clearFilters()
        break
    }
  }

  clearFilters = () => {
    sessionStorage.removeItem('proposalPage')
    sessionStorage.setItem('voteResult', FILTERS.ALL)
    this.setState({ voteResult: FILTERS.ALL }, this.refetch)
  }

  setFilter = (voteResult) => {
    sessionStorage.removeItem('proposalPage')
    sessionStorage.setItem('voteResult', voteResult)
    this.setState({ voteResult }, this.refetch)
  }

  toDetailPage(id) {
    this.props.history.push(`/proposals/${id}`)
  }

  toEditPage(id) {
    this.props.history.push(`/proposals/${id}/edit`)
  }

  voteDataByUser = (data) => {
    const { vote_map: voteMap, voteResult, status } = data
    let voteArr

    if (status === CVOTE_STATUS.DRAFT) return null

    if (!_.isEmpty(voteResult)) {
      voteArr = _.map(voteResult, item => CVOTE_RESULT[item.value.toUpperCase()])
    } else if (!_.isEmpty(voteMap)) {
      voteArr = _.map(voteMap, value => (CVOTE_RESULT[value.toUpperCase()] || CVOTE_RESULT.UNDECIDED))
    } else {
      return ''
    }
    const supportNum = _.countBy(voteArr)[CVOTE_RESULT.SUPPORT] || 0
    const percentage = supportNum * 100 / voteArr.length
    const proposalAgreed = percentage > 50
    const percentageStr = percentage.toString() && `${percentage.toFixed(1).toString()}%`
    return <VoteStats percentage={percentageStr} values={voteArr} yes={proposalAgreed} />
  }
}
