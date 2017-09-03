
import React, { Component } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { follow, unfollow } from '../../actions/follow'

class PeopleItem extends Component {

  constructor (props) {
    super(props)
    this.toPeople = this.toPeople.bind(this)
    this.handleFollow = this.handleFollow.bind(this)
  }

  toPeople(people){
    const { navigate } = this.props.navigation
    navigate('PeopleDetail', { title: people.nickname, id: people._id })
  }

  handleFollow(people) {
    const { follow, unfollow } = this.props
    people.follow ?
      unfollow({ data: { people_id: people._id } }) :
      follow({ data: { people_id: people._id } })
  }

  render() {

    const { people } = this.props
    
    if (!people) return (<View></View>)

    return (<View>
        <TouchableOpacity onPress={()=>{this.toPeople(people)}} style={styles.item}>
          <View style={styles.itemLeft}><Image source={{uri:'https:'+people.avatar_url}} style={styles.avatar}  /></View>
          <View style={styles.itemCenter}>
            <View><Text>{people.nickname}</Text></View>
            <View style={styles.other}>
              {people.posts_count ? <Text>帖子{people.posts_count}</Text> : null}
              {people.fans_count ? <Text>粉丝{people.fans_count}</Text> : null}
              {people.comment_count ? <Text>评论{people.comment_count}</Text> : null}
            </View>
          </View>
          <TouchableOpacity style={styles.itemRight} onPress={()=>this.handleFollow(people)}>
            <Text>{people.follow ? '已关注' : '关注'}</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </View>)
  }

}

const styles = StyleSheet.create({
  item: {
    padding:10,
    backgroundColor:'#fff',
    borderBottomWidth: 1,
    borderColor: '#efefef',
    flexDirection: 'row'
  },
  avatar: {
    width:40,
    height:40,
    borderRadius: 20,
    marginRight:10
  },
  loading: {
    height: 60
  },
  other: {
    flexDirection: 'row'
  },
  itemCenter:{
    flex: 1
  }
})


export default connect((state, props) => ({
  }),
  (dispatch) => ({
    follow: bindActionCreators(follow, dispatch),
    unfollow: bindActionCreators(unfollow, dispatch)
  })
)(PeopleItem)
