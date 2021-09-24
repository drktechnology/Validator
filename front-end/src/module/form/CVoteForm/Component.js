import React from 'react'
import BaseComponent from '@/model/BaseComponent'
import {
  Form,
  Input,
  Button,
  Row,
  message,
  Modal,
  Tabs,
  Radio,
  Popconfirm
} from 'antd'
import I18N from '@/I18N'
import _ from 'lodash'
import { CVOTE_STATUS, ABSTRACT_MAX_WORDS } from '@/constant'
import { convertToRaw } from 'draft-js'
import DraftEditor from '@/module/common/DraftEditor'
import CircularProgressbar from '@/module/common/CircularProgressbar'
import { logger } from '@/util'

// if using webpack
import 'medium-draft/lib/index.css'

import {
  Container,
  Title,
  TabPaneInner,
  Note,
  NoteHighlight,
  TabText,
  CirContainer
} from './style'

const WORD_LIMIT = ABSTRACT_MAX_WORDS

const FormItem = Form.Item
const { TabPane } = Tabs

const transform = value => {
  // string or object
  let result = value
  if (_.isObject(value)) {
    try {
      result = value.getCurrentContent().getPlainText()
    } catch (error) {
      result = value
    }
  }
  return result
}

const renderTypeRadioGroup = (data, key, getFieldDecorator) => {
  const content = _.get(data, key, '1')
  const rules = [
    {
      required: true,
      message: I18N.get('proposal.form.error.required')
    }
  ]
  const content_fn = getFieldDecorator(key, {
    rules,
    initialValue: content
  })

  const content_el = (
    <Radio.Group>
      <Radio value="1">{I18N.get('council.voting.type.newMotion')}</Radio>
      <Radio value="2">{I18N.get('council.voting.type.motionAgainst')}</Radio>
      <Radio value="3">{I18N.get('council.voting.type.anythingElse')}</Radio>
    </Radio.Group>
  )
  return content_fn(content_el)
}

const renderRichEditor = (
  data,
  key,
  getFieldDecorator,
  max,
  callback,
  validateAbstract
) => {
  const content = _.get(data, key, '')
  const rules = [
    {
      required: true,
      transform,
      message: I18N.get('proposal.form.error.required')
    }
  ]
  if (max) {
    rules.push({
      transform,
      message: I18N.get(`proposal.form.error.limit${max}`),
      validator: validateAbstract
    })
  }
  const content_fn = getFieldDecorator(key, {
    rules,
    initialValue: content
  })

  const content_el = (
    <DraftEditor
      contentType={_.get(data, 'contentType')}
      callback={callback}
      activeKey={key}
    />
  )
  return content_fn(content_el)
}

const formatValue = value => {
  let result
  try {
    result = _.isString(value)
      ? value
      : JSON.stringify(convertToRaw(value.getCurrentContent()))
  } catch (error) {
    result = _.toString(value)
  }
  return result
}

const activeKeys = [
  'type',
  'abstract',
  'goal',
  'motivation',
  'plan',
  'relevance',
  'budget'
]

class C extends BaseComponent {
  constructor(props) {
    super(props)

    this.state = {
      persist: true,
      loading: false,
      activeKeyNum: 0
    }

    this.user = this.props.user
  }

  componentDidMount = () => {
    this.intervalId = setInterval(this.saveDraft, 5000)
  }

  componentWillUnmount() {
    clearInterval(this.intervalId)
  }

  ord_loading(f = false) {
    this.setState({ loading: f })
  }

  publishCVote = async e => {
    e.preventDefault()
    const { edit, form, updateCVote, onEdit, suggestionId } = this.props

    form.validateFields(async (err, values) => {
      if (err) {
        // mark error keys
        this.setState({ errKeys: _.keys(err) })
        return
      }
      const {
        title,
        type,
        abstract,
        goal,
        motivation,
        relevance,
        budget,
        plan
      } = values
      const param = {
        _id: edit,
        title,
        type,
        abstract: formatValue(abstract),
        goal: formatValue(goal),
        motivation: formatValue(motivation),
        relevance: formatValue(relevance),
        budget: formatValue(budget),
        plan: formatValue(plan),
        published: true
      }
      if (suggestionId) param.suggestionId = suggestionId

      this.ord_loading(true)
      try {
        await updateCVote(param)
        this.ord_loading(false)
        await onEdit()
        message.success(I18N.get('proposal.msg.proposalPublished'))
      } catch (error) {
        logger.error(error)
        this.ord_loading(false)
      }
    })
  }

  saveDraft = async (isShowMsg = false, isShowErr = false) => {
    const { edit, form, updateDraft, suggestionId } = this.props

    form.validateFields(async (err, values) => {
      if (err) {
        // mark error keys
        if (isShowErr) {
          this.setState({ errKeys: _.keys(err) })
          return
        }
      }
      const {
        title,
        type,
        abstract,
        goal,
        motivation,
        relevance,
        budget,
        plan
      } = values
      const param = {
        _id: edit,
        title,
        type
      }
      if (suggestionId) param.suggestionId = suggestionId

      if (!_.isEmpty(transform(abstract))) {
        param.abstract = formatValue(abstract)
      }
      if (!_.isEmpty(transform(goal))) {
        param.goal = formatValue(goal)
      }
      if (!_.isEmpty(transform(motivation))) {
        param.motivation = formatValue(motivation)
      }
      if (!_.isEmpty(transform(relevance))) {
        param.relevance = formatValue(relevance)
      }
      if (!_.isEmpty(transform(budget))) {
        param.budget = formatValue(budget)
      }
      if (!_.isEmpty(transform(plan))) {
        param.plan = formatValue(plan)
      }

      try {
        await updateDraft(param)
        if (isShowMsg) message.success(I18N.get('proposal.msg.draftSaved'))
      } catch (error) {
        message.error(error.message)
        logger.error(error)
      }
    })
  }

  saveDraftWithMsg = () => this.saveDraft(true, true)

  onInputChange = activeKey => {
    const { form } = this.props
    const err = transform(form.getFieldError(activeKey))
    const { errKeys } = this.state
    let errorKeys = []
    if (errKeys) errorKeys = [...errKeys]
    if (err) {
      if (_.includes(errorKeys, activeKey)) return
      this.setState({ errKeys: [...errorKeys, activeKey] })
    } else {
      const keys = _.filter(errorKeys, key => key !== activeKey)
      this.setState({ errKeys: keys })
    }
  }

  validateAbstract = (rule, value, cb) => {
    const { lang } = this.props
    let count = 0
    if (value) {
      count = lang === 'en' ? value.split(' ').length : value.length
    }
    return count > WORD_LIMIT ? cb(true) : cb()
  }

  getInputProps(data) {
    const { edit } = this.props
    const { getFieldDecorator } = this.props.form

    const title_fn = getFieldDecorator('title', {
      rules: [
        { required: true, message: I18N.get('proposal.form.error.required') }
      ],
      initialValue: edit ? data.title : _.get(data, 'title', '')
    })
    const title_el = <Input size="large" type="text" />

    const abstract = renderRichEditor(
      data,
      'abstract',
      getFieldDecorator,
      WORD_LIMIT,
      this.onInputChange,
      this.validateAbstract
    )

    const fields = ['goal', 'motivation', 'plan', 'relevance', 'budget']
    const result = {}
    for (let i = 0; i < fields.length; i++) {
      result[fields[i]] = renderRichEditor(
        data,
        fields[i],
        getFieldDecorator,
        null,
        this.onInputChange
      )
    }

    const type = renderTypeRadioGroup(
      data,
      'type',
      getFieldDecorator,
      null,
      this.onInputChange
    )

    return {
      title: title_fn(title_el),
      abstract,
      type,
      ...result
    }
  }

  ord_render() {
    const { edit, data, canManage } = this.props
    if (!canManage || (edit && !data)) {
      return null
    }
    const formProps = this.getInputProps(data)
    const formItemLayout = {
      labelCol: {
        span: 2
      },
      wrapperCol: {
        span: 18
      },
      colon: false
    }
    const { activeKeyNum } = this.state
    const activeKey = activeKeys[activeKeyNum]
    let actionBtn
    if (
      activeKeyNum === activeKeys.length - 1 &&
      _.get(data, 'status') === CVOTE_STATUS.DRAFT
    ) {
      actionBtn = this.renderPreviewBtn()
    }
    if (activeKeyNum !== activeKeys.length - 1) {
      actionBtn = this.renderContinueBtn()
    }

    return (
      <Container>
        <Form onSubmit={this.publishCVote}>
          <Title className="komu-a cr-title-with-icon ">
            {this.props.header || I18N.get('from.CVoteForm.button.add')}
          </Title>
          <FormItem
            label={`${I18N.get('proposal.fields.title')}*`}
            {...formItemLayout}
          >
            {formProps.title}
          </FormItem>
          <Tabs
            animated={false}
            tabBarGutter={5}
            activeKey={activeKey}
            onChange={this.onTabChange}
          >
            <TabPane tab={this.renderTabText('type')} key="type">
              <TabPaneInner>
                <Note>{I18N.get('proposal.form.note.type')}</Note>
                <FormItem>{formProps.type}</FormItem>
              </TabPaneInner>
            </TabPane>
            <TabPane tab={this.renderTabText('abstract')} key="abstract">
              <TabPaneInner>
                <Note>{I18N.get('proposal.form.note.abstract')}</Note>
                <FormItem>
                  <div style={{ position: 'relative' }}>
                    {formProps.abstract}
                    {this.renderWordLimit()}
                  </div>
                </FormItem>
              </TabPaneInner>
            </TabPane>
            <TabPane tab={this.renderTabText('goal')} key="goal">
              <TabPaneInner>
                <Note>{I18N.get('proposal.form.note.goal')}</Note>
                <FormItem>{formProps.goal}</FormItem>
              </TabPaneInner>
            </TabPane>
            <TabPane tab={this.renderTabText('motivation')} key="motivation">
              <TabPaneInner>
                <Note>
                  {I18N.get('proposal.form.note.motivation')}
                  <NoteHighlight>
                    {' '}
                    {I18N.get('proposal.form.note.motivationHighlight')}
                  </NoteHighlight>
                </Note>
                <FormItem>{formProps.motivation}</FormItem>
              </TabPaneInner>
            </TabPane>
            <TabPane tab={this.renderTabText('plan')} key="plan">
              <TabPaneInner>
                <Note>{I18N.get('proposal.form.note.plan')}</Note>
                <FormItem>{formProps.plan}</FormItem>
              </TabPaneInner>
            </TabPane>
            <TabPane tab={this.renderTabText('relevance')} key="relevance">
              <TabPaneInner>
                <Note>{I18N.get('proposal.form.note.relevance')}</Note>
                <FormItem>{formProps.relevance}</FormItem>
              </TabPaneInner>
            </TabPane>
            <TabPane tab={this.renderTabText('budget')} key="budget">
              <TabPaneInner>
                <Note>{I18N.get('proposal.form.note.budget')}</Note>
                <FormItem>{formProps.budget}</FormItem>
              </TabPaneInner>
            </TabPane>
          </Tabs>

          <Row gutter={8} type="flex" justify="center">
            {actionBtn}
          </Row>

          <Row gutter={8} type="flex" justify="center">
            {this.renderCancelBtn()}
            {this.renderSaveDraftBtn()}
            {this.renderSaveBtn()}
          </Row>
        </Form>
      </Container>
    )
  }

  renderWordLimit() {
    const { form, lang } = this.props
    const formValue = form.getFieldValue('abstract')
    const value = transform(formValue)
    let count = 0
    if (value) {
      count = lang === 'en' ? value.split(' ').length : value.length
    }
    return (
      <CirContainer>
        <CircularProgressbar count={count} />
      </CirContainer>
    )
  }

  renderTabText(key) {
    const { errKeys } = this.state
    const fullText = `${I18N.get(`proposal.fields.${key}`)}*`
    const hasErr = _.includes(errKeys, key)
    return <TabText hasErr={hasErr}>{fullText}</TabText>
  }

  onTabChange = activeKey => {
    const activeKeyNum = activeKeys.indexOf(activeKey)
    this.setState({ activeKeyNum })
  }

  gotoNextTab = () => {
    const { form } = this.props
    const currentKeyNum = this.state.activeKeyNum

    form.validateFields(async (err, values) => {
      const errKeys = _.keys(err)
      this.setState({ errKeys })
      if (_.includes(errKeys, activeKeys[currentKeyNum])) return
      this.setState({ activeKeyNum: currentKeyNum + 1 })
    })
  }

  gotoList = () => {
    this.props.history.push('/proposals')
  }

  gotoDetail = () => {
    const { form } = this.props

    form.validateFields(async (err, values) => {
      if (err) {
        // mark error keys
        this.setState({ errKeys: _.keys(err) })
        return
      }
      const {
        data: { _id }
      } = this.props
      this.props.history.push(`/proposals/${_id}`)
    })
  }

  renderContinueBtn() {
    return (
      <FormItem>
        <Button
          onClick={this.gotoNextTab}
          className="cr-btn cr-btn-black"
          style={{ marginBottom: 10 }}
        >
          {I18N.get('from.CVoteForm.button.continue')}
        </Button>
      </FormItem>
    )
  }

  renderPreviewBtn() {
    return (
      <FormItem>
        <Button
          onClick={this.gotoDetail}
          className="cr-btn cr-btn-black"
          style={{ marginBottom: 10 }}
        >
          {I18N.get('from.CVoteForm.button.preview')}
        </Button>
      </FormItem>
    )
  }

  renderCancelBtn() {
    return (
      <FormItem>
        <Button
          onClick={this.props.onCancel}
          className="cr-btn cr-btn-default"
          style={{ marginRight: 10 }}
        >
          {I18N.get('from.CVoteForm.button.cancel')}
        </Button>
      </FormItem>
    )
  }

  renderSaveDraftBtn() {
    const { edit, data } = this.props
    const showButton = !edit || _.get(data, 'status') === CVOTE_STATUS.DRAFT

    return (
      showButton && (
        <FormItem>
          <Button
            loading={this.state.loading}
            className="cr-btn cr-btn-primary"
            onClick={this.saveDraftWithMsg}
            style={{ marginRight: 10 }}
          >
            {I18N.get('from.CVoteForm.button.saveDraft')}
          </Button>
        </FormItem>
      )
    )
  }

  renderSaveBtn() {
    const { edit, data } = this.props
    const saveChangesBtn = (
      <Button
        loading={this.state.loading}
        className="cr-btn cr-btn-primary"
        htmlType="submit"
      >
        {I18N.get('from.CVoteForm.button.saveChanges')}
      </Button>
    )

    const saveAndPublishBtn = (
      <Popconfirm
        title={I18N.get('from.CVoteForm.modal.publish')}
        onConfirm={e => this.publishCVote(e)}
        okText={I18N.get('.yes')}
        cancelText={I18N.get('.no')}
      >
        <Button loading={this.state.loading} className="cr-btn cr-btn-primary">
          {I18N.get('from.CVoteForm.button.saveAndPublish')}
        </Button>
      </Popconfirm>
    )

    return (
      <FormItem>
        {edit && data.published ? saveChangesBtn : saveAndPublishBtn}
      </FormItem>
    )
  }

  finishClick(id) {
    Modal.confirm({
      title: I18N.get('from.CVoteForm.modal.title'),
      content: '',
      okText: I18N.get('from.CVoteForm.modal.confirm'),
      okType: 'danger',
      cancelText: I18N.get('from.CVoteForm.modal.cancel'),
      onOk: () => {
        this.ord_loading(true)
        this.props
          .finishCVote({
            id
          })
          .then(() => {
            message.success(
              I18N.get('from.CVoteForm.message.proposal.update.success')
            )
            this.ord_loading(false)
          })
          .catch(e => {
            message.error(e.message)
            this.ord_loading(false)
            logger.error(e)
          })
      },
      onCancel() {}
    })
  }
}

export default Form.create()(C)
