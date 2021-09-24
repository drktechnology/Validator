import React from 'react'
import BaseComponent from '@/model/BaseComponent'
import { Layout, Menu, Icon,  Modal, Dropdown } from 'antd'
import _ from 'lodash'
import I18N from '@/I18N'
import MediaQuery from 'react-responsive'
import { MAX_WIDTH_MOBILE, MIN_WIDTH_PC } from '@/config/constant'
import { USER_ROLE, USER_LANGUAGE } from '@/constant'
import Flag from 'react-flags'
import Data from '@/config/data'
import UserEditForm from '@/module/form/UserEditForm/Container'
import Headroom from 'react-headroom'
import Flyout from './Flyout'

const { Header } = Layout

const { analytics, location } = window

const Hamburger = () => (
  <svg width="14" height="11" viewBox="0 0 14 11" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M0 0H14V1H0V0ZM0 5H14V6H0V5ZM14 10H0V11H14V10Z" fill="black" />
  </svg>
)

export default class extends BaseComponent {
  constructor() {
    super()

    this.state = {
      affixed: false,
      popover: false,
      completing: false,
    }
  }

  renderCompleteProfileModal() {
    return (
      <Modal
        className="project-detail-nobar"
        visible={this.state.completing}
        onOk={this.onCompleteProfileModalOk.bind(this)}
        onCancel={this.onCompleteProfileModalCancel.bind(this)}
        footer={null}
        width="70%"
      >
        {this.state.completing
      && (
        <UserEditForm
          user={this.props.user}
          switchEditMode={this.onCompleteProfileModalCancel.bind(this)}
          completing={true}
        />
      )
        }
      </Modal>
    )
  }

  onCompleteProfileModalOk() {
    this.setState({
      completing: false,
    })
  }

  onCompleteProfileModalCancel() {
    this.setState({
      completing: false,
    })
  }

  buildAcctDropdown() {
    const isLogin = this.props.isLogin
    const hasAdminAccess = [USER_ROLE.ADMIN, USER_ROLE.COUNCIL].includes(this.props.role)

    return (
      <Menu onClick={this.clickItem.bind(this)}>
        {isLogin
          ? (
            <Menu.Item key="profile/info">
              {I18N.get('0200')}
            </Menu.Item>
          )
          : (
            <Menu.Item key="login">
              {I18N.get('0201')}
            </Menu.Item>
          )
        }
        {!isLogin
          && (
            <Menu.Item key="register">
              {I18N.get('0202')}
            </Menu.Item>
          )
        }
        {isLogin
          && (
            <Menu.Item key="logout">
              {I18N.get('0204')}
            </Menu.Item>
          )
        }
      </Menu>
    )
  }

  buildLanguageDropdown() {
    const menu = (
      <Menu onClick={this.clickItem.bind(this)} className="language-menu">
        <Menu.Item key="en">
          <div>
            <Flag
              name="US"
              format="png"
              basePath="/assets/images/flags"
              pngSize={24}
              shiny={true}
              alt="English"
            />
            <span className="language-us">English</span>
          </div>
        </Menu.Item>
        {/* <Menu.Item key="zh">
          <div>
            <Flag
              name="CN"
              format="png"
              basePath="/assets/images/flags"
              pngSize={24}
              shiny={true}
              alt="English"
            />
            <span className="language-cn">简体中文</span>
          </div>
        </Menu.Item> */}
      </Menu>
    )

    return (
      <Dropdown overlay={menu} placement="bottomCenter">
        <a className="ant-dropdown-link">
          <Flag
            name={Data.mappingLanguageKeyToName[this.props.lang]}
            format="png"
            basePath="/assets/images/flags"
            pngSize={24}
            shiny={true}
            alt="English"
          />
        </a>
      </Dropdown>
    )
  }

  buildHelpDropdown() {
    const hasAdminAccess = [USER_ROLE.ADMIN, USER_ROLE.COUNCIL].includes(this.props.role)

    return (
      <Menu onClick={this.clickItem.bind(this)} className="help-menu">
        {/*
      <Menu.Item key="about">
          {I18N.get('0008')}
      </Menu.Item>
      <Menu.Item key="faq">
          {I18N.get('0009')}
      </Menu.Item>
      */}

        <Menu.Item key="teams">
          {I18N.get('0005')}
        </Menu.Item>

        <Menu.Item key="developer">
          {I18N.get('0102')}
        </Menu.Item>

        <Menu.Item key="developer/learn">
          {I18N.get('developer.learn')}
        </Menu.Item>

        {/*
      <Menu.Item key="forum">
        {I18N.get('0011')}
      </Menu.Item>
      */}

        {this.props.isLogin
      && (
        <Menu.Item key="logout">
          {I18N.get('0204')}
        </Menu.Item>
      )
        }
      </Menu>
    )
  }

  buildResourcesDropdown() {
    return (
      <Menu onClick={this.clickItem.bind(this)} className="help-menu">
        <Menu.Item key="forum">
          {I18N.get('navigation.resources.submenu.forum')}
        </Menu.Item>

        <Menu.Item key="blog">
          {I18N.get('navigation.resources.submenu.blog')}
        </Menu.Item>

        <Menu.Item key="docs">
          {I18N.get('navigation.resources.submenu.docs')}
        </Menu.Item>

      </Menu>
    )
  }

  getSelectedKeys() {
    let keys = _.map(['cr100', 'crcles', 'ambassadors', 'profile', 'admin',
      'developer', 'social', 'community'], key => (((this.props.pathname || '').indexOf(`/${key}`) === 0) ? key : ''))

    if (_.includes(keys, 'admin')) {
      keys = _.union(_.without(keys, ['admin']), ['profile'])
    }

    return keys
  }

  ord_render() {
    const helpDropdown = this.buildHelpDropdown()

    return (
      <Headroom>
        <Header className="c_Header">
          <Menu
          onClick={this.clickItem.bind(this)}
          className="c_Header_Menu pull-left"
          selectedKeys={this.getSelectedKeys()}
          mode="horizontal"
        >
            <Menu.Item className="c_MenuItem logo" key="landing">
              <MediaQuery minWidth={MIN_WIDTH_PC}>
                <img src="/assets/images/ret/logoret-live.png" alt="Realtract Network" />
              </MediaQuery>
              <MediaQuery maxWidth={MAX_WIDTH_MOBILE}>
                <img src="/assets/images/ret/logoret-live.png" alt="Realtract Network"/>
              </MediaQuery>
              {/* <div className="alpha-tag dsk">ALPHA</div> */}
            </Menu.Item>
          </Menu>

          <Menu className="c_Header_Menu c_Side_Menu pull-right">
            <Menu.Item className="c_MenuItem help no-margin" key="help">
              {/* <MediaQuery minWidth={MIN_WIDTH_PC}>
                <Dropdown overlay={helpDropdown} style={{marginTop: '24px'}}>
                  <a className="ant-dropdown-link">
                    <Hamburger />
                  </a>
                </Dropdown>
              </MediaQuery> */}
            </Menu.Item>
            <Menu.Item className="c_MenuItem mobile" key="mobileMenu" onClick={this.props.toggleMobileMenu}>
              <Icon type="menu-fold" style={{fontSize: '24px'}}/>
            </Menu.Item>
            <Menu.Item className="mobile-language-dropdown" style={{ marginTop: 13 }}>
              <MediaQuery maxWidth={MAX_WIDTH_MOBILE}>
                <div className="pull-right language-dropdown mobile">
                  {this.buildLanguageDropdown()}
                </div>
              </MediaQuery>
            </Menu.Item>
          </Menu>

          <MediaQuery minWidth={MIN_WIDTH_PC}>
            <div className="pull-right language-dropdown">
              {this.buildLanguageDropdown()}
            </div>
          </MediaQuery>

          <Menu
          onClick={this.clickItem.bind(this)}
          className="c_Header_Menu pull-right"
          selectedKeys={this.getSelectedKeys()}
          mode="horizontal"
        >
            <Menu.Item className="c_MenuItem link" key="home">
              Validators
            </Menu.Item>
            {/* <Menu.Item className="c_MenuItem link" key="faucet">
              Faucet
            </Menu.Item> */}
            <Menu.Item className="c_MenuItem link" key="gas">
              Gas Station
            </Menu.Item>
             {/* <Menu.Item className="c_MenuItem link" key="pool">
               Pools (Coming soon)
             </Menu.Item> */}
         {/*    <Menu.Item className="c_MenuItem link" key="council">
              {I18N.get('navigation.council')}
            </Menu.Item>

            <Menu.Item className="c_MenuItem link" key="whitepaper">
              {I18N.get('navigation.whitepaper')}
            </Menu.Item>

            <Menu.Item className="c_MenuItem link" key="suggestion">
              {I18N.get('navigation.suggestion')}
            </Menu.Item>

            <Menu.Item className="c_MenuItem link" key="elips">
              {I18N.get('navigation.elips')}
            </Menu.Item>

            <Menu.Item className="c_MenuItem link" key="proposals">
              {I18N.get('navigation.proposal')}
            </Menu.Item>

            <Menu.Item className="c_MenuItem link" key="what-is-new">
              {I18N.get('navigation.whatsNew')}
            </Menu.Item>

            <Menu.Item className="c_MenuItem link" key="resources">
              <Dropdown overlay={this.buildResourcesDropdown()} placement="bottomCenter">
                <a className="ant-dropdown-link">
                  {I18N.get('navigation.resources.title')}
                </a>
              </Dropdown>
            </Menu.Item> */}

           {/*  {this.props.isLogin
              ? (
                <Menu.Item className="c_MenuItem link" key="profile">
                  {I18N.get('navigation.profile')}
                </Menu.Item>
              ) : (
                <Menu.Item className="c_MenuItem link" key="login">
                  {I18N.get('0201')}
                </Menu.Item>
              )
          } */}
          </Menu>
          <div className="clearfix" />
          {this.renderProfileToast()}
          {this.renderCompleteProfileModal()}
        </Header>
      </Headroom>
    )
  }

  completeProfile = () => {
    this.setState({
      completing: true,
    })
  }

  dismissToast = () => {
    this.setState({
      dismissed: true,
    })

    localStorage.setItem('complete-profile-dismissed', true)
  }

  isPermanentlyDismissed() {
    return localStorage.getItem('complete-profile-dismissed')
  }

  renderProfileToast() {
    const isShow = !this.state.dismissed
      && !this.isPermanentlyDismissed()
      && this.props.isLogin
      && this.hasIncompleteProfile()

    return isShow && (
      <div className="top-toast">
        <a onClick={this.completeProfile}>
          {I18N.get('profile.complete')}
          <Icon type="right" style={{ marginLeft: 8 }} />
        </a>
        <a className="pull-right toast-close-container" onClick={this.dismissToast}>
          <Icon type="close" />
        </a>
      </div>
    )
  }

  hasIncompleteProfile() {
    const requiredProps = [
      'profile.firstName',
      'profile.lastName',
      'profile.timezone',
      'profile.country',
      'profile.bio',
      'profile.skillset',
      'profile.profession',
    ]

    return !_.every(requiredProps, prop => _.has(this.props.user, prop)
      && !_.isEmpty(_.get(this.props.user, prop)))
  }

  clickItem = (e) => {
    const { key } = e
    const { isLogin } = this.props

    if (_.includes([
      'landing',
      'home',
      'gas',
      // 'faucet',
      // 'developer',
      // 'developer/learn',
      // 'cr100',
      // 'crcles',
      // 'ambassadors',
      // 'social',
      // 'leader',
      // 'community',
      // 'proposals',
      // 'directory',
      // 'account',
      // 'tasks',
      // 'login',
      // 'register',
      // 'signup',
      // 'profile/info',
      // 'how-to-earn',
      // 'help',
      // 'about',
      // 'faq',
      // 'contact',
      // 'slack',
      // 'suggestion',
      // 'council',
      // 'constitution/1',
      // 'whitepaper',
      // 'what-is-new',
      // 'elips'
    ], key)) {
      if (key === 'landing') {
        this.props.history.push('/')
      } else {
        this.props.history.push(`/${e.key}`)
      }

      // below this are exceptions from the list above
    } else if (key === 'notice') {
      // hack for now
      localStorage.setItem('popup-update', 'force')
      window.location.reload()
    } else if (key === 'forum') {
      analytics.track('FORUM_CLICKED', {
        url: location.href,
      })
      if (!isLogin) {
        this.props.history.push('/login?MSG_CODE=1')
      } else {
        const forumLink = `${process.env.FORUM_URL}/login`
        window.open(forumLink, '_blank')
      }
    } else if (key === 'logout') {
      analytics.track('HEADER_CLICKED', {
        action: 'logout',
        url: location.href,
      })

      Modal.confirm({
        title: I18N.get('logout.title'),
        content: '',
        okText: I18N.get('.yes'),
        okType: 'danger',
        cancelText: I18N.get('.no'),
        onOk: () => {
          analytics.track('LOGOUT', {
            url: location.href,
          })
          this.props.logout()
        },
        onCancel() {
        },
      })
    } else if (key === 'profile') {
      this.props.history.push('/profile/info')
    } else if (key === 'teams') {
      this.props.history.push('/developer/search?lookingFor=TEAM&sortBy=createdAt&sortOrder=DESC')
    } else if (key === 'blog') {
      analytics.track('BLOG_CLICKED', {
        url: location.href,
      })

      let linkToBlog = 'https://blog.cyberrepublic.org'

      if (I18N.getLang() === USER_LANGUAGE.zh) {
        linkToBlog += `/${USER_LANGUAGE.zh}`
      }

      window.location.href = linkToBlog
    } else if (key === 'docs') {
      analytics.track('DOCS_CLICKED', {
        url: location.href,
      })

      let linkTo = 'https://cyberrepublic.org/docs/#/'

      if (I18N.getLang() === USER_LANGUAGE.zh) {
        linkTo += `${USER_LANGUAGE.zh}/`
      }

      window.location.href = linkTo
    } else if (_.includes([
      'en',
      'zh',
    ], key)) {
      analytics.track('LANGUAGE_CHANGED', {
        language: e.key,
        url: location.href,
      })

      this.props.changeLanguage(e.key)
    }
  }
}
