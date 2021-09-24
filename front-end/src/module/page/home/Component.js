import React from 'react'
import _ from 'lodash'
import './style.scss'
import Web3 from 'web3'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { format } from 'numeral'
import EmptyPage from '../EmptyPage'
import { helps } from '@/util'
import { formatNumber } from '../../../util/helps'

const BigNumber = require('bignumber.js')
const JSON = require('@/../../back-end/build/contracts/Validator.json')

let intervalID = 0

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

const emptyValidator = {
  isActive: true,
  isSlashed: false,
  startTimerAtBlock: 0,
  frozenBalance: '0',
  claimedSum: '0',
  penalizedSum: '0',
  penalizedTimes: 0,
  royaltyPoint: 0,
  sealedBlocks: 0,
  unlockedAt: 0,
  _id: '5e53c9f5e9bef71a0955fe86',
  address: '0x0000000000000000000000000000000000000000',
  coinbase: ZERO_ADDRESS,
  stake: '0',
  credit: '0',
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
export default class extends EmptyPage {
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
      isCompany: false,

      frozenBalance: 0,
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
            networkFee: await this.getFee(
              '0x0000000000000000000000000000000000000072'
            ),
          })
          // this.getFee(accounts[0])

          const methods = await this.initMethods()
          const wallet = accounts[0]
          const frozenBalance = await methods
            .getFrozenBalance(wallet)
            .call()
          this.setState({
            frozenBalance,
          })
        }
      })
    } catch (e) {
      console.log('xxx metamask not found')
      const web3 = new Web3('https://rpc.draken.exchange')
      this.setState({
        web3,
        wallet: '0x0000000000000000000000000000000000000000',
        accountFee: await this.getFee(
          '0x0000000000000000000000000000000000000000'
        ),
        networkFee: await this.getFee(
          '0x0000000000000000000000000000000000000072'
        ),
      })
    }
  }

  async getFee(address) {
    const web3 = new Web3('https://rpc.draken.exchange')
    const payload = {
      jsonrpc: '2.0',
      method: 'eth_getFee',
      params: [address, 'latest'],
      id: 1,
    }
    // const rs = await window.ethereum.sendAsync(payload)
    const hexValue = await new Promise((resolve, reject) => {
      web3.currentProvider.send(payload, (err, response) => {
        if (!err) {
          resolve(response.result)
        } else {
          resolve(0x0)
        }
      })
    })
    const rs = new BigNumber(hexValue)
    return rs.toFixed(0)
  }

  async componentDidMount() {
    try {
      await window.ethereum.enable()
    } catch (e) {}
    await this.props.loadValidators()
    await this.props.loadContractStates()
    this.setupWeb3()
    console.log('xxx', this.props.validators)
    console.log('xxx', this.props.contractStates)
    const self = this
    intervalID = setInterval(async () => {
      await self.props.loadValidators()
      await self.props.loadContractStates()
    }, 10000)
  }

  componentWillUnmount() {
    clearInterval(intervalID)
  }

  async initMethods() {
    const { contractAddress } = this.props.contractStates
    const web3 = new Web3(window.ethereum)
    const { abi } = JSON
    const contract = new web3.eth.Contract(abi, contractAddress)
    const { methods } = contract
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

  showModal = () => {
    this.setState({
      modalVisible: true,
    })
  };

  hideModal = () => {
    this.setState({
      modalVisible: false,
    })
  };

  async showStakeModal(validator) {
    this.setState({
      action: 'stake',
      selectedValidator: validator,
    })
    this.showModal()
  }

  async showUnstakeModal(validator) {
    this.setState({
      action: 'unstake',
      selectedValidator: validator,
    })
    this.showModal()
  }

  async showLeaveModal(validator) {
    this.setState({
      action: 'leave',
      selectedValidator: validator,
    })
    this.showModal()
  }

  async showJoinModal() {
    this.setState({
      action: 'join',
      // selectedValidator: validator
    })
    this.showModal()
  }

  async showUpdateMetadataModal(validator) {
    this.setState({
      action: 'updateMetadata',
      selectedValidator: validator,
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

  async cashout(frozenBalance) {
    window.web3.eth.getAccounts(async (err, accounts) => {
      const methods = await this.initMethods()
      const wallet = accounts[0]
      await methods.cashout(frozenBalance).send({ from: wallet })
    })
  }

  // renderComfirmModal() {
  //   const action = this.state.action
  //   const validator = this.state.selectedValidator
  //   const address = validator ? validator.address : null

  //   return(
  //     <Modal
  //       title={action}
  //       visible={this.state.modalVisible}
  //       onOk={() => this.sendTx(validator)}
  //       onCancel={this.hideModal}
  //       okText="Send Transaction"
  //       cancelText="Cancel"
  //     >
  //       <p>Validator's address: {address}</p>
  //       {(action !== 'leave' && action !== 'updateMetadata') && (<div><p>Amount: </p><InputNumber min={0} defaultValue={0} onChange={this.onAmountChange.bind(this)} /></div>)}
  //       {(action === 'join') && (<div><p>Coinbase: </p><Input defaultValue={'0x0'} onChange={this.onCoinbaseChange.bind(this)} /></div>)}
  //       {(action === 'updateMetadata') && (
  //         <div>
  //           <p>First name: </p>
  //           <Input defaultValue={''} onChange={this.onFirstnameChange.bind(this)} />
  //           <p>Last name: </p>
  //           <Input defaultValue={''} onChange={this.onLastnameChange.bind(this)} />

  //           <p>License ID: </p>
  //           <Input defaultValue={''} onChange={this.onLicenseIdChange.bind(this)} />
  //           <p>Full Address: </p>
  //           <Input defaultValue={''} onChange={this.onFullAddressChange.bind(this)} />

  //           <p>State: </p>
  //           <Input defaultValue={''} onChange={this.onStateChange.bind(this)} />
  //           <p>Zip code: </p>
  //           <Input defaultValue={''} onChange={this.onZipcodeChange.bind(this)} />

  //           <p>Expiration Date: </p>
  //           <InputNumber min={0} defaultValue={0} onChange={this.onExpirationDateChange.bind(this)} />
  //           <p>Created Date: </p>
  //           <InputNumber min={0} defaultValue={0} onChange={this.onCreatedDateChange.bind(this)} />

  //           <p>Updated Date: </p>
  //           <InputNumber min={0} defaultValue={0} onChange={this.onUpdatedDateChange.bind(this)} />
  //           <p>Min Threshold: </p>
  //           <InputNumber min={0} defaultValue={0} onChange={this.onMinThresholdChange.bind(this)} />

  //           <p>Email Address: </p>
  //           <Input defaultValue={''} onChange={this.onContactEmailChange.bind(this)} />
  //           <p>Company Name: </p>
  //           <Select defaultValue={false} onChange={this.onIsCompanyChange.bind(this)}>
  //             <Option value={false}>No</Option>
  //             <Option value={true}>Yes</Option>
  //           </Select>
  //         </div>
  //       )}
  //     </Modal>)
  // }

  renderModal() {
    const validators = this.props.validators ? this.props.validators : []
    const { wallet } = this.state
    const { action } = this.state
    const validator = getValidator(wallet, validators)
    const address = validator ? validator.address : null
    let title = ''
    switch (action) {
      case 'join':
        title = 'Become a DRK validator'
        break
      case 'stake':
        title = 'Staking'
        break
      case 'unstake':
        title = 'Unstaking'
        break
      case 'claim':
        title = 'Claim Reward'
        break
      case 'cashout':
        title = 'Withdraw unlocked reward'
        break
      default:
        title = 'Update Informations'
    }
    return this.state.modalVisible ? (
      <div className="bg-form">
        <div id="formValidator">
          <div className="title text-center">
            <h2>{title}</h2>
          </div>
          <div className="form-content">
            <div className="form-group">
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label className="validator-address">
                  Validator's address:
                </label>
                <label className="validator-address">{address}</label>
              </div>
            </div>
            {action !== 'leave' && action !== 'updateMetadata' && (
              <div className="form-group">
                <label className="amount d-block">Amount: </label>
                <input
                  type="number"
                  defaultValue={0}
                  onChange={this.onAmountChange.bind(this)}
                />
              </div>
            )}
            {action === 'join' && (
              <div className="form-group">
                <label className="amount d-block">Coinbase: </label>
                <input
                  type="text"
                  defaultValue="0x0"
                  onChange={this.onCoinbaseChange.bind(this)}
                />
              </div>
            )}
            {action === 'updateMetadata' && (
              <div>
                <label className="amount d-block">First name: </label>
                <input
                  defaultValue=""
                  onChange={this.onFirstnameChange.bind(this)}
                />

                <label className="amount d-block">Last name: </label>
                <input
                  defaultValue=""
                  onChange={this.onLastnameChange.bind(this)}
                />

                <label className="amount d-block">License ID: </label>
                <input
                  defaultValue=""
                  onChange={this.onLicenseIdChange.bind(this)}
                />

                <label className="amount d-block">Full Address: </label>
                <input
                  defaultValue=""
                  onChange={this.onFullAddressChange.bind(this)}
                />

                <label className="amount d-block">State: </label>
                <input
                  defaultValue=""
                  onChange={this.onStateChange.bind(this)}
                />

                <label className="amount d-block">Zip code: </label>
                <input
                  defaultValue=""
                  onChange={this.onZipcodeChange.bind(this)}
                />

                <label className="amount d-block">Email Address: </label>
                <input
                  defaultValue=""
                  onChange={this.onContactEmailChange.bind(this)}
                />

                {/* <p>Expiration Date: </p>
                <InputNumber min={0} defaultValue={0} onChange={this.onExpirationDateChange.bind(this)} />
                <p>Created Date: </p>
                <InputNumber min={0} defaultValue={0} onChange={this.onCreatedDateChange.bind(this)} />

                <p>Updated Date: </p>
                <InputNumber min={0} defaultValue={0} onChange={this.onUpdatedDateChange.bind(this)} />
                <p>Min Threshold: </p>
                <InputNumber min={0} defaultValue={0} onChange={this.onMinThresholdChange.bind(this)} /> */}

                {/* <p>Company Name: </p>
                <Select defaultValue={false} onChange={this.onIsCompanyChange.bind(this)}>
                  <Option value={false}>No</Option>
                  <Option value={true}>Yes</Option>
                </Select> */}
              </div>
            )}
            <div className="button-submit pt-3">
              <button
                className="btn-form-submit"
                onClick={() => this.sendTx(validator)}
              >
                SEND Tx
              </button>
              <button className="btn-cancel" onClick={() => this.hideModal()}>
                CANCEL
              </button>
            </div>
          </div>
        </div>
      </div>
    ) : (
      <div />
    )
  }

  renderContractStates() {
    const data = this.props.contractStates ? this.props.contractStates : null
    const dataSource = []
    if (data) {
    }

    return (
      <div>
        <p className="title-data">Network Data</p>
        <table className="network-data">
          <thead>
            <tr>
              <td className="w20"> Key Factor</td>
              <td className="w80"> Key Value </td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td> Block Number</td>
              <td>
                {' '}
                {data ? formatNumber(data.blockNumber) : 'Loading'}
              </td>
            </tr>
            <tr>
              <td> Validator Count</td>
              <td>{data ? formatNumber(data.count) : 'loading'}</td>
            </tr>
            <tr>
              <td> Stake Required</td>
              <td>
                {' '}
                {data
                  ? formatNumber(
                    Math.round(
                      Web3.utils.fromWei(data.stakeRequired, 'ether')
                    )
                  )
                  : 'loading'}
              </td>
            </tr>
            <tr>
              <td> Safe Range</td>
              <td>
                {' '}
                {data ? data.safeRange : 'loading'}
              </td>
            </tr>
            <tr>
              <td> Total Stake</td>
              <td>
                {' '}
                {data
                  ? formatNumber(
                    Math.round(Web3.utils.fromWei(data.totalSupply, 'ether'))
                  )
                  : 'loading'}
              </td>
            </tr>
            <tr>
              <td> Circulating Supply</td>
              <td>
                {' '}
                {data
                  ? formatNumber(
                    Math.round(((Number(data.coinSupply) + 340000000 * 1e18 - Number(data.burned))/ 1e18).toFixed(0))
                  )
                  : 'loading'}
              </td>
            </tr>
            <tr>
              <td> Burned</td>
              <td>
                {' '}
                {data
                  ? formatNumber(
                    Math.round((Number(data.burned) / 1e18).toFixed(0))
                  )
                  : 'loading'}
              </td>
            </tr>
            <tr>
              <td>Network Fee</td>
              <td>
                {data
                  ? formatNumber(
                    Math.round(
                      Web3.utils.fromWei(this.state.networkFee, 'ether')
                    )
                  )
                  : 'loading'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }

  renderValidators() {
    const validators = this.props.validators ? this.props.validators : []
    const dataSource = validators.filter((validator) => {
      return validator.coinbase && validator.stake
    })
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
    return (
      <div>
        <p className="title-list" style={{ marginTop: 16 }}>
          Validator List
        </p>
        <div className="wrapper-table">
          <table className="valid-list">
            <thead>
              <tr>
                <th> Address</th>
                <th> Frozen</th>
                <th> Stake</th>
                <th> Cashout</th>
                <th> Reported</th>
                <th> Penalized</th>
                <th> Block</th>
                <th> Report</th>
              </tr>
            </thead>
            <tbody>
              {validators
                .filter((validator) => +validator.stake > 0)
                .map((validator) => {
                  const countdown = reportIn(validator.startTimerAtBlock)
                  const text = countdown <= 0 ? '' : `(${countdown})`
                  return (
                    <tr>
                      <td>
                        <div style={{ display: 'flex' }}>
                          {helps.cutString(validator.address)}
                          <CopyToClipboard text={validator.address}>
                            <div
                              style={{
                                cursor: 'pointer',
                                marginLeft: 10,
                              }}
                            >
                              <img src={require('./assets/icon-copy.png')} />
                            </div>
                          </CopyToClipboard>
                        </div>
                      </td>
                      <td>
                        {' '}
                        {formatNumber(
                          Math.round(
                            helps.fromWei(validator.frozenBalance, decimals)
                          )
                        )}
                      </td>
                      <td>
                        {' '}
                        {formatNumber(
                          Math.round(helps.fromWei(validator.stake, decimals))
                        )}
                      </td>
                      <td>
                        {' '}
                        {formatNumber(
                          Math.round(
                            helps.fromWei(validator.claimedSum, decimals)
                          )
                        )}
                      </td>
                      <td>
                        {' '}
                        {formatNumber(validator.penalizedTimes)}
                      </td>
                      <td>
                        {' '}
                        {formatNumber(
                          Math.round(
                            helps.fromWei(validator.penalizedSum, decimals)
                          )
                        )}
                      </td>
                      <td>
                        {' '}
                        {formatNumber(validator.sealedBlocks)}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn-report"
                          onClick={() => this.report(validator.address)}
                          // disabled={countdown !== 0}
                          disabled={true}
                        >
                          <i className="fas fa-bolt" />
                          Report
                        </button>
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  renderSelectedValidator() {
    const validators = this.props.validators ? this.props.validators : []
    const { wallet } = this.state
    // console.log('xxx validators', validators)
    const selectedValidator = getValidator(
      // '0xf87c85a0d4ddca0e7d72165c308f40f6c82f54b5',
      wallet,
      validators
    )
    const contractStates = this.props.contractStates
      ? this.props.contractStates
      : null
    const CPT_ZOOM = contractStates ? BigNumber('2').exponentiatedBy(40) : '1'
    const cpt = contractStates && contractStates.cpt ? contractStates.cpt : '0'
    const stake = selectedValidator.stake ? selectedValidator.stake : '0'
    const credit =
      cpt && selectedValidator.credit ? selectedValidator.credit : '0'
    const reward = BigNumber(cpt)
      .times(BigNumber(stake))
      .idiv(BigNumber(CPT_ZOOM))
      .minus(BigNumber(credit))
    return (
      <div className="content-bottom">
        <h2 className="block-header">Your DRK Validator</h2>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <p className="title-detail">
            Validator Details
            {/* <button className="btn btn-validator uppercase">Become a DRK Validator</button> */}
          </p>
          {selectedValidator.coinbase === ZERO_ADDRESS && (
            <button
              type="button"
              className="btn btn-validator uppercase"
              onClick={() => this.showJoinModal()}
            >
              Become a DRK Validator
            </button>
          )}
        </div>
        <div className="wrapper-table">
          <table className="validate-detail">
            <thead>
              <tr>
                <td> Key</td>
                <td> Value</td>
                <td className="col-right"> Action</td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td> Account Fee</td>
                <td>
                  {' '}
                  {formatNumber(helps.fromWei(this.state.accountFee, 0))}
                </td>
                <td className="col-right" />
              </tr>
              <tr>
                <td> Stake Balance</td>
                <td>
                  {' '}
                  {formatNumber(helps.fromWei(selectedValidator.stake, 0))}
                </td>
                <td className="col-right">
                  {selectedValidator.stake > 0 && (
                    <div>
                      <button
                        type="button"
                        className="btn my-2 btn-stake"
                        onClick={() => this.showStakeModal(selectedValidator)}
                      >
                        STAKE
                      </button>
                      <button
                        type="button"
                        className="btn my-2 btn-unstake"
                        onClick={() => this.showUnstakeModal(selectedValidator)}
                      >
                        UNSTAKE
                      </button>
                      <button
                        type="button"
                        className="btn my-2 btn-leave"
                        disabled={validators.length < 4}
                        onClick={() => this.showLeaveModal(selectedValidator)}
                      >
                        LEAVE
                      </button>
                    </div>
                  )}
                </td>

                {/* <td className="col-right">
                <div className="btn my-2 btn-stake" onClick={() => this.showStakeModal(selectedValidator)}>STAKE</div>
                <div className="btn my-2 btn-unstake" onClick={() => this.showUnstakeModal(selectedValidator)}>UNSTAKE</div>
                <div className="btn my-2 btn-leave" onClick={() => this.showLeaveModal(selectedValidator)}>LEAVE</div>
              </td> */}
              </tr>
              <tr>
                <td> Metadata</td>
                <td>
                  {' '}
                  {selectedValidator.metadata
                    ? helps.getMetadata(selectedValidator.metadata)
                    : 'Not set'}
                </td>
                <td className="col-right">
                  {selectedValidator.stake > 0 && (
                    <div
                      className="btn btn-stake"
                      onClick={() => this.showUpdateMetadataModal(selectedValidator)
                      }
                    >
                      UPDATE
                    </div>
                  )}
                </td>
              </tr>
              <tr>
                <td> Reward Balance</td>
                <td>
                  {' '}
                  {reward.toString().length > 60
                    ? '0'
                    : formatNumber(helps.fromWei(reward.toFixed(0), 0))}
                </td>
                <td className="col-right">
                  {reward > 0 && (
                    <div
                      className="btn btn-stake"
                      onClick={() => this.claim(selectedValidator)}
                    >
                      CLAIM
                    </div>
                  )}
                </td>
              </tr>
              <tr>
                <td> Frozen Balance</td>
                <td>
                  {' '}
                  {formatNumber(
                    Math.round(
                      helps.fromWei(this.state.frozenBalance, decimals)
                    )
                  )}
                </td>
                <td className="col-right">
                  {this.state.frozenBalance > 0 && (
                    <div
                      className="btn btn-stake"
                      onClick={() => this.cashout(this.state.frozenBalance)}
                    >
                      UNFREEZE
                    </div>
                  )}
                </td>
              </tr>
              <tr>
                <td> Coinbase</td>
                <td>
                  {' '}
                  {helps.cutString(selectedValidator.coinbase)}
                </td>
                <td />
              </tr>
              <tr>
                <td> Royalty Points</td>
                <td>
                  {' '}
                  {formatNumber(selectedValidator.royaltyPoint)}
                </td>
                <td />
              </tr>
              <tr>
                <td> Claimed Reward</td>
                <td>
                  {' '}
                  {formatNumber(helps.fromWei(selectedValidator.claimedSum, 0))}
                </td>
                <td />
              </tr>
              <tr>
                <td> Penalized Sum</td>
                <td>
                  {' '}
                  {formatNumber(
                    helps.fromWei(selectedValidator.penalizedSum, 0)
                  )}
                </td>
                <td />
              </tr>
              <tr>
                <td> Penalized Times</td>
                <td>
                  {' '}
                  {formatNumber(selectedValidator.penalizedTimes)}
                </td>
                <td />
              </tr>
              <tr>
                <td> Unlocked Time</td>
                <td>
                  {' '}
                  {formatNumber(selectedValidator.unlockedAt)}
                </td>
                <td />
              </tr>
              <tr>
                <td> Sealed Blocks</td>
                <td>
                  {' '}
                  {formatNumber(selectedValidator.sealedBlocks)}
                </td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  ord_renderContent() {
    const validators = this.props.validators ? this.props.validators : []
    const dataSource = validators.filter((validator) => {
      return validator.coinbase && validator.stake
    })
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

    return (
      <div>
        {this.renderModal()}
        <div className="bg-wrapper" />
        <div className="layout-content">
          <section>
            <div id="header">
              <div className="bg-header">
                <div className="bg-img-header" />
                <div className="menu-header pt-3">
                  <ul className="menu-main">
                    <li className="menu-main-item mx-3">
                      <a className="menu-main-item-content" href="#">
                        DRK DEFI CHAIN
                        <i className="fas fa-sort-down px-2" />
                      </a>
                      <ul className="sub-menu">
                        <li className="sub-menu-item">
                          <a href="https://explorer.draken.tech">Explorer</a>
                        </li>
                        <li className="sub-menu-item">
                          <a href="https://staking.draken.tech">Staking</a>
                        </li>

                      </ul>
                    </li>
                    <li className="menu-main-item mx-3">
                      <a className="menu-main-item-content" href="#">
                        ECOSYSTEM
                        <i className="fas fa-sort-down px-2" />
                      </a>
                      <ul className="sub-menu">
                        <li className="sub-menu-item">
                          <a href="https://draken.exchange">DRK DEX</a>
                        </li>
                        <li className="sub-menu-item">
                          <a href="https://drakenx.io">DrakenX</a>
                        </li>

                      </ul>
                    </li>
                    <li className="menu-main-item mx-3">
                      <a className="logo" href="https://draken.exchange">
                        <img src="./assets/Logo.png" alt="" />
                      </a>
                    </li>
                    <li className="menu-main-item mx-3">
                      <a
                        className="menu-main-item-content menu-icon"
                        href="http://t.me/Drakentech"
                      >
                        ANNOUNCE
                        <img src="./assets/icon-announce.png" />
                      </a>
                    </li>
                    <li className="menu-main-item mx-3">
                      <a
                        className="menu-main-item-content menu-icon"
                        href="#"
                      >
                        BOUNTY (soon)
                        <img src="./assets/icon-github.png" />
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="menu-mobile">
                  <a href="https://draken.exchange">
                    <div className="logo">
                      <img src="./assets/Logo.png" alt="" />
                    </div>
                  </a>
                  <button id="btn-menu-mobile">
                    <i className="fas fa-bars" />
                  </button>
                  <div className="menu-mobile-widget">
                    <div className="d-block text-center">
                      <a href="https://draken.exchange">
                        <div className="logo logo-mobile">
                          <img src="./assets/Logo.png" alt="" />
                        </div>
                      </a>
                      <button id="btn-close-menu-mobile">
                        <i className="fas fa-times" />
                      </button>
                    </div>
                    <div className="menu-content mt-3">
                      <ul className="menu-list-mobile">
                        <div className="nav-box">
                          <li className="sidebar-item">
                            <a href="#">
                              DRK DEFI CHAIN
                              <i className="fas fa-sort-down px-2" />
                            </a>
                          </li>
                          <ul className="sibar-menu-sub-1 px-2">
                            <div className="nav-box-1">
                              <li className="sidebar-item">
                                <a href="https://explorer.draken.tech">
                                  Explorer
                                </a>
                              </li>
                              <li className="sidebar-item">
                                <a href="https://staking.draken.tech">Staking</a>
                              </li>

                            </div>
                          </ul>
                        </div>
                        <div className="nav-box">
                          <li className="sidebar-item">
                            <a href="#">
                              ECOSYSTEM
                              <i className="fas fa-sort-down px-2" />
                            </a>
                          </li>
                          <ul className="sibar-menu-sub-1 px-2">
                            <div className="nav-box-1">
                              <li className="sidebar-item">
                                <a href="https://draken.exchange">DRK DEX</a>
                              </li>
                              <li className="sidebar-item">
                                <a href="https://drakenx.io">
                                  DrakenX
                                </a>
                              </li>

                            </div>
                          </ul>
                        </div>
                        <div className="nav-box">
                          <li className="sidebar-item">
                            <a href="http://t.me/DrakenTech">
                              ANNOUNCE
                              <img src="./assets/icon-announce.png" />
                            </a>
                          </li>
                        </div>
                        <div className="nav-box">
                          <li className="sidebar-item">
                            <a href="#">
                              BOUNTY (soon)
                              <img src="./assets/icon-github.png" />
                            </a>
                          </li>
                        </div>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <main id="main-content">
            <div className="container table-custom" id="public-network">
              <h2 className="block-header">DRK Public Network</h2>

              {this.renderContractStates()}

              {this.renderValidators()}

              {/* <div className="pagination">
                      <div className="btn-pag"> &lt;&lt;</div>
                      <div className="btn-pag btn-pag-index">1</div>
                      <div className="btn-pag">&gt;&gt;</div>
                    </div> */}
            </div>
            <div
              className="container table-custom"
              style={{ marginTop: 20, paddingTop: 20, paddingBottom: 20 }}
            >
              {this.renderSelectedValidator()}
            </div>
          </main>
          <div id="footer">
            <div className="bg-footer">
              <div className="container px-0 pos-backtotop">
                <div className="footer-top bg-white py-3">
                  <div className="icon-contact">
                    {/* <a className="mx-2" href="http://t.me/DrakenTech">
                      <img src="./assets/icon-1.png" />
                    </a>
                    <a className="mx-2" href="https://twitter.com/DRKDeFi">
                      <img src="./assets/icon-2.png" />
                    </a>
                    <a className="mx-2" href="http://github.com/drakentech">
                      <img src="./assets/icon-3.png" />
                    </a> */}
                  </div>
                  <div className="content-contact">
                    <div className="txt-contact">
                      <div className="tilte">
                        <strong>Email: </strong>
                        contact@draken.tech
                      </div>
                    </div>
                    <div className="txt-contact">
                      <div className="tilte">
                        <strong>Channel: </strong>
                        T.me/DrakenTech
                      </div>
                    </div>
                  </div>
                </div>
                <div className="footer-bottom bg-white py-3">
                  <div className="footer-bottom_content w-100 text-center">
                    <span>© 2020 Draken Tech. All rights reserved.</span>
                  </div>
                </div>
                <button
                  id="btn-backtotop"
                  onClick={() => {
                    window.scrollTo({
                      top: 0,
                      left: 0,
                      behavior: 'smooth',
                    })
                  }}
                >
                  <img src="./assets/backtotop.png" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  showModal = () => {
    this.setState({
      modalVisible: true,
    })
  };

  hideModal = () => {
    this.setState({
      modalVisible: false,
    })
  };

  onAmountChange(e) {
    this.setState({
      amount: e.target.value,
    })
  }

  onCoinbaseChange(e) {
    this.setState({
      coinbase: e.target.value,
    })
  }

  onFirstnameChange(e) {
    this.setState({
      firstname: e.target.value,
    })
  }

  onLastnameChange(e) {
    this.setState({
      lastname: e.target.value,
    })
  }

  onLicenseIdChange(e) {
    this.setState({
      licenseId: e.target.value,
    })
  }

  onFullAddressChange(e) {
    this.setState({
      fullAddress: e.target.value,
    })
  }

  onStateChange(e) {
    this.setState({
      state: e.target.value,
    })
  }

  onZipcodeChange(e) {
    this.setState({
      zipcode: e.target.value,
    })
  }

  onExpirationDateChange(value) {
    this.setState({
      expirationDate: value,
    })
  }

  onCreatedDateChange(value) {
    this.setState({
      createdDate: value,
    })
  }

  onUpdatedDateChange(value) {
    this.setState({
      updatedDate: value,
    })
  }

  onMinThresholdChange(value) {
    this.setState({
      minThreshold: value,
    })
  }

  onContactEmailChange(e) {
    this.setState({
      contactEmail: e.target.value,
    })
  }

  onIsCompanyChange(value) {
    this.setState({
      isCompany: value,
    })
  }

  sendTx(validator) {
    const { action } = this.state
    const { amount } = this.state
    const { coinbase } = this.state
    const metadata = this.state
    const wei = Web3.utils.toWei(String(amount), 'ether')
    console.log('xxx action', action)
    console.log('xxx wei', wei)
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
}
