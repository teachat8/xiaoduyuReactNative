

import React, { Component } from 'react'
import { AppRegistry, StyleSheet, Text, View, Image, Button, ScrollView, WebView, TouchableOpacity, AsyncStorage } from 'react-native'

import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { loadPostsById, addViewById } from '../../actions/posts'
import { getPostsById } from '../../reducers/posts'
import { getUserInfo } from '../../reducers/user'

import HTMLView from '../../components/html-view'
import Img from '../../components/image'
import CommentList from '../../components/comment-list'
import BottomBar from '../../components/bottom-bar'
import MenuIcon from '../../components/ui/icon/menu'

import Loading from '../../components/ui/loading'
import Nothing from '../../components/nothing'

import { ActionSheetCustom as ActionSheet } from 'react-native-actionsheet'
const CANCEL_INDEX = 0
const DESTRUCTIVE_INDEX = 0
const options = [ '取消', '编辑']

class PostsDetail extends Component {

  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state
    // <Button onPress={()=>params.menu()} title={"菜单"} />
    let option = {
      headerTitle: params.title
    }

    if (params.menu) {
      option.headerRight = (<TouchableOpacity onPress={()=>params.menu()}><MenuIcon /></TouchableOpacity>)
    }

    return option
  }

  constructor (props) {
    super(props)
    this.state = {
      nothing: false
    }
    this.goWriteComment = this.goWriteComment.bind(this)
    this.toPeople = this.toPeople.bind(this)
    this.menu = this.menu.bind(this)
    this.showSheet = this.showSheet.bind(this)
  }

  componentWillMount() {

    const self = this
    const id = this.props.navigation.state.params.id
    const { loadPostsById, me } = this.props
    const [ posts ] = this.props.posts

    if (!posts || !posts.content) {
      loadPostsById({ id, callback: (res)=>{

        if (!res) {
          self.setState({ nothing: true })
          return
        }

        if (me._id == posts.user_id._id) {
          this.props.navigation.setParams({
            menu: this.menu
          })
        }

      }})
      return
    }

    if (me._id == posts.user_id._id) {
      this.props.navigation.setParams({
        menu: this.menu
      })
    }

  }

  componentDidMount() {

    const self = this
    const id = this.props.navigation.state.params.id
    const { addViewById } = this.props

    AsyncStorage.getItem('view-posts', (errs, viewPosts)=>{

        if (!viewPosts) viewPosts = ''

      AsyncStorage.getItem('last-viewed-posts-at', (errs, lastViewPostsAt)=>{
        if (!lastViewPostsAt) {
          lastViewPostsAt =  new Date().getTime()
        } else {
          lastViewPostsAt = parseInt(lastViewPostsAt)
        }

        // 如果超过1小时，那么浏览数据清零
        if (new Date().getTime() - lastViewPostsAt > 3600000) viewPosts = ''

        viewPosts = viewPosts.split(',')

        if (!viewPosts[0]) viewPosts = []

        if (viewPosts.indexOf(id) == -1) {

          viewPosts.push(id)

          AsyncStorage.setItem('view-posts', viewPosts.join(','), function(errs, result){})
          AsyncStorage.setItem('last-viewed-posts-at', new Date().getTime()+'', function(errs, result){})
          addViewById({ id: id })
        }

      })
    })

  }

  menu(key) {
    this.ActionSheet.show()
  }

  showSheet(key) {

    if (!key) return

    const [ posts ] = this.props.posts

    const { navigate } = this.props.navigation;
    navigate('WritePosts', { topic: posts.topic_id, posts })

  }

  toPeople(user) {
    const { navigate } = this.props.navigation;
    navigate('PeopleDetail', { title: user.nickname, id: user._id })
  }

  goWriteComment() {

    const { navigate } = this.props.navigation
    const [ posts ] = this.props.posts
    const { me } = this.props

    if (me) {
      navigate('WriteComment', { postsId: posts._id })
    } else {
      navigate('SignIn')
    }

  }

  render() {

    const [ posts ] = this.props.posts
    const { nothing } = this.state

    if (nothing) return (<Nothing content="帖子不存在或已删除" />)
    if (!posts) return <Loading />

    return (<View style={styles.container}>
        <ScrollView style={styles.main}>
          <View>
            <View style={styles.posts}>
              <View style={styles.itemHead}>
                <View>
                  <TouchableOpacity onPress={()=>{this.toPeople(posts.user_id)}}>
                    <Image source={{uri:'https:'+posts.user_id.avatar_url}} style={styles.avatar}  />
                  </TouchableOpacity>
                </View>
                <View>
                  <TouchableOpacity onPress={()=>{this.toPeople(posts.user_id)}}>
                    <Text>{posts.user_id.nickname}</Text>
                  </TouchableOpacity>
                  <Text>
                    {posts.topic_id.name} {posts.view_count ? posts.view_count+'次浏览' : null} {posts.like_count ? posts.like_count+'个赞' : null} {posts.follow_count ? posts.follow_count+'人关注' : null} {posts._create_at}
                  </Text>
                </View>
              </View>
              <View style={styles.itemMain}>
                <Text>{posts.title}</Text>
                <HTMLView html={posts.content_html} imgOffset={30} />
              </View>
            </View>
            <View>
              <CommentList
                {...this.props}
                name={posts._id}
                filters={{ posts_id: posts._id, parent_exists: 0, per_page: 100 }}
                displayLike={true}
                displayReply={true}
                displayCreateAt={true}
                />
            </View>
          </View>
        </ScrollView>
        <BottomBar {...this.props} posts={posts} />
        <ActionSheet
          ref={o => this.ActionSheet = o}
          options={options}
          cancelButtonIndex={CANCEL_INDEX}
          destructiveButtonIndex={DESTRUCTIVE_INDEX}
          onPress={this.showSheet}
        />
      </View>)
  }
}


const styles = StyleSheet.create({
  centerContainer: {
    flex:1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  posts: {
    padding:15,
    borderBottomWidth: 1,
    borderColor: '#efefef'
  },
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  main: {
    flex: 2
  },
  topicItem: {
    backgroundColor: '#fff',
    padding:20,
    borderBottomWidth: 1,
    borderColor: '#efefef'
  },
  itemHead: {
    flexDirection: 'row'
  },
  avatar: {
    width:40,
    height:40,
    borderRadius: 20,
    marginRight:10
  },
  itemMain: {
    marginTop:10
  },
  bottomBar: {
    height: 50,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#efefef',
    flexDirection: 'row'
  },
  comment: {
    width: 50,
    height: 50,
    lineHeight: 50,
    textAlign: 'center'
  },
  like: {
    width: 50,
    height: 50,
    lineHeight: 50,
    textAlign: 'center'
  },
  follow: {
    flex: 1,
    height: 50,
    lineHeight: 50,
    textAlign: 'center'
  }
});

export default connect((state, props) => {
    const id = props.navigation.state.params.id
    return {
      posts: getPostsById(state, id),
      me: getUserInfo(state)
    }
  },
  (dispatch) => ({
    loadPostsById: bindActionCreators(loadPostsById, dispatch),
    addViewById: bindActionCreators(addViewById, dispatch)
  })
)(PostsDetail);
