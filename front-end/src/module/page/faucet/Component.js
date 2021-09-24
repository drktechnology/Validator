import React from 'react'
import Footer from '@/module/layout/Footer/Container'
import I18N from '@/I18N'
import _ from 'lodash'
import styled from 'styled-components'
import './style.scss'
import MediaQuery from 'react-responsive'
import { Row, Col, Select, Table, Button, Modal, notification, Input, Tooltip, Icon } from 'antd'


import {LG_WIDTH} from '../../../config/constant'
import { USER_LANGUAGE } from '@/constant'
import StandardPage from '../StandardPage'

import { images } from './images'

import Meta from '@/module/common/Meta'
import Web3 from 'web3'
import {helps} from '@/util'
import {CopyToClipboard} from 'react-copy-to-clipboard'

const { Option } = Select

const BigNumber = require('bignumber.js')

const decimals = 8
const explorer = 'http://explorer.realtract.network/'
export default class extends StandardPage {

  constructor(props) {
    super(props)

    this.state = {
      to: '',
      list: [],
      count: 0,
      sum: 0,
      text: null
    }
  }

  async componentDidMount() {
    this.loadFaucets()
  }

  componentWillUnmount() {
  }

  async loadFaucets() {
    const rs = await this.props.listFaucets()
    this.setState({
      list: rs.list,
      sum: rs.sum,
      count: rs.count,
    })
  }

  ord_renderContent() {
    return (
      <div className="c_Home">
        <Meta
          title="DRK Chain-Testnet-Faucet"
        />
        {this.renderDesktop()}
      </div>
    )
  }

  renderCopyButton(text, value) {
    return (
      <CopyToClipboard text={value}
        onCopy={() => this.setState({copied: true})}>
        <Button className="maxWidth" type="primary">
          {text}
          <Icon type="copy" />
        </Button>
      </CopyToClipboard>
    )
  }

  renderFaucets() {
    const dataSource = this.state.list
    const title = `List (Sum = ${this.state.sum}, Count = ${this.state.count})`
    const columns = [
      {
        title: 'IP',
        dataIndex: 'ip',
        key: 'ip',
      },
      {
        title: 'Tx',
        dataIndex: 'txHash',
        key: 'txHash',
        render: (txHash, row, index) => {
          const url = explorer + 'tx/' + txHash
          return (<a href={url} target='_'>
            {txHash}
          </a>)
        }
      },
      {
        title: 'To',
        dataIndex: 'to',
        key: 'to',
        render: (address, row, index) => {
          const url = explorer + 'address/' + address
          return (<a href={url} target='_'>
            {address}
          </a>)
        }
      },
      {
        title: 'Value',
        dataIndex: 'amount',
        key: 'amount',
      },
    ]

    return (
      <Row>
        <Table
          className="maxWidth"
          scroll={{ x: false }}
          dataSource={dataSource}
          columns={columns}
          pagination={false}
          title={() => title} />
      </Row>
    )
  }

  onToChange(e) {
    const to = e.target.value
    console.log('to', to)
    this.setState({
      to,
      text: ''
    })
  }

  async claim() {
    const {to} = this.state
    const rs = await this.props.claimFaucet(to)
    if (rs) {
      notification.success({
        message: 'Success:' + rs
      })
    } else {
      notification.error({
        message: 'Limited for today. Please comeback tomorrow!'
      })
    }
    this.setState({
      text: rs
    })
    this.loadFaucets()
  }

  renderInfoArea() {
    return (
      <Row>
        Explorer: <a href={explorer} target='_'>
          {explorer}
        </a>
      </Row>
    )
  }

  renderClaimArea() {
    const url = explorer + 'tx/'
    return(
      <Row>
        <Col span={20}>
          <Input
            placeholder={'Address to receive test RET...'}
            onChange={this.onToChange.bind(this)}
          />
        </Col>
        <Col span={4}>
          <Button type="primary" className="maxWidth" onClick={() => this.claim()}>
            Claim
          </Button>
        </Col>
        {
          this.state.text && <a href={url + this.state.text} target='_'>
          tx: {this.state.text}
        </a>
        }
      </Row>
    )
  }

  renderDesktop() {
    return (
      <MainContainer>
        <Col sm={0} md={3}/>
        <Col sm={24} md={18}>
          {this.renderInfoArea()}
          {this.renderClaimArea()}
          {this.renderFaucets()}
        </Col>
      </MainContainer>
    )
  }
}

const MainContainer = styled.div`
  /* max-width: 1200px; */
  margin: 0 auto;
  text-align: center;
`
