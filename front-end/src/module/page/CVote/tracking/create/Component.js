import React from 'react'
import _ from 'lodash'
import BaseComponent from '@/model/BaseComponent'
import CVoteTrackingForm from '@/module/form/CVoteTrackingForm/Container'
import I18N from '@/I18N'
import styled from 'styled-components'

export default class extends BaseComponent {
  constructor(props) {
    super(props)
    this.state = {
      creating: false,
    }
  }

  ord_render() {
    const form = this.renderForm()
    return (
      <Container>
        {form}
      </Container>
    )
  }

  renderForm() {
    const props = {
      ...this.props,
      onCreated: this.onCreated,
      // onCancel: this.onCancel,
    }
    return <CVoteTrackingForm {...props} />
  }

  getQuery = () => {
    const query = {
      proposalId: _.get(this.props, 'proposal._id')
    }
    return query
  }

  refetch = async () => {
    this.ord_loading(true)
    const { listData } = this.props
    const param = this.getQuery()
    try {
      listData(param, true)
    } catch (error) {
      // do sth
    }

    this.ord_loading(false)
  }

  onCreated = () => {
    this.refetch()
  }
}

export const Container = styled.div`

`
