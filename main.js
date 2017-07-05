import Expo, { Constants } from 'expo';
import React from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import { NavigationProvider, StackNavigation } from '@expo/ex-navigation';
import { FontAwesome } from '@expo/vector-icons';
import { Provider } from 'react-redux';
import Layout from './constants/Layout';
import createStore from './store/createStore'
import Router from './navigation/Router';
import cacheAssetsAsync from './utilities/cacheAssetsAsync';
import { loadAsync } from './dataStorage/storage';
import { Models } from './dataStorage/models';
import LoginUI from './components/LoginUI';
import { getCurrentUser } from './store/user';

let store;

class AppContainer extends React.Component {
  state = {
    appIsReady: false,
    userIsLoggedOn: false,
  };

  componentWillMount() {
    this.loadApp();
  }

  async loadApp() {
    try {
      // initialize existing user
      await getCurrentUser().loadExistingUser();
      // TODO: [Wei] Workaround for now
      if (!getCurrentUser().isLoggedOn()) {
        await getCurrentUser().login("4250000000", "chs");
      }
      getCurrentUser().logUserInfo();

      // add all the neccessary load in Promise.all
      let bootValues = await Promise.all([
        loadAsync(Models.Book, '', true),
        loadAsync(Models.Answer, null, false),
        cacheAssetsAsync({
          images: [
            require('./assets/images/expo-wordmark.png'),
            require('./assets/icons/app-icon.png')
          ],
          fonts: [
            FontAwesome.font,
            { 'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf') },
          ],
        }),
      ]);
      // create the store with the boot data
      const initialstate = {
        books: bootValues[0],
        answers: bootValues[1] ? bootValues[1] : { answers: {} },
      }
      console.log("Load answers: " + JSON.stringify(initialstate.answers));
      store = createStore(initialstate);

      // prefetch data here:

      // set the app status to ready
      // TODO: [Wei] Workaround for now
      this.setState({ appIsReady: true, userIsLoggedOn: /*getCurrentUser().isLoggedOn() */ true });
    } catch (err) {
      console.error("failed to boot due to: " + err);
    }
  }

  onUserLogon(data) {
    console.log(JSON.stringify(data));
    if (data.logon) {
      this.setState({ userIsLoggedOn: true });
    }
  }

  render() {
    if (this.state.appIsReady) {
      if (this.state.userIsLoggedOn) {
        return (
          <Provider store={store}>
            <View style={styles.container}>
              <NavigationProvider router={Router}>
                <StackNavigation
                  id="root"
                  initialRoute={Router.getRoute('rootNavigation')}
                />
              </NavigationProvider>

              {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
              {Platform.OS === 'android' && <View style={styles.statusBarUnderlay} />}
            </View>
          </Provider>
        );
      } else {
        return (
          <Provider store={store}>
            <View style={styles.loginView}>
              <LoginUI onUserLogon={this.onUserLogon.bind(this)} />
            </View>
          </Provider>
        );
      }
    } else {
      return <Expo.AppLoading />;
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  statusBarUnderlay: {
    height: 24,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  loginView: {
    width: Layout.window.width,
    height: Layout.window.height,
    marginTop: 50
  }
});

Expo.registerRootComponent(AppContainer);
