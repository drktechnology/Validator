import React from 'react'
import BaseComponent from '@/model/BaseComponent'
import { Form, Input, Button, Row, Tabs, Radio } from 'antd'
import I18N from '@/I18N'
import _ from 'lodash'
import { CONTENT_TYPE, ABSTRACT_MAX_WORDS } from '@/constant'
import { convertToRaw } from 'draft-js'
import DraftEditor from '@/module/common/DraftEditor'
import CircularProgressbar from '@/module/common/CircularProgressbar'

import 'medium-draft/lib/index.css'
import {
  Container,
  TabPaneInner,
  Note,
  TabText,
  CirContainer
} from './style'

const FormItem = Form.Item
const { TabPane } = Tabs

const WORD_LIMIT = ABSTRACT_MAX_WORDS
const TAB_KEYS = ['type', 'abstract', 'goal', 'motivation', 'plan', 'relevance', 'budget']
const editorTransform = value => {
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

class C extends BaseComponent {
  constructor(props) {
    super(props)

    this.timer = -1;
    this.state = {
      loading: false,
      activeKey: TAB_KEYS[0],
      errorKeys: {},
    }
  }

  componentDidMount() {
    this.timer = setInterval(() => {
      this.handleSaveDraft();
    }, 5000)
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  getActiveKey(key) {
    if (!TAB_KEYS.includes(key)) return this.state.activeKey
    return key
  }

  handleSubmit = async e => {
    const { onSubmit, form } = this.props
    this.setState({ loading: true })

    e.preventDefault()
    form.validateFields((err, values) => {
      if (err) {
        this.setState({ loading: false, errorKeys: err, activeKey: this.getActiveKey(Object.keys(err)[0]) })
        return
      }

      onSubmit({
        title: values.title,
        type: values.type,
        abstract: formatValue(values.abstract),
        goal: formatValue(values.goal),
        motivation: formatValue(values.motivation),
        relevance: formatValue(values.relevance),
        budget: formatValue(values.budget),
        plan: formatValue(values.plan)
      }).finally(() => this.setState({ loading: false }))
    })
  }

  handleSaveDraft = () => {
    const { form } = this.props
    if (this.props.onSaveDraft) {
      const values = form.getFieldsValue();
      TAB_KEYS.forEach(key => values[key] = formatValue(values[key]))
      this.props.onSaveDraft(values);
    }
  }

  handleContinue = (e) => {
    const { form } = this.props
    e.preventDefault()

    form.validateFields((err, values) => {
      if (err) {
        this.setState({ loading: false, errorKeys: err, activeKey: this.getActiveKey(Object.keys(err)[0]) })
        return
      }

      const index = TAB_KEYS.findIndex(item => item === this.state.activeKey)
      if (index === TAB_KEYS.length - 1) {
        this.handleSubmit({ preventDefault: () => {} })
      } else {
        this.setState({ activeKey: TAB_KEYS[index + 1] })
      }
    });
  }

  getTitleInput() {
    const { initialValues = {} } = this.props
    const { getFieldDecorator } = this.props.form

    return getFieldDecorator('title', {
      rules: [
        { required: true, message: I18N.get('suggestion.form.error.required') }
      ],
      initialValue: initialValues.title
    })(
      <Input size="large" type="text" />
    )
  }

  getTypeRadioGroup = (key) => {
    const { getFieldDecorator } = this.props.form
    const rules = [
      {
        required: true,
        message: I18N.get('suggestion.form.error.required')
      }
    ]
    return getFieldDecorator(key, {
      rules,
      initialValue: '1'
    })(<Radio.Group>
      <Radio value="1">{I18N.get('suggestion.form.type.newMotion')}</Radio>
      <Radio value="2">{I18N.get('suggestion.form.type.motionAgainst')}</Radio>
      <Radio value="3">{I18N.get('suggestion.form.type.anythingElse')}</Radio>
    </Radio.Group>)
  }

  onTextareaChange = (activeKey) => {
    const { form } = this.props
    const err = editorTransform(form.getFieldError(activeKey))
    const { errorKeys } = this.state
    if (err) {
      this.setState({ errorKeys: Object.assign({}, errorKeys, { [activeKey]: err }) })
    } else {
      const newState = Object.assign({}, errorKeys)
      delete newState[activeKey]
      this.setState({ errorKeys: newState })
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

  getTextarea(id) {
    const { initialValues = {} } = this.props
    const { getFieldDecorator } = this.props.form

    const rules = [{
      required: true,
      transform: editorTransform,
      message: I18N.get('suggestion.form.error.required')
    }];
    if (id === 'abstract') {
      rules.push({
        transform: editorTransform,
        message: I18N.get(`suggestion.form.error.limit${WORD_LIMIT}`),
        validator: this.validateAbstract
      })
    }

    return getFieldDecorator(id, {
      rules,
      initialValue: initialValues[id],
    })(<DraftEditor contentType={CONTENT_TYPE.MARKDOWN} callback={this.onTextareaChange} activeKey={id} />)
  }

  renderTabText(id) {
    const hasError = _.has(this.state.errorKeys, id)
    return (
      <TabText hasErr={hasError}>
        {I18N.get(`suggestion.fields.${id}`)}*
      </TabText>
    )
  }

  renderWordLimit() {
    const { form, lang } = this.props
    const formValue = form.getFieldValue('abstract')
    const value = editorTransform(formValue)
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

  ord_render() {
    return (
      <Container>
        <Form onSubmit={this.handleSubmit}>
          <FormItem
            label={`${I18N.get('suggestion.form.fields.title')}*`}
            labelCol={{span: 2}}
            wrapperCol={{span: 18}}
            colon={false}
          >
            {this.getTitleInput()}
          </FormItem>

          <Tabs
            animated={false}
            tabBarGutter={5}
            activeKey={this.state.activeKey}
            onChange={this.onTabChange}
          >
            <TabPane tab={this.renderTabText('type')} key="type">
              <TabPaneInner>
                <Note>{I18N.get('suggestion.form.note.type')}</Note>
                <FormItem>{this.getTypeRadioGroup('type')}</FormItem>
              </TabPaneInner>
            </TabPane>
            <TabPane tab={this.renderTabText('abstract')} key="abstract">
              <TabPaneInner>
                <Note>{I18N.get('suggestion.form.note.abstract')}</Note>
                <FormItem>
                  {this.getTextarea('abstract')}
                </FormItem>
                {this.renderWordLimit()}
              </TabPaneInner>
            </TabPane>
            <TabPane tab={this.renderTabText('goal')} key="goal">
              <TabPaneInner>
                <Note>{I18N.get('suggestion.form.note.goal')}</Note>
                <FormItem>{this.getTextarea('goal')}</FormItem>
              </TabPaneInner>
            </TabPane>
            <TabPane tab={this.renderTabText('motivation')} key="motivation">
              <TabPaneInner>
                <Note>{I18N.get('suggestion.form.note.motivation')}</Note>
                <FormItem>{this.getTextarea('motivation')}</FormItem>
              </TabPaneInner>
            </TabPane>
            <TabPane tab={this.renderTabText('plan')} key="plan">
              <TabPaneInner>
                <Note>{I18N.get('suggestion.form.note.plan')}</Note>
                <FormItem>{this.getTextarea('plan')}</FormItem>
              </TabPaneInner>
            </TabPane>
            <TabPane tab={this.renderTabText('relevance')} key="relevance">
              <TabPaneInner>
                <Note>{I18N.get('suggestion.form.note.relevance')}</Note>
                <FormItem>{this.getTextarea('relevance')}</FormItem>
              </TabPaneInner>
            </TabPane>
            <TabPane tab={this.renderTabText('budget')} key="budget">
              <TabPaneInner>
                <Note>{I18N.get('suggestion.form.note.budget')}</Note>
                <FormItem>{this.getTextarea('budget')}</FormItem>
              </TabPaneInner>
            </TabPane>
          </Tabs>

          <Row gutter={8} type="flex" justify="center" style={{marginBottom: '30px'}}>
            <Button
              onClick={this.handleContinue}
              className="cr-btn cr-btn-black"
              htmlType="button"
            >
              {I18N.get('suggestion.form.button.continue')}
            </Button>
          </Row>

          <Row gutter={8} type="flex" justify="center">
            <Button
              onClick={this.props.onCancel}
              className="cr-btn cr-btn-default"
              htmlType="button"
              style={{ marginRight: 10 }}
            >
              {I18N.get('suggestion.form.button.cancel')}
            </Button>
            <Button
              loading={this.state.loading}
              className="cr-btn cr-btn-primary"
              htmlType="submit"
            >
              {I18N.get('suggestion.form.button.save')}
            </Button>
          </Row>
        </Form>
      </Container>
    )
  }

  onTabChange = activeKey => {
    this.setState({ activeKey })
  }
}

export default Form.create()(C)
