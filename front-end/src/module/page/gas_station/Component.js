import React from 'react'
import _ from 'lodash'
import './style.scss'
import EmptyPage from '../EmptyPage'
import Web3 from 'web3'
const BigNumber = require('bignumber.js')
import {helps} from '@/util'
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
export default class extends EmptyPage {
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
    const web3 = new Web3('https://rpc.draken.exchange')
    window.web3.eth.getAccounts(async (err, accounts) => {
      console.log('xxx accounts', accounts)
      if (accounts.length > 0) {
        this.setState({
          wallet: accounts[0],
          accountFee: await this.getFee(web3, accounts[0]),
        })
      }
    })
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
    const web3 = new Web3('https://rpc.draken.exchange')
    const payload = {
      jsonrpc: '2.0',
      method: 'eth_getFee',
      params: [address, 'latest'],
      id: 1,
    }
    // const rs = await window.ethereum.sendAsync(payload)
    const hexValue =  await new Promise(function (resolve, reject) {
      web3.currentProvider.send(payload, function (err, response) {
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
    await window.ethereum.enable()
    this.setupWeb3()
  }



  ord_renderContent() {
    // console.log('xxx dataSource', dataSource)

    return (
            <div>
              <div className="bg-wrapper" />
              <div className="layout-content">
                <section>
                  <div id="header">
                    <div className="bg-header">
                      <div className="bg-img-header" />
                      <div className="menu-header pt-3">
                        <ul className="menu-main">
                          <li className="menu-main-item mx-3"><a className="menu-main-item-content" href="#">
                              DRK CHAIN<i className="fas fa-sort-down px-2" /></a>
                            <ul className="sub-menu">
                              <li className="sub-menu-item"><a href="http://explorer.draken.tech">Explorer</a></li>
                              <li className="sub-menu-item"><a href="http://staking.draken.tech">Staking</a></li>
                              <li className="sub-menu-item"><a href="#">Privacy (Soon)</a></li>
                            </ul>
                          </li>
                          <li className="menu-main-item mx-3"><a className="menu-main-item-content" href="#">
                              JOIN<i className="fas fa-sort-down px-2" /></a>
                            <ul className="sub-menu">
                              <li className="sub-menu-item"><a href="http://draken.group/products">Sale</a></li>
                              <li className="sub-menu-item"><a href="#">Exchange (Soon)</a></li>
                              <li className="sub-menu-item"><a href="#">Play (Soon)</a></li>
                            </ul>
                          </li>
                          <li className="menu-main-item mx-3"><a className="logo" href="http://draken.tech"><img src="./assets/Logo.png" alt="" /></a></li>
                          <li className="menu-main-item mx-3"><a className="menu-main-item-content menu-icon" href="http://t.me/DrakenTech">ANNOUNCE<img src="./assets/icon-announce.png" /></a></li>
                          <li className="menu-main-item mx-3"><a className="menu-main-item-content menu-icon" href="http://github.com/drakentech">BUILD<img src="./assets/icon-github.png" /></a></li>
                        </ul>
                      </div>
                      <div className="menu-mobile"><a href="http://draken.tech">
                          <div className="logo"><img src="./assets/Logo.png" alt="" /></div></a>
                        <button id="btn-menu-mobile"><i className="fas fa-bars" /></button>
                        <div className="menu-mobile-widget">
                          <div className="d-block text-center"><a href="http://draken.tech">
                              <div className="logo logo-mobile"><img src="./assets/Logo.png" alt="" /></div></a>
                              <button id="btn-close-menu-mobile"><i className="fas fa-times" /></button></div>
                          <div className="menu-content mt-3">
                            <ul className="menu-list-mobile">
                              <div className="nav-box">
                                <li className="sidebar-item"><a href="#">
                                    DRK CHAIN<i className="fas fa-sort-down px-2" /></a></li>
                                <ul className="sibar-menu-sub-1 px-2">
                                  <div className="nav-box-1">
                                    <li className="sidebar-item"><a href="http://explorer.draken.tech">Explorer</a></li>
                                    <li className="sidebar-item"><a href="http://staking.draken.tech">Staking</a></li>
                                    <li className="sidebar-item"><a href="#">Privacy (Soon)</a></li>
                                  </div>
                                </ul>
                              </div>
                              <div className="nav-box">
                                <li className="sidebar-item"><a href="#">
                                    JOIN<i className="fas fa-sort-down px-2" /></a></li>
                                <ul className="sibar-menu-sub-1 px-2">
                                  <div className="nav-box-1">
                                    <li className="sidebar-item"><a href="http://draken.group/products">Sale</a></li>
                                    <li className="sidebar-item"><a href="#">Exchange (Soon)</a></li>
                                    <li className="sidebar-item"><a href="#">Play (Soon)</a></li>
                                  </div>
                                </ul>
                              </div>
                              <div className="nav-box">
                                <li className="sidebar-item"><a href="http://t.me/DrakenTech">ANNOUNCE<img src="./assets/icon-announce.png" /></a></li>
                              </div>
                              <div className="nav-box">
                                <li className="sidebar-item"><a href="http://github.com/drakentech"> BUILD<img src="./assets/icon-github.png" /></a></li>
                              </div>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
                <main id="main-content">
                  <div className="container table-custom" id="gas-station">
                    <h2 style={{marginBottom: 20}}>Gas Station</h2>
                    <div className="wrapper-table">
                      <table className="gas-station">
                        <thead>
                          <tr>
                            <td className="w20"> Key</td>
                            <td className="w80"> Value</td>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td> Account</td>
                            <td> {this.state.wallet}</td>
                          </tr>
                          <tr>
                            <td> Account Loyalty</td>
                            <td> {helps.getXFactor(this.state.networkFee, this.state.accountFee)}</td>
                          </tr>
                          <tr>
                            <td> Account Total Fee</td>
                            <td> {helps.fromWei(this.state.accountFee, decimals)} DRK</td>
                          </tr>
                          <tr>
                            <td> Network Total Fee</td>
                            <td> {helps.fromWei(this.state.networkFee, decimals)} DRK</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </main>
                <div id="footer">
                  <div className="bg-footer">
                    <div className="container px-0 pos-backtotop">
                      <div className="footer-top bg-white py-3">
                        <div className="icon-contact"><a className="mx-2" href="http://t.me/DrakenTech"><img src="./assets/icon-1.png" /></a><a className="mx-2" href="https://twitter.com/DRKDeFi"><img src="./assets/icon-2.png" /></a><a className="mx-2" href="http://github.com/drakentech"><img src="./assets/icon-3.png" /></a></div>
                        <div className="content-contact">
                          <div className="txt-contact">
                            <div className="tilte">
                              <strong>Email:</strong> contact@draken.tech
                            </div>
                          </div>
                          <div className="txt-contact">
                            <div className="tilte">
                              <strong>Director:</strong> Daniel Harvey
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="footer-bottom bg-white py-3">
                        <div className="footer-bottom_content w-100 text-center"><span>© 2020 Draken Tech, Inc. All rights reserved.</span></div>
                      </div>
                      <button id="btn-backtotop"><img src="./assets/backtotop.png" /></button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
    )}
}
