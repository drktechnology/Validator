import React from 'react'
import BasePage from '@/model/BasePage'
import Meta from '@/module/common/Meta'

export default class extends BasePage {
  ord_renderPage() {
    return (
      <div className="p_emptyPage">
        <Meta />
        {this.ord_renderContent()}
      </div>
    )
  }

  ord_renderContent() {
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
                              <li className="sub-menu-item"><a href="http://staking.draken.tech">Staking (Soon)</a></li>
                              <li className="sub-menu-item"><a href="http://privacy.draken.tech">Privacy (Soon)</a></li>
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
                          <li className="menu-main-item mx-3"><a className="logo" href="http://draken.tech"><img src="../../dist/assets/Logo.png" alt="" /></a></li>
                          <li className="menu-main-item mx-3"><a className="menu-main-item-content menu-icon" href="http://t.me/Drakengroup">ANNOUNCE<img src="../../dist/assets/icon-announce.png" /></a></li>
                          <li className="menu-main-item mx-3"><a className="menu-main-item-content menu-icon" href="http://github.com/drakentech">BUILD<img src="../../dist/assets/icon-github.png" /></a></li>
                        </ul>
                      </div>
                      <div className="menu-mobile"><a href="http://draken.tech">
                          <div className="logo"><img src="../../dist/assets/Logo.png" alt="" /></div></a>
                        <button id="btn-menu-mobile"><i className="fas fa-bars" /></button>
                        <div className="menu-mobile-widget">
                          <div className="d-block text-center"><a href="http://draken.tech">
                              <div className="logo logo-mobile"><img src="../../dist/assets/Logo.png" alt="" /></div>
                              <button id="btn-close-menu-mobile"><i className="fas fa-times" /></button></a></div>
                          <div className="menu-content mt-3">
                            <ul className="menu-list-mobile">
                              <div className="nav-box">
                                <li className="sidebar-item"><a href="#">
                                    DRK CHAIN<i className="fas fa-sort-down px-2" /></a></li>
                                <ul className="sibar-menu-sub-1 px-2">
                                  <div className="nav-box-1">
                                    <li className="sidebar-item"><a href="http://explorer.draken.tech">Explorer</a></li>
                                    <li className="sidebar-item"><a href="http://staking.draken.tech">Staking (Soon)</a></li>
                                    <li className="sidebar-item"><a href="http://privacy.draken.tech">Privacy (Soon)</a></li>
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
                                <li className="sidebar-item"><a href="http://t.me/Drakengroup">ANNOUNCE<img src="../../dist/assets/icon-announce.png" /></a></li>
                              </div>
                              <div className="nav-box">
                                <li className="sidebar-item"><a href="http://github.com/drakentech"> BUILD<img src="../../dist/assets/icon-github.png" /></a></li>
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
                    <h2>DRK Public Network</h2>
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
                          <td> 663631</td>
                        </tr>
                        <tr>
                          <td> Validator Count</td>
                          <td> 0</td>
                        </tr>
                        <tr>
                          <td> Stake Required</td>
                          <td> 242654225658555522222</td>
                        </tr>
                        <tr>
                          <td> Safe Range</td>
                          <td> 5</td>
                        </tr>
                        <tr>
                          <td> Total Stake</td>
                          <td> 30000000</td>
                        </tr>
                        <tr>
                          <td> Coin Supply</td>
                          <td> 255555555555555550000001</td>
                        </tr>
                        <tr>
                          <td>Network Fee</td>
                          <td>0</td>
                        </tr>
                      </tbody>
                    </table>
                    <p className="title-list">Validator List</p>
                    <div className="wrapper-table">
                      <table className="valid-list">
                        <thead>
                          <tr>
                            <th> Address</th>
                            <th> Frozen</th>
                            <th> Stake</th>
                            <th> Claimed</th>
                            <th> Reported</th>
                            <th> Penalized</th>
                            <th> Block</th>
                            <th> Report</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td> 0x0cd..9c2</td>
                            <td> 0.00</td>
                            <td> 10000000.00</td>
                            <td> 0.00</td>
                            <td> 0</td>
                            <td> 0.00</td>
                            <td> 221224</td>
                            <td> 
                              <div className="btn-report">Report<i className="fas fa-bolt" /></div>
                            </td>
                          </tr>
                          <tr>
                            <td> 0x0cd..e67</td>
                            <td> 0.00</td>
                            <td> 10000000.00</td>
                            <td> 0.00</td>
                            <td> 0</td>
                            <td> 0.00</td>
                            <td> 221191</td>
                            <td> 
                              <div className="btn-report">Report<i className="fas fa-bolt" /></div>
                            </td>
                          </tr>
                          <tr>
                            <td> 0x0cd..9c2</td>
                            <td> 0.00</td>
                            <td> 10000000.00</td>
                            <td> 0.00</td>
                            <td> 0</td>
                            <td> 0.00</td>
                            <td> 221224</td>
                            <td> 
                              <div className="btn-report">Report<i className="fas fa-bolt" /></div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="pagination">
                      <div className="btn-pag"> &lt;&lt;</div>
                      <div className="btn-pag btn-pag-index">1</div>
                      <div className="btn-pag">&gt;&gt;</div>
                    </div>
                    <div className="content-bottom">   
                      <h1>Your DRK Validator</h1>
                      <p className="title-detail">Validator Details 
                        <button className="btn btn-validator uppercase">Become a DRK Validator</button>
                      </p>
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
                              <td> 0.0000000</td>
                              <td />
                            </tr>
                            <tr> 
                              <td> Stake Balance</td>
                              <td> 0.00</td>
                              <td className="col-right"> 
                                <div className="btn my-2 btn-stake">STAKE</div>
                                <div className="btn my-2 btn-unstake">UNSTAKE</div>
                                <div className="btn my-2 btn-leave">LEAVE</div>
                              </td>
                            </tr>
                            <tr>
                              <td> Metadata</td>
                              <td> Not set</td>
                              <td className="col-right">
                                <div className="btn btn-stake">UPDATE</div>
                              </td>
                            </tr>
                            <tr>
                              <td> Reward Balance</td>
                              <td> 0.00</td>
                              <td className="col-right">
                                <div className="btn btn-stake">CLAIM</div>
                              </td>
                            </tr>
                            <tr>
                              <td> Frozen Balance</td>
                              <td> 0.00</td>
                              <td className="col-right">
                                <div className="btn btn-stake">CASHOUT</div>
                              </td>
                            </tr>
                            <tr>
                              <td> Coinbase</td>
                              <td> 0x000..000</td>
                              <td />
                            </tr>
                            <tr>
                              <td> Royalty Points</td>
                              <td> 0x000..000</td>
                              <td />
                            </tr>
                            <tr>
                              <td> Claimed Reward</td>
                              <td> 0.00</td>
                              <td />
                            </tr>
                            <tr>
                              <td> Penalized Sum</td>
                              <td> 0.00</td>
                              <td />
                            </tr>
                            <tr>
                              <td> Penalized Times</td>
                              <td> 0</td>
                              <td />
                            </tr>
                            <tr>
                              <td> Unlocked Time</td>
                              <td> 0</td>
                              <td />
                            </tr>
                            <tr>
                              <td> Sealed Blocks</td>
                              <td> 0</td>
                              <td />
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </main>
                <div id="footer">
                  <div className="bg-footer">
                    <div className="container px-0 pos-backtotop">
                      <div className="footer-top bg-white py-3">
                        <div className="icon-contact"><a className="mx-2" href="http://twitter.com/DrakenGroup"><img src="../../dist/assets/icon-1.png" /></a><a className="mx-2" href="http://t.me/Drakengroup"><img src="../../dist/assets/icon-2.png" /></a><a className="mx-2" href="http://github.com/drakentech"><img src="../../dist/assets/icon-3.png" /></a></div>
                        <div className="content-contact">
                          <div className="txt-contact">
                            <div className="tilte"><strong>Email:</strong></div>
                            <div className="main-txt pl-1">
                              <p className="m-0">contact@draken.tech</p>
                            </div>
                          </div>
                          <div className="txt-contact">
                            <div className="tilte"><strong>Address:</strong></div>
                            <div className="main-txt pl-1">
                              <p className="m-0">Fritz-Heeb-Weg 1, 8050 Zürich, Switzerland</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="footer-bottom bg-white py-3">
                        <div className="footer-bottom_content w-100 text-center"><span>© 2020 Draken Tech, Inc. All rights reserved.</span></div>
                      </div>
                      <button id="btn-backtotop"><img src="../../dist/assets/backtotop.png" /></button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
    )}
}
