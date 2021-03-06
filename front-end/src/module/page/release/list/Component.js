import React from 'react'
import _ from 'lodash'
import StandardPage from '../../StandardPage'
import {
  Row, Col,
} from 'antd'
import I18N from '@/I18N'
import sanitizeHtml from 'sanitize-html'
import Footer from '@/module/layout/Footer/Container'
import CreateForm from '../create/Container'
import EditForm from '../edit/Container'

import styled from 'styled-components'
import { breakPoint } from '@/constants/breakPoint'

export default class extends StandardPage {
  constructor(p) {
    super(p)

    this.state = {
      list: null,
      loading: true,
    }
  }

  async componentDidMount() {
    this.refetch()
  }

  ord_renderContent() {
    return (
      <div>
        <Container>
          {this.renderHeader()}
          {this.renderList()}
        </Container>
        <Footer />
      </div>
    )
  }

  renderHeader() {
    const { isAdmin } = this.props
    const createFormNode = isAdmin && (
      <BtnContainer sm={8} xs={24}>
        <CreateForm />
      </BtnContainer>
    )

    return (
      <Header>
        <Row type="flex" align="middle" justify="space-between">
          <Col sm={16} xs={24}>
            <Title className="komu-a">
              {I18N.get('release.whatsNew')}
            </Title>
          </Col>
          {createFormNode}
        </Row>
        <Subtitle>{I18N.get('release.subtitle')}</Subtitle>
      </Header>
    )
  }

  renderList () {
    const { dataList } = this.props
    const node = _.map(dataList, detail => this.renderItem(detail))
    return (
      <List>
        {node}
      </List>
    )
  }

  renderItem (detail) {
    const { isAdmin } = this.props
    const { title, desc, _id: id } = detail
    const formNode = isAdmin && (
      <BtnContainer sm={8} xs={24}>
        <EditForm detail={detail} />
      </BtnContainer>
    )

    return (
      <ListItem key={id}>
        <Row type="flex" align="middle" justify="space-between">
          <Col sm={16} xs={24}>
            <ItemTitle className="cr-title-with-icon">{title}</ItemTitle>
          </Col>
          {formNode}
        </Row>

        <ItemDesc className="ql-editor" dangerouslySetInnerHTML={{ __html: sanitizeHtml(desc) }} />
      </ListItem>
    )
  }

  refetch = async () => {
    this.ord_loading(true)
    const { getList } = this.props
    try {
      const list = await getList()
      this.setState({ list })
    } catch (error) {
      // do sth
    }

    this.ord_loading(false)
  }
}

export const Container = styled.div`
  max-width: 992px;
  margin: 30px auto;
  @media only screen and (max-width: ${breakPoint.mobile}) {
    margin: 15px;
  }
`

const Header = styled(Row)`
  border-bottom: 1px solid #E5E5E5;
`
const Title = styled.h3`
  font-size: 96px;
  @media only screen and (max-width: ${breakPoint.mobile}) {
    margin: 15px;
    font-size: 52px;
  }
`
const BtnContainer = styled(Col)`
  text-align: right;
`
const Subtitle = styled.h4`
  font-size: 20px;
`
const List = styled.div`
  margin: 30px auto;
`
const ListItem = styled.div`

`
const ItemTitle = styled.div`
  font-size: 17px;
  font-weight: 400;
  padding-left: 25px!important;
  background-position-y: 8px!important;
`
const ItemDesc = styled.div`

`
