/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  ListView,
  Image,
  NavigatorIOS,
  ScrollView,
  refreshControl,
  RefreshControl,
  Navigator,
  TouchableWithoutFeedback
} from 'react-native'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import { loadCommentList } from '../../actions/comment'
import { getCommentListByName } from '../../reducers/comment'

import CommentItem from '../../components/comment-item'

class CommentList extends Component {

  constructor (props) {
    super(props)

    var ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

    this.state = {
      topics: ds.cloneWithRows([]),
      sourcePostsList: [],
      loadMore: false,
      more: true,
      isRefreshing: false,
      filters: {
        lt_date: new Date().getTime(),
        per_page: 20
      },
      list: {
        loading: false,
        more: true
      }
    }
    this.goTo = this.goTo.bind(this)
    this.load = this.load.bind(this)
    this.renderFooter = this.renderFooter.bind(this)
  }

  componentWillMount() {

    const { list } = this.props

    if (!list.data || !list.data.length) {
      this.load()
    }

  }

  load(callback = ()=>{}, restart = false) {
    const { name, filters } = this.props
    this.props.loadCommentList({ name, filters, callback, restart })
  }

  renderFooter() {
    const { list } = this.props
    return (<View>{list.loading ? <Text>加载中</Text> : null}</View>)
  }

  render() {

    const { list } = this.props

    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    let array = ds.cloneWithRows(list.data || [])

    return (
      <View>
        <ListView
          enableEmptySections={true}
          dataSource={array}
          renderRow={(item) => (<View>
              <CommentItem comment={item} />
              {item.reply && item.reply.map(item=>{
                return(<View key={item._id} style={styles.reply}><CommentItem comment={item} /></View>)
              })}
          </View>)}
          renderFooter={this.renderFooter}
          removeClippedSubviews={false}
          refreshControl={
            <RefreshControl
              refreshing={this.state.isRefreshing}
              onRefresh={this._onRefresh.bind(this)}
              tintColor="#ff0000"
              title="加载中..."
              titleColor="#00ff00"
              colors={['#ff0000', '#00ff00', '#0000ff']}
              progressBackgroundColor="#ffffff"
            />
          }
          onScroll={this._onScroll.bind(this)}
          scrollEventThrottle={50}
        />
      </View>
    )
  }

  goTo(posts){

    const { navigate } = this.props.navigation;

    navigate('PostsDetail', { title: posts.title, id: posts._id })

    /*
    this.props.navigator.push({
      component: PostsDetail,
      title: '详情',
      id: id
      // rightButtonTitle: '收藏',
      // onRightButtonPress: function(){
      //   alert('点击了收藏按钮。');
      // }
    });
    */
  }

  _onScroll(event) {
    const self = this
    if (this.state.loadMore) return
    let y = event.nativeEvent.contentOffset.y;
    let height = event.nativeEvent.layoutMeasurement.height;
    let contentHeight = event.nativeEvent.contentSize.height;
    // console.log('offsetY-->' + y);
    // console.log('height-->' + height);
    // console.log('contentHeight-->' + contentHeight);
    if (y+height>=contentHeight-20) {
      self.load()
    }
  }

  _onRefresh() {
    const self = this
    this.setState({ isRefreshing: true })
    self.load(()=>{
      self.setState({ isRefreshing: false })
    }, true)
  }

}


const styles = StyleSheet.create({
  reply: {
    paddingLeft: 60
  }
})

export default connect((state, props) => {
    return {
      list: getCommentListByName(state, props.name)
    }
  },
  (dispatch, props) => ({
    loadCommentList: bindActionCreators(loadCommentList, dispatch)
  })
)(CommentList);

// export default PostsList