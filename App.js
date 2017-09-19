import React from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import { AppLoading, Asset, Font } from 'expo';
import { Ionicons } from '@expo/vector-icons';
import RootNavigation from './navigation/RootNavigation';
import { FontAwesome } from '@expo/vector-icons';
import { Provider } from 'react-redux';
import Layout from './constants/Layout';
import createStore from './store/createStore'
import { loadAsync } from './dataStorage/storage';
import { Models } from './dataStorage/models';
import LoginUI from './components/LoginUI';
import { getCurrentUser } from './store/user';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';

export default class App extends React.Component {
  state = {
    assetsAreLoaded: false,
  };

  componentWillMount() {
    this._loadAssetsAsync();
  }

  render() {
    if (!this.state.assetsAreLoaded && !this.props.skipLoadingScreen) {
      return <AppLoading />;
    } else {
      return (
        <ActionSheetProvider>
          <Provider store={store}>
            <View style={styles.container}>
              {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
              {Platform.OS === 'android' &&
                <View style={styles.statusBarUnderlay} />}
              <RootNavigation />
            </View>
          </Provider>
        </ActionSheetProvider>
      );
    }
  }

  async _loadAssetsAsync() {
    try {
      // initialize existing user
      await getCurrentUser().loadExistingUserAsync();
      // TODO: [Wei] Workaround for now
      if (!getCurrentUser().isLoggedOn()) {
        let locale = await Expo.Util.getCurrentLocaleAsync();
        console.log(locale);
        let lang = 'chs';
        let bible = 'rcuvss';
        if (locale.substring(0, 2) == 'es') {
          lang = 'spa';
          bible = 'niv2011';
        } else if (locale.substring(0, 2) == 'en') {
          lang = 'eng';
          bible = 'niv2011';
        } else if (locale == 'zh-hk' || locale == 'zh-tw') {
          lang = 'cht';
          bible = 'rcuvts';
        }

        await getCurrentUser().loginAsync("4250000000", lang);
        await getCurrentUser().setBibleVersionAsync(bible);
      }
      getCurrentUser().logUserInfo();

      const bootValues = await Promise.all([
        Asset.loadAsync([
          require('./assets/icons/app-icon.png')
        ]),
        Font.loadAsync([
          // This is the font that we are using for our tab bar
          Ionicons.font,
          FontAwesome.font,
          // We include SpaceMono because we use it in HomeScreen.js. Feel free
          // to remove this if you are not using it in your app
          { 'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf') },
        ]),
      ]);

      // create the store with the boot data
      const initialstate = {
        books: bootValues[0],
        answers: bootValues[1] ? bootValues[1] : { answers: {} },
      }
      console.log("Load answers: " + JSON.stringify(initialstate.answers));
      store = createStore(initialstate);

    } catch (e) {
      // In this case, you might want to report the error to your error
      // reporting service, for example Sentry
      console.warn(
        'There was an error caching assets (see: App.js), perhaps due to a ' +
        'network timeout, so we skipped caching. Reload the app to try again.'
      );
      console.log(e);
    } finally {
      this.setState({ assetsAreLoaded: true });
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
