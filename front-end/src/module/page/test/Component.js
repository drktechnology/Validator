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

const JSON = require('@/../../back-end/build/contracts/Validator.json')
var intervalID = 0

const emptyValidator = {
  isActive: true,
  isSlashed: false,
  startTimerAtBlock: 0,
  frozenBalance: "0",
  claimedSum: "0",
  penalizedSum: "0",
  penalizedTimes: 0,
  royaltyPoint: 0,
  sealedBlocks: 0,
  unlockedAt: 0,
  _id: "5e53c9f5e9bef71a0955fe86",
  address: "0x0000000000000000000000000000000000000000",
  coinbase: "0x0000000000000000000000000000000000000000",
  stake: "0",
  credit: "0",
}

const getValidator = (wallet, validators) => {
  if (validators.length === 0) return emptyValidator
  if (!wallet) return emptyValidator
  for (let i = 0; i < validators.length; i++) {
    const validator = validators[i]
    if (validator.address === wallet.toLowerCase()) return validator
  }
  return emptyValidator
}

const decimals = 2
export default class extends StandardPage {

  constructor(props) {
    super(props)

    this.state = {
      selectedBox: 0,
      web3: null,
      modalVisible: false,
      selectedValidator: null,
      action: null,
      amount: 0,
      coinbase: '0x',
      accountFee: '0',
      networkFee: '0',

      // Metadata
      firstname: '',
      lastname: '',
      licenseId: '',
      fullAddress: '',
      state: '',
      zipcode: '',
      expirationDate: 0,
      createdDate: 0,
      updatedDate: 0,
      minThreshold: 0,
      contactEmail: '',
      isCompany: false
    }
  }

  async setupWeb3() {
    // https://rpc.draken.exchange
    try {
      const web3 = new Web3(window.ethereum)
      window.web3.eth.getAccounts(async (err, accounts) => {
        console.log('xxx accounts', accounts)
        if (accounts.length > 0) {

          this.setState({
            web3,
            wallet: accounts[0],
            accountFee: await this.getFee(accounts[0]),
            networkFee: await this.getFee('0x0000000000000000000000000000000000000072')
          })
          // this.getFee(accounts[0])
        }
      })
    } catch (e) {
      console.log('xxx metamask not found')
      const web3 = new Web3('https://rpc.draken.exchange')
      this.setState({
        web3,
        wallet: '0x0000000000000000000000000000000000000000',
        accountFee: await this.getFee('0x0000000000000000000000000000000000000000'),
        networkFee: await this.getFee('0x0000000000000000000000000000000000000072')
      })
    }
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
    const rs = new BigNumber(hexValue)
    return rs.toFixed(0)
  }

  async componentDidMount() {
    try {
      await window.ethereum.enable()
    } catch(e) {

    }
    await this.props.loadValidators()
    await this.props.loadContractStates()
    this.setupWeb3()
    console.log('xxx', this.props.validators)
    console.log('xxx', this.props.contractStates)
    var self = this
    intervalID = setInterval(async function() {
      await self.props.loadValidators()
      await self.props.loadContractStates()
    }, 10000);
  }

  componentWillUnmount() {
    clearInterval(intervalID);
  }

  switchToBox(box) {
    this.setState({
      selectedBox: box
    })
  }

  redirectToConstitution(link) {
    this.props.history.push(`/constitution/${link}`)
  }

  ord_renderContent() {
    return (
      <div className="c_Home">
        <Meta
          title="DRK Chain-Validators"
        />
        {/* <MediaQuery minWidth={LG_WIDTH}> */}
        {this.renderDesktop()}
        {/* </MediaQuery> */}
      </div>
    )
  }

  async initMethods() {
    const contractAddress = this.props.contractStates.contractAddress
    const web3 = new Web3(window.ethereum)
    const abi = JSON.abi
    const contract = new web3.eth.Contract(abi, contractAddress)
    const methods = contract.methods
    return methods
  }

  async report(reportedValidator) {
    window.web3.eth.getAccounts(async (err, accounts) => {
      const methods = await this.initMethods()
      const wallet = accounts[0]
      await methods.report(wallet, reportedValidator).send({ from: wallet })
    })
    // const contractAddress = this.props.contractStates.contractAddress
    // const web3 = new Web3(window.ethereum)
    // const abi = JSON.abi
    // const contract = new web3.eth.Contract(abi, contractAddress)
    // const methods = contract.methods
    // await methods.report()
    // console.log('xxx report', validator)
    // console.log('xxx contract', contract)
  }

  renderValidators() {
    const validators = this.props.validators ? this.props.validators : []
    const dataSource = validators.filter((validator) => {return validator.coinbase && validator.stake})
    // console.log('xxx dataSource', dataSource)
    const data = this.props.contractStates ? this.props.contractStates : null
    const safeRange = data ? Number(data.safeRange) : null
    const blockNumber = data ? Number(data.blockNumber) : null
    const reportIn = (_startAt) => {
      const startAt = Number(_startAt)
      if (!safeRange || !blockNumber) return -1
      if (blockNumber >= startAt + safeRange) return 0
      return startAt + safeRange - blockNumber
    }

    const columns = [
      {
        title: 'Address',
        dataIndex: 'address',
        key: 'address',
        render: (value, row, index) => {
          const text = row.metadata === undefined ? helps.cutString(value) : helps.getMetadataName(row.metadata)
          const copiedText = `{validator: ${value}, coinbase: ${row.coinbase}}`
          return this.renderCopyButton(text, copiedText)
        }
      },
      // {
      //   title: 'Coinbase',
      //   dataIndex: 'coinbase',
      //   key: 'coinbase',
      //   render: (value, row, index) => {
      //     return helps.cutString(value)
      //   }
      // },
      {
        title: 'Frozen',
        dataIndex: 'frozenBalance',
        key: 'frozenBalance',
        render: (value, row, index) => {
          return helps.fromWei(value, decimals)
        }
      },
      {
        title: 'Stake',
        dataIndex: 'stake',
        key: 'stake',
        render: (value, row, index) => {
          return helps.fromWei(value, decimals)
        }
      },
      {
        title: 'Claimed',
        dataIndex: 'claimedSum',
        key: 'claimedSum',
        render: (value, row, index) => {
          return helps.fromWei(value, decimals)
        }
      },
      {
        title: 'Reported',
        dataIndex: 'penalizedTimes',
        key: 'penalizedTimes',
      },
      {
        title: 'Penalized',
        dataIndex: 'penalizedSum',
        key: 'penalizedSum',
        render: (value, row, index) => {
          return helps.fromWei(value, decimals)
        }
      },
      {
        title: 'Blocks',
        dataIndex: 'sealedBlocks',
        key: 'sealedBlocks',
      },
      {
        title: 'Report',
        dataIndex: 'startTimerAtBlock',
        key: 'startTimerAtBlock',
        render: (value, row, index) => {
          const countdown = reportIn(value)
          const text = (countdown <= 0) ? '' : `(${countdown})`
          return (<Button className="maxWidth" onClick={() => this.report(row.address)} disabled={countdown !== 0}> <Icon type="thunderbolt" /> {text} </Button>)
        }
      },
    ]

    return (
      <ElaRow>
        <Table className="maxWidth" scroll={{ x: true }} dataSource={dataSource} columns={columns} title={() => 'Validator List'} />
      </ElaRow>
    )
  }

  renderContractStates() {
    const data = this.props.contractStates ? this.props.contractStates : null
    let dataSource = []
    if (data) {
      // console.log('xxx data', data)
      dataSource = [
        {
          key: 'Block Number',
          value: data.blockNumber,
          hint: 'Current Network Block Number'
        },
        {
          key: 'Validator Count',
          value: data.count,
          hint: 'Current Number of Validators'
        },
        {
          key: 'Stake Required',
          value: Web3.utils.fromWei(data.stakeRequired, 'ether'),
          hint: 'Minimum stake to become a Validator'
        },
        {
          key: 'Safe Range',
          value: data.safeRange,
          hint: 'startTimerAtBlock + safeRange > blockNumber => unreportable'
        },
        {
          key: 'Total Stake',
          value: Web3.utils.fromWei(data.totalSupply, 'ether'),
          hint: 'Total Stake of current Validators'
        },
        {
          key: 'Coin Supply',
          value: Web3.utils.fromWei(data.coinSupply, 'ether'),
          hint: 'Total Coin of Network'
        },
        {
          key: 'Network Fee',
          value: Web3.utils.fromWei(this.state.networkFee, 'ether'),
          hint: 'Total Fee of Network',
        },
//         {
//           key: 'DEBUG cpt',
//           value: data.cpt,
//           hint: 'Coin per RVS Token(Validator stake)'
//         },
      ]
    }

    const columns = [
      {
        title: 'Key Factor',
        dataIndex: 'key',
        key: 'key',
        render: (value, row, index) => {
          return (<Tooltip placement="topLeft" title={row.hint}>
          <Button className="maxWidth">{value}</Button>
        </Tooltip>)
        }
      },
      {
        title: 'Key Value',
        dataIndex: 'value',
        key: 'value',
        render: (value, row, index) => {
          return (
          <Button className="maxWidth">{value}</Button>
        )
        }
      }
    ]

    return (
      <ElaRow>
        <Table className="maxWidth" dataSource={dataSource} columns={columns} title={() => 'Network Data'} pagination={false} />
      </ElaRow>
    )
  }

  renderJoin() {
    return (<Button onClick={() => this.showJoinModal()} className="maxWidth" type="primary">BECOME A DRK VALIDATOR</Button>)
  }

  async showStakeModal(validator) {
    this.setState({
      action: 'stake',
      selectedValidator: validator
    })
    this.showModal()
  }

  async showUnstakeModal(validator) {
    this.setState({
      action: 'unstake',
      selectedValidator: validator
    })
    this.showModal()
  }

  async showLeaveModal(validator) {
    this.setState({
      action: 'leave',
      selectedValidator: validator
    })
    this.showModal()
  }

  async showJoinModal(validator) {
    this.setState({
      action: 'join',
      selectedValidator: validator
    })
    this.showModal()
  }

  async showUpdateMetadataModal(validator) {
    this.setState({
      action: 'updateMetadata',
      selectedValidator: validator
    })
    this.showModal()
  }

  async claim(validator) {
    window.web3.eth.getAccounts(async (err, accounts) => {
      const methods = await this.initMethods()
      const wallet = accounts[0]
      await methods.claim().send({ from: wallet })
    })
  }

  async cashout(validator) {
    window.web3.eth.getAccounts(async (err, accounts) => {
      const methods = await this.initMethods()
      const wallet = accounts[0]
      await methods.cashout(validator.frozenBalance).send({ from: wallet })
    })
  }

  renderCopyButton(text, value) {
    return (
      <CopyToClipboard text={value}
        onCopy={() => this.setState({copied: true})}>
        <Button className="maxWidth" type="primary">{text}<Icon type="copy" /></Button>
      </CopyToClipboard>
    )
  }

  renderSelectedValidator(selectedValidator) {
    // console.log('xxx selectedValidator', selectedValidator)
    // return null
    const contractStates = this.props.contractStates ? this.props.contractStates : null
    const CPT_ZOOM = contractStates ? contractStates.CPT_ZOOM : '1'
    const cpt = contractStates && contractStates.cpt ? contractStates.cpt : '0'
    const stake = selectedValidator.stake ? selectedValidator.stake : '0'
    const credit = cpt && selectedValidator.credit ? selectedValidator.credit : '0'
    const reward = BigNumber(cpt).times(BigNumber(stake)).idiv(BigNumber(CPT_ZOOM)).minus(BigNumber(credit))
    let dataSource = []
    // Object.keys(selectedValidator).forEach(function(key) {
    //   dataSource.push({
    //     key: key,
    //     value: selectedValidator[key]
    //   })
    // });
    dataSource = [
      {
        key: 'Account Fee',
        value: helps.fromWei(this.state.accountFee, 8),
        hint: 'Your total gas fee',
        action: '   '
      },
      {
        key: 'Stake Balance',
        value: helps.fromWei(selectedValidator.stake, decimals),
        hint: 'The amount of your validator stake',
        action: (
          <Button.Group className="maxWidth" >
            <Button className="maxWidth" onClick={() => this.showStakeModal(selectedValidator)} type="primary">Stake</Button>
            <Button className="maxWidth" onClick={() => this.showUnstakeModal(selectedValidator)} type="danger">Unstake</Button>
            <Button className="maxWidth" onClick={() => this.showLeaveModal(selectedValidator)} type="danger">Leave</Button>
          </Button.Group>
        )
      },
      {
        key: 'Metadata',
        value: selectedValidator.metadata ? helps.getMetadata(selectedValidator.metadata) : 'Not set',
        hint: 'The metadata of your validator, showing name only. Others are firstname, lastName, licenseId, fullAddress, state, zipcode, expirationDate, createdDate, updatedDate, minThreshold, contactEmail, isCompany',
        action: (
          <Button className="maxWidth" onClick={() => this.showUpdateMetadataModal(selectedValidator)} type="primary">Update</Button>
        )
      },
      {
        key: 'Reward Balance',
        value: reward.toString().length > 60 ? '0' : helps.fromWei(reward.toFixed(0), decimals),
        hint: 'Unclaimed reward balance. Claimed reward will be frozen before it can be cashed-out.',
        action: <Button onClick={() => this.claim(selectedValidator)} className="maxWidth" type="primary">Claim</Button>
      },
      {
        key: 'Frozen Balance',
        value: helps.fromWei(selectedValidator.frozenBalance, decimals),
        hint: 'Claimed reward + unstaked amount will be frozen first, before it can be cashed-out',
        action: <Button onClick={() => this.cashout(selectedValidator)} className="maxWidth" type="primary">Cashout</Button>
      },
      {
        key: 'Coinbase',
        value: helps.cutString(selectedValidator.coinbase),
        hint: 'Validator node address',
        action: ' '
      },
      {
        key: 'Royalty Points',
        value: selectedValidator.royaltyPoint,
        hint: 'Validator receives Royalty Points every k sealed blocks or after a success report. The limit to stacking point is currently 3 (points - penalizedTimes <= 3).',
        action: ' '
      },
      {
        key: 'Claimed Reward',
        value: helps.fromWei(selectedValidator.claimedSum, decimals),
        hint: 'Total reward claimed',
        action: ' '
      },
      {
        key: 'Penalized Sum',
        value: helps.fromWei(selectedValidator.penalizedSum, decimals),
        hint: 'Total penalized sum, which your validator has lost due to being reported',
        action: ' '
      },
      {
        key: 'Penalized Times',
        value: selectedValidator.penalizedTimes,
        hint: 'Times that your validator was penalized',
        action: ' '
      },
      {
        key: 'Unlocked Time',
        value: selectedValidator.unlockedAt,
        hint: 'Before UnLocked Time, your validator cannot cash out nor leave',
        action: ' '
      },
      {
        key: 'Sealed Blocks',
        value: selectedValidator.sealedBlocks,
        hint: 'The number of Blocks that your validator node has sealed',
        action: ' '
      },
//       {
//         key: 'DEBUG credit',
//         value: selectedValidator.credit,
//         hint: 'DEBUG OVERFLOW',
//         action: 'Log only'
//       },
    ]

    const columns = [
      {
        title: 'Key',
        dataIndex: 'key',
        key: 'key',
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
      },
      {
        title: 'Action',
        dataIndex: 'action',
        key: 'action',
        render: (action, row, index) => {
          return action
        }
      },
    ]
    return (
        <div>
          <Row>
          {selectedValidator === emptyValidator && this.renderJoin()}
          </Row>
          <Row>
          <Table
            className="maxWidth"
            dataSource={dataSource}
            columns={columns} title={() => 'Validator Details'}
            pagination={false}
            // expandedRowRender={record =>
            //   record.key === 'Metadata' ?
            //   <Row>
            //       {record.key}
            //   </Row>
            //   : null
            // }
          />
          </Row>
        </div>
    )
  }

  renderPrivate() {
    const validators = this.props.validators ? this.props.validators : []
    const wallet = this.state.wallet
    const selectedValidator = getValidator(wallet, validators)
    console.log('xxx selectedValidator', selectedValidator)
    // if (selectedValidator) {
    //   console.log('xxx selectedValidator', selectedValidator)
    // }
    return (
      <ElaRow>
        {/* <p>Your Wallet: {this.state.wallet ? this.state.wallet : 'not found'}</p> */}
        {/* {selectedValidator === emptyValidator && this.renderJoin()} */}
        {this.renderSelectedValidator(selectedValidator)}
      </ElaRow>
    )
  }

  renderDesktop() {
    return (
      <MainContainer>
        {this.renderComfirmModal()}
        <Col sm={24} md={14}>
          <h1>DRK Public Network</h1>
          {this.renderContractStates()}
          {this.renderValidators()}
        </Col>

        <Col sm={24} md={10}>
          <h1>Your DRK Validator</h1>
          {this.renderPrivate()}
        </Col>
        {/* <ClearFix/> */}
      </MainContainer>
    )
  }

  showModal = () => {
    this.setState({
      modalVisible: true,
    });
  };

  hideModal = () => {
    this.setState({
      modalVisible: false,
    });
  };

  onAmountChange(value) {
    this.setState({
      amount: value
    })
  }

  onCoinbaseChange(e) {
    this.setState({
      coinbase: e.target.value
    })
  }

  onFirstnameChange(e) {
    this.setState({
      firstname: e.target.value
    })
  }

  onLastnameChange(e) {
    this.setState({
      lastname: e.target.value
    })
  }

  onLicenseIdChange(e) {
    this.setState({
      licenseId: e.target.value
    })
  }

  onFullAddressChange(e) {
    this.setState({
      fullAddress: e.target.value
    })
  }

  onStateChange(e) {
    this.setState({
      state: e.target.value
    })
  }

  onZipcodeChange(e) {
    this.setState({
      zipcode: e.target.value
    })
  }

  onExpirationDateChange(value) {
    this.setState({
      expirationDate: value
    })
  }

  onCreatedDateChange(value) {
    this.setState({
      createdDate: value
    })
  }

  onUpdatedDateChange(value) {
    this.setState({
      updatedDate: value
    })
  }

  onMinThresholdChange(value) {
    this.setState({
      minThreshold: value
    })
  }

  onContactEmailChange(e) {
    this.setState({
      contactEmail: e.target.value
    })
  }

  onIsCompanyChange(value) {
    this.setState({
      isCompany: value
    })
  }

  sendTx(validator) {
    const action = this.state.action
    const amount = this.state.amount
    const coinbase = this.state.coinbase
    const metadata = this.state
    const wei = Web3.utils.toWei(String(amount), 'ether')
    // console.log('xxx action', action)
    // console.log('xxx wei', wei)
    window.web3.eth.getAccounts(async (err, accounts) => {
      const methods = await this.initMethods()
      const wallet = accounts[0]
      switch (action) {
        case 'stake':
          await methods.stake().send({ from: wallet, value: wei })
          break
        case 'unstake':
          await methods.unstake(wei).send({ from: wallet })
          break
        case 'join':
          await methods.join(coinbase).send({ from: wallet, value: wei })
          break
        case 'updateMetadata':
          await helps.updateMetadata(methods, wallet, metadata)
          break
        default:
          await methods.leave().send({ from: wallet })
      }
    })
    this.hideModal()
  }

  renderComfirmModal() {
    const action = this.state.action
    const validator = this.state.selectedValidator
    const address = validator ? validator.address : null

    return(
      <Modal
        title={action}
        visible={this.state.modalVisible}
        onOk={() => this.sendTx(validator)}
        onCancel={this.hideModal}
        okText="Send Transaction"
        cancelText="Cancel"
      >
        <p>Validator's address: {address}</p>
        {(action !== 'leave' && action !== 'updateMetadata') && (<div><p>Amount: </p><InputNumber min={0} defaultValue={0} onChange={this.onAmountChange.bind(this)} /></div>)}
        {(action === 'join') && (<div><p>Coinbase: </p><Input defaultValue={'0x0'} onChange={this.onCoinbaseChange.bind(this)} /></div>)}
        {(action === 'updateMetadata') && (
          <div>
            <p>First name: </p>
            <Input defaultValue={''} onChange={this.onFirstnameChange.bind(this)} />
            <p>Last name: </p>
            <Input defaultValue={''} onChange={this.onLastnameChange.bind(this)} />

            <p>License ID: </p>
            <Input defaultValue={''} onChange={this.onLicenseIdChange.bind(this)} />
            <p>Full Address: </p>
            <Input defaultValue={''} onChange={this.onFullAddressChange.bind(this)} />

            <p>State: </p>
            <Input defaultValue={''} onChange={this.onStateChange.bind(this)} />
            <p>Zip code: </p>
            <Input defaultValue={''} onChange={this.onZipcodeChange.bind(this)} />

            <p>Expiration Date: </p>
            <InputNumber min={0} defaultValue={0} onChange={this.onExpirationDateChange.bind(this)} />
            <p>Created Date: </p>
            <InputNumber min={0} defaultValue={0} onChange={this.onCreatedDateChange.bind(this)} />

            <p>Updated Date: </p>
            <InputNumber min={0} defaultValue={0} onChange={this.onUpdatedDateChange.bind(this)} />
            <p>Min Threshold: </p>
            <InputNumber min={0} defaultValue={0} onChange={this.onMinThresholdChange.bind(this)} />

            <p>Email Address: </p>
            <Input defaultValue={''} onChange={this.onContactEmailChange.bind(this)} />
            <p>Company Name: </p>
            <Select defaultValue={false} onChange={this.onIsCompanyChange.bind(this)}>
              <Option value={false}>No</Option>
              <Option value={true}>Yes</Option>
            </Select>
          </div>
        )}
      </Modal>)
  }
}

const TriColTitle = styled.h3`
  line-height: 1.1;
`

const TriColDesc = styled.p`
  font-weight: 200;
  font-size: 18px;
`

const MainContainer = styled.div`
  /* max-width: 1200px; */
  margin: 0 auto;
  text-align: center;
`

const LogoContainer = styled.div`
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  :after {
    content: '';
    height: 70%;
    width: 1px;
    position: absolute;
    right: 0;
    z-index: 1000;
    bottom: 0;
    background-color: #e5e5e5;
  }
`

const ElaContainer = styled.div`
  width: 50%;
  float: left;
`

const Logo = styled.img`
`

const ElaRow = styled(Row)`
  background-color: rgba(124, 127, 134, 0.1);
  padding: 40px;
  display: flex;
  align-items: center;
`

const CRRow = styled(ElaRow)`
  background-color: #F6F9FD;;
`

const CRContainer = styled.div`
  overflow: hidden;
`

const InfoCol = styled(Col)`
`

const InfoColRight = styled(InfoCol)`
  background-position: center left;
`

const InfoColMid = styled(InfoCol)`
  background: none;
`

const InfoImgContainer = styled.div`
  height: 90px;
  display: flex;
  align-items: center;
`

const InfoImgContainerCR = styled.div`
  height: 90px;
  display: flex;
  align-items: center;
`

const InfoImg = styled.img`
  max-width: 90%;
  margin: 0 auto;
  display: block;
`

const InfoDesc = styled.div`
  line-height: 1.8;
`

const ClearFix = styled.div`
  clear: both;
`

const CRLogoMobText = styled.div`
  font-weight: 200;
  text-align: center;
  margin-top: 20px;
`

const InfoRowMob = styled.div`
  margin-top: 24px;
  padding: 36px 0 12px 0;
  border-top: 2px solid #e0e0e0;
  text-align: center;
`

const CRLogoMobContainer = styled.div`
  margin-top: 24px;
  padding: 36px 0 12px 0;
  text-align: center;
`
