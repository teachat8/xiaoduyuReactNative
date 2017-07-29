
import React, { Component } from 'react'
import { Provider } from 'react-redux'
import { Text, View, AsyncStorage, NetInfo, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native'
import SplashScreen from 'react-native-splash-screen'
import reducers, { getInitialState } from './reducers'
import getStore from './store/configure-store.js'
import Navigators from './navigators/index'

import { combineReducers, bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { loadUserInfo, addAccessToken, cleanUserInfo } from './actions/user'
import { cleanAllPosts } from './actions/posts'

const store = getStore()

global.cleanRedux = () => {
  cleanUserInfo()(store.dispatch, store.getState)
  cleanAllPosts()(store.dispatch, store.getState)
}

global.initReduxDate = (callback) => {
  global.cleanRedux()

  AsyncStorage.getItem('token', function(errs, result){

    if (!result) {
      callback(false)
      return
    }

    loadUserInfo({
      accessToken: result,
      callback: (res)=>{
        if (res && res.success) {
          addAccessToken({ accessToken:  result })(store.dispatch, store.getState)
          global.signIn = true
          callback(true)
        } else if (res && !res.success) {
          AsyncStorage.removeItem('token', function(res){
            callback(false)
          })(store.dispatch, store.getState)
        } else {
          callback(false)
        }

      }
    })(store.dispatch, store.getState)

  })

}

class MainApp extends Component {

  constructor (props) {
    super(props)
    this.state = {
      ready: false,
      loading: true,
      network: false
    }

    this.start = this.start.bind(this)
  }

  start() {

    const self = this

    self.setState({ loading: true })

    function handleFirstConnectivityChange(state) {

      if (!state) {
        self.setState({ loading: false })
        SplashScreen.hide()
      } else {
        global.initReduxDate((result)=>{
          self.setState({ loading: false, network: true, ready: true })
          SplashScreen.hide()
        })
      }

      NetInfo.isConnected.removeEventListener(
        'change',
        handleFirstConnectivityChange
      )
    }

    NetInfo.isConnected.addEventListener(
      'change',
      handleFirstConnectivityChange
    )

  }

  componentWillMount() {
    global.signIn = false
    this.start()
  }

  componentWillReceiveProps() {
    console.log('组件发生更新了1111');
    global.signIn = false
    this.start()
  }

  componentDidUpdate() {
    console.log('组件更新完成了');
  }

  render() {

    const { loading, network, ready } = this.state

    if (loading) {
      return (<View style={styles.loading}>
        <ActivityIndicator animating={true} color={'#484848'} size={'small'} />
      </View>)
    }

    if (!loading && !network) {
      return (<View style={styles.loading}>
        <Text>连接网络失败</Text>
        <TouchableOpacity onPress={this.start}>
          <Text>重新连接</Text>
        </TouchableOpacity>
      </View>)
    }

    return (
      <Provider store={store}>
        <Navigators />
      </Provider>
    );
  }
}

var styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
})

export default MainApp
