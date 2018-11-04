import React from 'react';
import { Platform, StatusBar, StyleSheet, View, Alert } from 'react-native';
import Expo, { AppLoading } from 'expo';
import RootNavigation from './navigation/RootNavigation';
import createStore from './store/createStore'
import { loadAsync, reloadGlobalCache } from './dataStorage/storage';
import { Models } from './dataStorage/models';
import { Provider } from 'react-redux';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { getCurrentUser } from './store/user';
import { getI18nText } from './store/I18n';
import { DangerZone } from 'expo';
const { Localization } = DangerZone;

let store;

Expo.Updates.addListener(updateClient);

function updateClient(event) {
  console.log('updateClient: ' + JSON.stringify(event));
  if (event === Expo.Updates.EventType.DOWNLOAD_FINISHED) {
    Alert.alert(getI18nText('发现更新'), getI18nText('程序将重新启动'), [
      { text: 'OK', onPress: () => Expo.Updates.reload() },
    ]);
  }
}

export default class App extends React.Component {
  state = {
    isLoadingComplete: false,
  };

  render() {
    if (!this.state.isLoadingComplete && !this.props.skipLoadingScreen) {
      return (
        <AppLoading
          startAsync={this._loadResourcesAsync}
          onError={this._handleLoadingError}
          onFinish={this._handleFinishLoading}
        />
      );
    } else {
      return (
        <ActionSheetProvider>
          <Provider store={store}>
            <View style={{ flex: 1 }}>
              {Platform.OS !== 'ios' && <StatusBar barStyle="default" />}
              <RootNavigation />
            </View>
          </Provider>
        </ActionSheetProvider >
      );
    }
  }

  async loadUserInfo() {
    await getCurrentUser().loadExistingUserAsync();
    // TODO: [Wei] Workaround for now
    if (!getCurrentUser().isLoggedOn()) {
      let locale = await Localization.getCurrentLocaleAsync();
      console.log(locale);
      let lang = 'eng';
      let bible = 'niv2011';
      if (locale.substring(0, 2) == 'es') {
        lang = 'spa';
        bible = 'nvi';
      } else if (locale.substring(0, 2) == 'en') {
        lang = 'eng';
        bible = 'niv2011';
      } else if (locale == 'zh-hk' || locale == 'zh-tw') {
        lang = 'cht';
        bible = 'rcuvts';
      } else if (locale.substring(0, 2) == 'zh') {
        lang = 'chs';
        bible = 'rcuvss';
      }

      await getCurrentUser().loginAsync("0000000000", lang);
      await getCurrentUser().setBibleVersionAsync(bible);
    }
    getCurrentUser().logUserInfo();    // add all the neccessary load in Promise.all
  }

  _loadResourcesAsync = async () => {
    // initialize existing user
    try {
      await this.loadUserInfo();
    } catch (error) {
      console.log(error);
    }

    let bootValues;
    try {
      bootValues = await Promise.all([
        loadAsync(Models.Answer, null, false)
      ]);
    } catch (error) {
      console.log(error);
    }

    // create the store with the boot data
    const initialstate = {
      answers: bootValues[0] ? bootValues[0] : { answers: {} },
    }
    store = createStore(initialstate);
  };

  _handleLoadingError = error => {
    // In this case, you might want to report the error to your error
    // reporting service, for example Sentry
    console.warn(error);
  };

  _handleFinishLoading = () => {
    this.setState({ isLoadingComplete: true });
  };
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