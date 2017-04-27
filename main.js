import Expo from 'expo';
import React from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import { NavigationProvider, StackNavigation } from '@expo/ex-navigation';
import { FontAwesome } from '@expo/vector-icons';
import { Provider } from 'react-redux';

import createStore from './store/createStore'
import Router from './navigation/Router';
import cacheAssetsAsync from './utilities/cacheAssetsAsync';
import { loadAsync } from './dataStorage/storage';
import { Models } from './dataStorage/models';

let store;

class AppContainer extends React.Component {
  state = {
    appIsReady: false,
  };

  componentWillMount() {
    this.loadApp();
  }

  async loadApp() {
    try {
      // add all the neccessary load in Promise.all
      let bootValues = await Promise.all([
        loadAsync(Models.Book, "home.json"),
        loadAsync(Models.Answer, null),
        cacheAssetsAsync({
          images: [require('./assets/images/expo-wordmark.png')],
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
      store = createStore(initialstate);

      // prefetch data here:

      // set the app status to ready
      this.setState({ appIsReady: true });
    } catch (err) {
      console.error("failed to boot due to: " + err);
    }
  }

  render() {
    if (this.state.appIsReady) {
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
});

Expo.registerRootComponent(AppContainer);
