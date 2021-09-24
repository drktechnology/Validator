import React from 'react'
import {
  Form,
  Spin,
  Button,
  Input,
  message,
  Modal,
  Anchor,
  Popconfirm
} from 'antd'
import { Link } from 'react-router-dom'
import I18N from '@/I18N'
import _ from 'lodash'
import StandardPage from '@/module/page/StandardPage'
import { LANGUAGES } from '@/config/constant'
import { CVOTE_RESULT, CVOTE_STATUS } from '@/constant'
import Footer from '@/module/layout/Footer/Container'
import BackLink from '@/module/shared/BackLink/Component'
import CRPopover from '@/module/shared/Popover/Component'
import MetaComponent from '@/module/shared/meta/Container'
import Translation from '@/module/common/Translation/Container'
import DraftEditor from '@/module/common/DraftEditor'
import { createEditorState } from 'medium-draft'
import { convertFromHTML, ContentState, EditorState } from 'draft-js'
import mediumDraftExporter from 'medium-draft/lib/exporter'
import { StickyContainer, Sticky } from 'react-sticky'
import VoteResultComponent from '../common/vote_result/Component'
import Preamble from './Preamble'
import Tracking from '../tracking/Container'
import Summary from '../summary/Container'
import Meta from '@/module/common/Meta'
import SocialShareButtons from '@/module/common/SocialShareButtons'
import { logger } from '@/util'

import {
  Container,
  Title,
  Label,
  ContentTitle,
  StyledAnchor,
  FixedHeader,
  Body,
  SubTitleHeading,
  SubTitleContainer,
  VoteBtnGroup,
  StyledRichContent
} from './style'
import './style.scss'

const { TextArea } = Input

const renderRichContent = (data, key, title) => {
  let content
  if (_.isArray(data)) {
    content = _.map(data, item => (
      <StyledRichContent>
        <DraftEditor
          value={item[key]}
          contentType={item.contentType}
          editorEnabled={false}
        />
      </StyledRichContent>
    ))
  } else {
    content = (
      <StyledRichContent>
        <DraftEditor
          value={data[key]}
          contentType={data.contentType}
          editorEnabled={false}
        />
      </StyledRichContent>
    )
  }

  return (
    <div>
      {title && <ContentTitle id={key}>{title}</ContentTitle>}
      {content}
    </div>
  )
}

const getHTML = (data, key) => {
  const { contentType } = data
  const content = _.get(data, key, '')
  let editorState
  if (!content) {
    editorState = createEditorState()
  } else if (contentType === 'MARKDOWN') {
    try {
      editorState = createEditorState(JSON.parse(content))
    } catch(err) {}
  }

  if (!editorState) {
    const blocksFromHTML = convertFromHTML(content)
    const state = ContentState.createFromBlockArray(
      blocksFromHTML.contentBlocks,
      blocksFromHTML.entityMap
    )
    editorState = EditorState.createWithContent(state)
  }

  return mediumDraftExporter(editorState.getCurrentContent())
  // return content
}

class C extends StandardPage {
  constructor(props) {
    super(props)

    this.state = {
      persist: true,
      loading: false,
      language: LANGUAGES.english, // language for this specifc form only
      reason: '',
      visibleYes: false,
      visibleOppose: false,
      visibleAbstain: false,
      editing: false,
      smallSpace: false
    }

    this.isLogin = this.props.isLogin
    this.user = this.props.user
  }

  async componentDidMount() {
    await this.refetch()
  }

  componentWillUnmount() {
    this.props.resetData()
  }

  refetch = async () => {
    const param = {
      id: _.get(this.props.match, 'params.id')
    }
    await this.props.getData(param)
  }

  ord_loading(f = false) {
    this.setState({ loading: f })
  }

  ord_renderMeta(f = false) {
    return f
  }

  ord_renderContent() {
    const { data } = this.props
    if (!data) {
      return (
        <div className="center">
          <Spin />
        </div>
      )
    }

    const anchorNode = this.renderAnchor()
    const contentNode = this.renderContent()
    const translationBtn = this.renderTranslationBtn()
    const notesNode = this.renderNotes()
    const voteActionsNode = this.renderVoteActions()
    const voteDetailNode = this.renderVoteResults()
    const trackingNode = this.renderTracking()
    const summaryNode = this.renderSummary()

    // get the first line pure text of abstract
    let abstract = ''
    try {
      if (data.abstract) {
        const result = JSON.parse(data.abstract)
        if (result && result.blocks && result.blocks.length) {
          abstract = result.blocks[0].text
        }
      }
    } catch (error) {
      logger.error(error)
    }

    return (
      <div>
        <Meta
          desc={abstract}
          title={`${data.title} - Proposal Detail - Cyber Republic`}
          url={this.props.location.pathname}
        />
        {anchorNode}
        <Container className="p_CVoteDetail">
          <StickyContainer>
            <BackLink link="/proposals" />
            {this.renderStickyHeader()}
            <Body>
              {contentNode}
              {translationBtn}
              {notesNode}
              {voteActionsNode}
              {voteDetailNode}
              {trackingNode}
              {summaryNode}
            </Body>
            <SocialShareButtons
              shareQuote={`${data.title} - Proposal Detail - Cyber Republic`}
            />
          </StickyContainer>
        </Container>
        <Footer />
      </div>
    )
  }

  renderStickyHeader() {
    const metaNode = this.renderMeta()
    const titleNode = this.renderTitle()
    const labelNode = this.renderLabelNode()
    const subTitleNode = this.renderSubTitle()
    const { smallSpace } = this.state
    return (
      <Sticky>
        {({ style, isSticky, wasSticky }) => {
          if (!wasSticky && isSticky && !smallSpace) {
            this.setState({ smallSpace: true })
          }
          if (wasSticky && !isSticky && smallSpace) {
            this.setState({ smallSpace: false })
          }
          const finalStyle = style
            ? {
              ...style,
              zIndex: 2
            }
            : style
          return (
            <div style={finalStyle}>
              <FixedHeader>
                {metaNode}
                {titleNode}
                {labelNode}
                {subTitleNode}
              </FixedHeader>
            </div>
          )
        }}
      </Sticky>
    )
  }

  renderTranslationBtn() {
    const { data } = this.props
    const { title } = data
    const text = `
      <h3>${title}</h3>
      <br />
      <br />
      <h2>${I18N.get('proposal.fields.abstract')}</h2>
      <p>${getHTML(data, 'abstract')}</p>
      <h2>${I18N.get('proposal.fields.goal')}</h2>
      <p>${getHTML(data, 'goal')}</p>
      <h2>${I18N.get('proposal.fields.motivation')}</h2>
      <p>${getHTML(data, 'motivation')}</p>
      <h2>${I18N.get('proposal.fields.plan')}</h2>
      <p>${getHTML(data, 'plan')}</p>
      <h2>${I18N.get('proposal.fields.relevance')}</h2>
      <p>${getHTML(data, 'relevance')}</p>
      <h2>${I18N.get('proposal.fields.budget')}</h2>
      <p>${getHTML(data, 'budget')}</p>
    `

    return (
      <div style={{ marginTop: 20 }}>
        <Translation text={text} />
      </div>
    )
  }

  renderMeta() {
    const { data } = this.props
    data.author = data.proposedBy
    data.displayId = data.vid
    const postedByText = I18N.get('from.CVoteForm.label.proposedby')
    return <MetaComponent data={data} postedByText={postedByText} />
  }

  renderAnchor() {
    const { data, currentUserId } = this.props
    const { trackingStatus, summaryStatus } = this.props
    let isShowFollowingUp = _.includes(
      [CVOTE_STATUS.ACTIVE, CVOTE_STATUS.INCOMPLETED, CVOTE_STATUS.FINAL],
      data.status
    )
    if (data.status === CVOTE_STATUS.PROPOSED && currentUserId === _.get(data, 'proposer._id')) {
      isShowFollowingUp = true;
    }

    const trackingTitle = trackingStatus ? (
      <span>
        {I18N.get('proposal.fields.tracking')}{' '}
        <span style={{ fontSize: 10, color: '#aaa' }}>
          ({I18N.get(`proposal.status.trackingRaw.${trackingStatus}`)})
        </span>
      </span>
    ) : (
      I18N.get('proposal.fields.tracking')
    )
    const summaryTitle = summaryStatus ? (
      <span>
        {I18N.get('proposal.fields.summary')}{' '}
        <span style={{ fontSize: 10, color: '#aaa' }}>
          ({I18N.get(`proposal.status.summaryRaw.${summaryStatus}`)})
        </span>
      </span>
    ) : (
      I18N.get('proposal.fields.summary')
    )
    const tracking = isShowFollowingUp && (
      <Anchor.Link href="#tracking" title={trackingTitle} />
    )
    const summary = isShowFollowingUp && (
      <Anchor.Link href="#summary" title={summaryTitle} />
    )

    return (
      <StyledAnchor offsetTop={420}>
        <Anchor.Link
          href="#preamble"
          title={I18N.get('proposal.fields.preamble')}
        />
        <Anchor.Link
          href="#abstract"
          title={I18N.get('proposal.fields.abstract')}
        />
        <div style={{ marginTop: 48 }}>
          <Anchor.Link href="#goal" title={I18N.get('proposal.fields.goal')} />
        </div>
        <Anchor.Link
          href="#motivation"
          title={I18N.get('proposal.fields.motivation')}
        />
        <Anchor.Link href="#plan" title={I18N.get('proposal.fields.plan')} />
        <Anchor.Link
          href="#relevance"
          title={I18N.get('proposal.fields.relevance')}
        />
        <div style={{ marginTop: 48 }}>
          <Anchor.Link
            href="#budget"
            title={I18N.get('proposal.fields.budget')}
          />
        </div>
        <div style={{ marginTop: 48 }}>
          <Anchor.Link href="#vote" title={I18N.get('proposal.fields.vote')} />
        </div>
        {tracking}
        {summary}
      </StyledAnchor>
    )
  }

  renderTitle() {
    const { title } = this.props.data
    return <Title smallSpace={this.state.smallSpace}>{title}</Title>
  }

  renderSubTitle() {
    const status = this.renderStatus()
    const btns = this.renderAdminActions()
    return (
      <SubTitleContainer>
        {status}
        {btns}
      </SubTitleContainer>
    )
  }

  renderStatus() {
    const { data } = this.props
    const statusObj = {
      text: I18N.get('from.CVoteForm.label.voteStatus'),
      value: I18N.get(`cvoteStatus.${data.status}`) || ''
    }

    const result = (
      <SubTitleHeading smallSpace={this.state.smallSpace}>
        <div className="text">{statusObj.text}</div>
        <div className="value">{statusObj.value}</div>
      </SubTitleHeading>
    )
    return result
  }

  renderLabelNode() {
    const reference = _.get(this.props.data, 'reference')
    if (_.isEmpty(reference)) return null
    const { _id, displayId } = reference
    const linkText = `${I18N.get('suggestion.suggestion')} #${displayId}`
    return (
      <Label>
        {`${I18N.get('council.voting.referred')} `}
        <Link to={`/suggestion/${_id}`}>{linkText}</Link>
      </Label>
    )
  }

  renderContent() {
    const { data } = this.props
    // legacy data structure has content field
    if (_.has(data, 'content')) return renderRichContent(data, 'content')
    return (
      <div>
        <Preamble {...data} />
        {renderRichContent(
          data,
          'abstract',
          I18N.get('proposal.fields.abstract')
        )}
        {renderRichContent(data, 'goal', I18N.get('proposal.fields.goal'))}
        {renderRichContent(
          data,
          'motivation',
          I18N.get('proposal.fields.motivation')
        )}
        {renderRichContent(data, 'plan', I18N.get('proposal.fields.plan'))}
        {renderRichContent(
          data,
          'relevance',
          I18N.get('proposal.fields.relevance')
        )}
        {renderRichContent(data, 'budget', I18N.get('proposal.fields.budget'))}
      </div>
    )
  }

  renderNotes() {
    const { notes, notes_zh } = this.props.data
    if (!notes && !notes_zh) return null
    return (
      <div className="content notes">
        <h4 className="notes-title">
          {I18N.get('council.voting.btnText.notesSecretary')}
        </h4>
        <p className="notes-content">{notes}</p>
        <p className="notes-content">{notes_zh}</p>
      </div>
    )
  }

  renderVoteActions() {
    const { isCouncil } = this.props
    const { status } = this.props.data
    const canVote = isCouncil && status === CVOTE_STATUS.PROPOSED

    if (!canVote) return null
    const { visibleYes, visibleOppose, visibleAbstain } = this.state
    const btnYes = (
      <Button
        type="primary"
        icon="check-circle"
        onClick={this.showVoteYesModal}
      >
        {I18N.get('council.voting.btnText.yes')}
      </Button>
    )
    const btnOppose = (
      <Button
        type="danger"
        icon="close-circle"
        onClick={this.showVoteOpposeModal}
      >
        {I18N.get('council.voting.btnText.no')}
      </Button>
    )
    const btnAbstain = (
      <Button icon="stop" onClick={this.showVoteAbstainModal}>
        {I18N.get('council.voting.btnText.abstention')}
      </Button>
    )

    const popOverYes = (
      <CRPopover
        triggeredBy={btnYes}
        visible={visibleYes}
        onToggle={this.showVoteYesModal}
        onSubmit={this.voteYes}
        btnType="primary"
      />
    )
    const popOverOppose = (
      <CRPopover
        triggeredBy={btnOppose}
        visible={visibleOppose}
        onToggle={this.showVoteOpposeModal}
        onSubmit={this.voteOppose}
        btnType="danger"
      />
    )
    const popOverAbstain = (
      <CRPopover
        triggeredBy={btnAbstain}
        visible={visibleAbstain}
        onToggle={this.showVoteAbstainModal}
        onSubmit={this.voteAbstain}
      />
    )

    return (
      <VoteBtnGroup>
        {popOverYes}
        {popOverOppose}
        {popOverAbstain}
      </VoteBtnGroup>
    )
  }

  renderAdminActions() {
    const { isSecretary, isCouncil, currentUserId } = this.props
    const { status, createdBy } = this.props.data
    const isSelf = currentUserId === createdBy._id
    const isCompleted = _.includes(
      [CVOTE_STATUS.FINAL, CVOTE_STATUS.INCOMPLETED],
      status
    )
    const canManage = isSecretary || isCouncil
    const canEdit = _.includes([CVOTE_STATUS.DRAFT], status)

    if (!canManage || isCompleted) return null

    const editProposalBtn = isSelf && canEdit && (
      <Button onClick={this.gotoEditPage}>
        {I18N.get('council.voting.btnText.editProposal')}
      </Button>
    )
    const publishProposalBtn = isSelf && canEdit && (
      <Button type="primary" onClick={this.publish}>
        {I18N.get('council.voting.btnText.publish')}
      </Button>
    )
    const deleteDraftProposalBtn = isSelf && canEdit && (
      <Popconfirm
        title={I18N.get('council.voting.modal.deleteDraft')}
        onConfirm={() => this.deleteDraftProposal()}
        okText={I18N.get('.yes')}
        cancelText={I18N.get('.no')}
      >
        <Button type="danger">
          {I18N.get('council.voting.btnText.delete')}
        </Button>
      </Popconfirm>
    )
    return (
      <div className="vote-btn-group">
        {editProposalBtn}
        {publishProposalBtn}
        {deleteDraftProposalBtn}
      </div>
    )
  }

  renderTracking() {
    const { data, currentUserId } = this.props
    let isShowFollowingUp = _.includes(
      [CVOTE_STATUS.ACTIVE, CVOTE_STATUS.INCOMPLETED, CVOTE_STATUS.FINAL],
      data.status
    )
    if (data.status === CVOTE_STATUS.PROPOSED && currentUserId === _.get(data, 'proposer._id')) {
      isShowFollowingUp = true;
    }
    if (!isShowFollowingUp) return null

    return <Tracking proposal={data} />
  }

  renderSummary() {
    const { data, currentUserId } = this.props
    let isShowFollowingUp = _.includes(
      [CVOTE_STATUS.ACTIVE, CVOTE_STATUS.INCOMPLETED, CVOTE_STATUS.FINAL],
      data.status
    )

    if (data.status === CVOTE_STATUS.PROPOSED && currentUserId === _.get(data, 'proposer._id')) {
      isShowFollowingUp = true;
    }
    if (!isShowFollowingUp) return null

    return <Summary proposal={data} />
  }

  gotoEditPage = () => {
    const { _id: id } = this.props.data
    this.props.history.push(`/proposals/${id}/edit`)
  }

  onNotesChanged = e => {
    this.setState({ notes: e.target.value })
  }

  showUpdateNotesModal = () => {
    const { notes } = this.props.data
    Modal.confirm({
      title: I18N.get('council.voting.modal.updateNotes'),
      content: <TextArea onChange={this.onNotesChanged} defaultValue={notes} />,
      okText: I18N.get('council.voting.modal.confirm'),
      cancelText: I18N.get('council.voting.modal.cancel'),
      onOk: () => this.updateNotes()
    })
  }

  async updateNotes() {
    const { notes } = this.state
    const id = _.get(this.props.match, 'params.id')

    if (_.isEmpty(notes)) return
    this.ord_loading(true)
    try {
      await this.props.updateNotes({
        _id: id,
        notes
      })
      message.success(I18N.get('from.CVoteForm.message.note.update.success'))
      this.refetch()
      this.ord_loading(false)
    } catch (error) {
      this.ord_loading(false)
      message.error(error.message)
      logger.error(error)
    }
  }

  renderVoteResults() {
    const {
      vote_map: voteMap,
      reason_map: reasonMap,
      voteResult,
      status
    } = this.props.data
    const { avatar_map: avatarMap } = this.props
    let stats

    if (status === CVOTE_STATUS.DRAFT) return null

    if (!_.isEmpty(voteResult)) {
      stats = _.reduce(
        voteResult,
        (prev, cur) => {
          const item = {
            name: `${_.get(cur, 'votedBy.profile.firstName')} ${_.get(
              cur,
              'votedBy.profile.lastName'
            )} `,
            avatar: _.get(cur, 'votedBy.profile.avatar'),
            reason: cur.reason
          }
          if (prev[cur.value]) {
            prev[cur.value].push(item)
            return prev
          }
          return _.extend(prev, { [cur.value]: [item] })
        },
        {}
      )
    } else if (!_.isEmpty(voteMap)) {
      // for legacy data structure
      stats = _.reduce(
        voteMap,
        (prev, value, key) => {
          const item = {
            name: key,
            avatar: _.get(avatarMap, key),
            reason: _.get(reasonMap, key)
          }
          if (prev[value]) {
            prev[value].push(item)
            return prev
          }
          return _.extend(prev, { [value]: [item] })
        },
        {}
      )
    }

    const title = <h4>{I18N.get('council.voting.councilMembersVotes')}</h4>
    const detail = _.map(stats, (statArr, key) => {
      const type = CVOTE_RESULT[key.toUpperCase()] || CVOTE_RESULT.UNDECIDED
      const label = I18N.get(`council.voting.type.${type}`)
      const props = {
        dataList: statArr,
        type,
        label
      }
      return <VoteResultComponent {...props} key={key} />
    })
    return (
      <div id="vote">
        {title}
        <div>{detail}</div>
      </div>
    )
  }

  publish = async () => {
    const { match, updateCVote } = this.props
    const id = _.get(match, 'params.id')

    const param = { _id: id, published: true }

    this.ord_loading(true)
    try {
      await updateCVote(param)
      message.success(I18N.get('from.CVoteForm.message.updated.success'))
      this.refetch()
      this.ord_loading(false)
    } catch (e) {
      this.ord_loading(false)
      message.error(e.message)
      logger.error(e)
    }
  }

  deleteDraftProposal = async () => {
    const { match, deleteDraft } = this.props
    const id = _.get(match, 'params.id')
    const param = { _id: id }
    this.ord_loading(true)
    try {
      await deleteDraft(param)
      message.success(I18N.get('from.CVoteForm.message.delete.success'))
      // redirect to proposal list page
      this.props.history.push('/proposals')
      this.ord_loading(false)
    } catch (e) {
      this.ord_loading(false)
      message.error(e.message)
      logger.error(e)
    }
  }

  async vote({ value, reason }) {
    const { match, vote } = this.props
    const id = _.get(match, 'params.id')

    const param = { _id: id, value, reason }

    this.ord_loading(true)
    try {
      await vote(param)
      message.success(I18N.get('from.CVoteForm.message.updated.success'))
      this.refetch()
      this.ord_loading(false)
    } catch (e) {
      this.ord_loading(false)
      message.error(e.message)
      logger.error(e)
    }
  }

  voteYes = ({ reason }) => {
    this.vote({ value: CVOTE_RESULT.SUPPORT, reason })
    this.setState({ reason: '' })
  }

  voteAbstain = ({ reason }) => {
    this.vote({ value: CVOTE_RESULT.ABSTENTION, reason })
    this.setState({ reason: '' })
  }

  voteOppose = ({ reason }) => {
    this.vote({ value: CVOTE_RESULT.REJECT, reason })
    this.setState({ reason: '' })
  }

  showVoteYesModal = () => {
    const { visibleYes } = this.state
    this.setState({ visibleYes: !visibleYes })
  }

  showVoteAbstainModal = () => {
    const { visibleAbstain } = this.state
    this.setState({ visibleAbstain: !visibleAbstain })
  }

  showVoteOpposeModal = () => {
    const { visibleOppose } = this.state
    this.setState({ visibleOppose: !visibleOppose })
  }

  completeProposal = () => {
    const title = I18N.get('council.voting.modal.complete')
    const fn = this.props.finishCVote
    this.finalizeProposal(title, fn)
  }

  incompleteProposal = () => {
    const title = I18N.get('council.voting.modal.incomplete')
    const fn = this.props.unfinishCVote
    this.finalizeProposal(title, fn)
  }

  finalizeProposal = (title, fn) => {
    const id = _.get(this.props.match, 'params.id')

    Modal.confirm({
      title,
      content: '',
      okText: I18N.get('council.voting.modal.confirm'),
      cancelText: I18N.get('council.voting.modal.cancel'),
      onOk: () => {
        this.ord_loading(true)
        fn({
          id
        })
          .then(() => {
            message.success(
              I18N.get('from.CVoteForm.message.proposal.update.success')
            )
            this.refetch()
            this.ord_loading(false)
          })
          .catch(e => {
            this.ord_loading(false)
            message.error(e.message)
            logger.error(e)
          })
      }
    })
  }
}

export default Form.create()(C)
