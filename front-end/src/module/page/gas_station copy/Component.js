import React from 'react'
import Footer from '@/module/layout/Footer/Container'
import I18N from '@/I18N'
import _ from 'lodash'
import styled from 'styled-components'
import './style.scss'
import MediaQuery from 'react-responsive'
import { Row, Col, Select, Table, Button, Modal, InputNumber, Input, Tooltip, Icon } from 'antd'


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
export default class extends StandardPage {

  constructor(props) {
    super(props)

    this.state = {
      web3: null,
      wallet: null,
      networkFee: '1',
      accountFee: '0'
    }
  }

  async setupAccount() {
    window.web3.eth.getAccounts(async (err, accounts) => {
      console.log('xxx accounts', accounts)
      if (accounts.length > 0) {
        this.setState({
          wallet: accounts[0],
          accountFee: await this.getFee(accounts[0]),
        })
      }
    })
  }

  async setupWeb3() {
    const networkFeeStateAddress = '0x0000000000000000000000000000000000000072'
    if (window.ethereum) {
      var self = this
      window.ethereum.on('accountsChanged', function (accounts) {
        // Time to reload your interface with accounts[0]!
        self.setupAccount()
      })
      this.setState({
        networkFee: await this.getFee(networkFeeStateAddress)
      })
    }
    const web3 = new Web3(window.ethereum)
    this.setState({
      web3
    })
    this.setupAccount()
  }

  async getFee(address) {
    const payload = {
      jsonrpc: '2.0',
      method: 'eth_getFee',
      params: [address, 'latest'],
      id: 1,
    }
    // const rs = await window.ethereum.sendAsync(payload)
    const hexValue =  await new Promise(function (resolve, reject) {
      window.ethereum.sendAsync(payload, function (err, response) {
        if(!err) {
          resolve(response.result)
        } else {
          resolve(0x0)
        }
      })
    });
    console.log('xxx hexValue', hexValue)
    const rs = new BigNumber(hexValue)
    return rs.toFixed(0)
  }

  async componentDidMount() {
    await window.ethereum.enable()
    this.setupWeb3()
  }

  componentWillUnmount() {
  }

  ord_renderContent() {
    return (
      <div className="c_Home">
        <Meta
          title="DRK Chain-Gas-Station"
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

  renderGasInfo() {
    const unit = ' DRK'
    const dataSource = [
      {
        key: 'Account',
        value: this.state.wallet,
        hint: 'Your metamask active account address'
      },
      {
        key: 'Account Loyalty',
        value: helps.getXFactor(this.state.networkFee, this.state.accountFee),
        hint: 'Transaction priority is based on gasPrice * Loyalty Factor, in which Loyalty Factor is based on Account Fee (0 <= X < =0.5). (1-x) times Fee will be burned and the rest added to miner coinbase.'
      },
      {
        key: 'Account Total Fee',
        value: helps.fromWei(this.state.accountFee, decimals) + unit,
        hint: 'Total fee spent by your account'
      },
      {
        key: 'Network Total Fee',
        value: helps.fromWei(this.state.networkFee, decimals) + unit,
        hint: 'Total fee consumed by the whole network'
      }
    ]
    const columns = [
      {
        title: 'Key',
        dataIndex: 'key',
        key: 'address',
        render: (value, row, index) => {
          return <Tooltip placement="topLeft" title={row.hint}>
          <Button className="maxWidth">{value}</Button>
        </Tooltip>
        }
      },
      {
        title: 'Value',
        dataIndex: 'value',
        key: 'value',
      }
    ]
    return (
      <Col span={24}>
        <Table className="maxWidth" dataSource={dataSource} columns={columns} title={() => 'Gas Station'} pagination={false}/>
      </Col>
    )
  }

  renderDesktop() {
    return (
      <MainContainer>
        <Col sm={0} md={3}/>
        <Col sm={24} md={18}>
          {this.renderGasInfo()}
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
