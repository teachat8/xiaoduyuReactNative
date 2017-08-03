import React, { Component } from 'react'
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Button,
  Alert,
  Image,
  TouchableOpacity,
  AsyncStorage
} from 'react-native'

import { NavigationActions } from 'react-navigation'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { getUserInfo } from '../../reducers/user'
import { signout } from '../../actions/sign'
import { ListItem } from '../../components/ui'

class Settings extends React.Component {

  static navigationOptions = {
    title: '设置'
  }

  constructor (props) {
    super(props)

    this.signOut = this.signOut.bind(this)
  }

  signOut() {

    const self = this
    const { navigation, signout } = this.props

    Alert.alert('', '您确认退出吗？', [
      {text:'取消',onPress:()=>{}},
      {text:'确定',onPress:()=>{
        signout()

        AsyncStorage.removeItem('token', function(res){

          global.cleanRedux()

          // setTimeout(()=>{

            global.signIn = false

            const resetAction = NavigationActions.reset({
              index: 0,
              actions: [
                NavigationActions.navigate({ routeName: 'SignIn'})
              ]
            })

            self.props.navigation.dispatch(resetAction)

          // }, 2000)

          // navigation.goBack()
        })

      }}
    ])

  }

  render() {

    const { me } = this.props

    return (<ScrollView>
          <View>

            <ListItem name={"头像"} />
            <ListItem name={"修改名字"} rightText={me.nickname} />
            <ListItem name={"性别"} rightText={me.gender == 1 ? '男' : '女'} />
            <ListItem name={"个性签名"} rightText={me.brief} />

            <View style={styles.gap}></View>

            {me.email ?
              <ListItem name={"修改邮箱"} rightText={me.email} />
              : <ListItem name={"邮箱"} rightText={'未绑定'} />}

            {me.email ?
              <ListItem name={"修改密码"} />
              :null}

            <View style={styles.gap}></View>

            <ListItem name={"QQ"} rightText={me.qq ? '已绑定' : '未绑定'} />
            <ListItem name={"weibo"} rightText={me.weibo ? '已绑定' : '未绑定'} />
            <ListItem name={"GitHub"} rightText={me.github ? '已绑定' : '未绑定'} />

            <View style={styles.gap}></View>

            <TouchableOpacity onPress={()=>{this.signOut()}}>
              <ListItem type="center" name={"退出"} />
              {/*<View style={styles.itme}><Text>退出</Text></View>*/}
            </TouchableOpacity>

          </View>
      </ScrollView>)
  }
}

const styles = StyleSheet.create({
  avatarItem: {
    alignItems:'center',
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    marginBottom: 10
  },
  avatar: {
    width:20,
    height:20,
    backgroundColor: '#efefef'
  },
  icon: {
    width: 24,
    height: 24,
  },
  itme: {
    flexDirection: 'row',
    minHeight: 45,
    alignItems:'center',
    justifyContent: 'space-between',
    // justifyContent:'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#efefef',
    paddingLeft:20,
    paddingRight: 20
  },
  itemIcon: {
    width:20
  },
  arrowRight: {
    width:20,
    height:20,
  },
  gap: {
    height: 10
  },
  itmeCenter: {
    flexDirection: 'row',
    minHeight: 45,
    alignItems:'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#efefef',
    paddingLeft:20,
    paddingRight: 20
  }
});

export default connect(state => ({
    me: getUserInfo(state)
  }),
  (dispatch) => ({
    signout: bindActionCreators(signout, dispatch)
  })
)(Settings);
