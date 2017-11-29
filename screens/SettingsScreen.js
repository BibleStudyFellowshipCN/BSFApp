import React from 'react';
import { connect } from 'react-redux'
import { ScrollView, StyleSheet, Image, Text, View, Alert, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, UIManager, AsyncStorage, Dimensions } from 'react-native';
import Expo, { Constants } from 'expo';
import { Models } from '../dataStorage/models';
import { clearStorageAsync, callWebServiceAsync, showWebServiceCallErrorsAsync } from '../dataStorage/storage';
import { getCurrentUser } from '../store/user';
import { requestBooks } from "../store/books.js";
import { FontAwesome } from '@expo/vector-icons';
import SettingsList from 'react-native-settings-list';
import { getI18nText, getI18nBibleBook } from '../store/I18n';
import { clearLesson } from '../store/lessons.js'
import { clearPassage } from '../store/passage.js'
import { RkButton } from 'react-native-ui-kitten';
import { connectActionSheet } from '@expo/react-native-action-sheet';
import { NavigationActions } from 'react-navigation'
import { LegacyAsyncStorage } from 'expo';

@connectActionSheet class SettingsScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    title = navigation.state.params && navigation.state.params.title ? navigation.state.params.title : '我';
    return {
      title: getI18nText(title)
    };
  };

  state = {
    language: getCurrentUser().getLanguageDisplayName(),
    bibleVersion: getCurrentUser().getBibleVersionDisplayName(),
    offlineMode: getCurrentUser().getIsOfflineMode(),
    showMigration: false,
    height: 120
  };

  componentWillMount() {
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (event) => {
      this.keyboardHeight = event.endCoordinates.height;
      this.setState({ keyboard: true });
    });
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', (event) => {
      this.setState({ keyboard: false })
    });

    if (Platform.OS == 'ios') {
      LegacyAsyncStorage.getItem('ANSWER', (err, oldData) => {
        if (err || !oldData) {
          oldData = "{}";
        }
        oldAnswer = JSON.parse(oldData);
        if (oldAnswer.rawData) {
          this.setState({ showMigration: true });
        }
      });
    }
  }

  componentWillUnmount() {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }

  async updateBibleVersionBasedOnLanguage(language) {
    if (language == 'eng') {
      await this.onBibleVerseChange('niv2011');
    } else if (language == 'cht') {
      await this.onBibleVerseChange('rcuvts');
    } else if (language == 'spa') {
      await this.onBibleVerseChange('nvi');
    } else {
      await this.onBibleVerseChange('rcuvss');
    }
    getCurrentUser().logUserInfo();
  }

  async onLanguageChange(language) {
    if (getCurrentUser().getLanguage() != language) {
      await getCurrentUser().setLanguageAsync(language);

      // Also set the bible version based on language selection
      this.updateBibleVersionBasedOnLanguage(language);

      this.props.clearLesson();
      this.props.requestBooks(language);
      this.setState({ language: getCurrentUser().getLanguageDisplayName() });

      const setParamsAction = NavigationActions.setParams({
        params: { title: 'BSF课程' },
        key: 'Home',
      })
      this.props.navigation.dispatch(setParamsAction);
    }
  }

  async onBibleVerseChange(version) {
    if (getCurrentUser().getBibleVersion() != version) {
      await getCurrentUser().setBibleVersionAsync(version);
      getCurrentUser().logUserInfo();

      this.props.clearPassage();
      this.setState({ bibleVersion: getCurrentUser().getBibleVersionDisplayName() });
    }
  }

  feedback = '';

  onLanguage() {
    let options = [];
    for (var i in Models.Languages) {
      const text = Models.Languages[i].DisplayName;
      options.push(text);
    }
    options.push('Cancel');
    let cancelButtonIndex = options.length - 1;
    let destructiveButtonIndex = cancelButtonIndex;
    this.props.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex,
      },
      buttonIndex => {
        if (buttonIndex != cancelButtonIndex) {
          this.onLanguageChange(Models.Languages[buttonIndex].Value);
        }
      }
    );
  }

  onBibleVerse() {
    if (getCurrentUser().getIsOfflineMode()) {
      Alert.alert(getI18nText("提示"), getI18nText("请先关闭离线模式"));
      return;
    }

    let options = [];
    for (var i in Models.BibleVersions) {
      const text = Models.BibleVersions[i].DisplayName;
      options.push(text);
    }
    options.push('Cancel');
    let cancelButtonIndex = options.length - 1;
    let destructiveButtonIndex = cancelButtonIndex;
    this.props.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex,
      },
      buttonIndex => {
        if (buttonIndex != cancelButtonIndex) {
          this.onBibleVerseChange(Models.BibleVersions[buttonIndex].Value);
        }
      }
    );
  }

  onFontSize() {
    alert("TODO: onFontSize");
  }

  async onSwitchOffline(value) {
    await getCurrentUser().setIsOfflineModeAsync(value);
    this.setState({ offlineMode: value });
    if (value) {
      this.updateBibleVersionBasedOnLanguage(getCurrentUser().getLanguage());
    }
  }

  onFeedback() {
    this.props.navigation.navigate('Feedback');
  }

  async onSubmitFeedback() {
    if (this.feedback.trim() == '') {
      Alert.alert(getI18nText('缺少内容'), getI18nText('请输入反馈意见内容'), [
        { text: 'OK', onPress: () => this.feedbackInput.focus() },
      ]);
      return;
    }

    const body = { comment: this.feedback };
    const result = await callWebServiceAsync(Models.Feedback.restUri, '', 'POST', [], body);
    const succeed = await showWebServiceCallErrorsAsync(result, 201);
    if (succeed) {
      this.feedback = '';
      Alert.alert(getI18nText('谢谢您的反馈意见！'), '', [
        { text: 'OK', onPress: () => this.feedbackInput.clear() },
      ]);
    }
  }

  getVersionNumber(version) {
    // version is "a.b.c.d"
    let versionNumbers = version.split(".");
    let value = 0;
    for (i in versionNumbers) {
      value = value * 1000 + parseInt(versionNumbers[i]);
    }
    return value;
  }

  async checkForUpdate() {
    const { manifest } = Constants;
    const result = await callWebServiceAsync('https://expo.io/@turbozv/CBSFApp/index.exp?sdkVersion=' + manifest.sdkVersion, '', 'GET');
    const succeed = await showWebServiceCallErrorsAsync(result, 200);
    if (succeed) {
      const clientVersion = this.getVersionNumber(manifest.version);
      const serverVersion = this.getVersionNumber(result.body.version);
      console.log('checkForUpdate:' + clientVersion + '-' + serverVersion);
      if (clientVersion < serverVersion) {
        Alert.alert(getI18nText('发现更新') + ': ' + result.body.version, getI18nText('程序将重新启动'), [
          { text: 'OK', onPress: () => Expo.Util.reload() },
        ]);
      } else {
        Alert.alert(getI18nText('您已经在使用最新版本'), getI18nText('版本') + ': ' + manifest.version + ' (SDK' + manifest.sdkVersion + ')', [
          { text: 'OK', onPress: () => { } },
        ]);
      }
    }
  }

  async migrate() {
    const key = 'ANSWER';
    await LegacyAsyncStorage.migrateItems([key]);

    LegacyAsyncStorage.getItem(key, (err, oldData) => {
      if (err || !oldData) {
        oldData = "{}";
      }
      oldAnswer = JSON.parse(oldData);
      if (!oldAnswer.rawData) {
        Alert.alert("No need to recover", "We don't find any data from previous version");
        return;
      }
      console.log(JSON.stringify(oldAnswer));

      AsyncStorage.getItem(key, (err, newData) => {
        if (err || !newData) {
          newData = "{}";
        }

        newAnswer = JSON.parse(newData);
        if (!newAnswer.rawData) {
          newAnswer.rawData = {
            answers: {}
          };
        }
        console.log(JSON.stringify(newAnswer));

        mergeData = JSON.parse(JSON.stringify(newAnswer));
        for (var item in oldAnswer.rawData.answers) {
          currentItem = oldAnswer.rawData.answers[item];
          targetItem = mergeData.rawData.answers[item];
          if (!targetItem) {
            mergeData.rawData.answers[item] = currentItem;
          } else {
            if (targetItem.answerText.indexOf(currentItem.answerText) == -1) {
              mergeData.rawData.answers[item].answerText += "\n" + currentItem.answerText;
            }
          }
        }

        console.log(JSON.stringify(mergeData));
        AsyncStorage.setItem(key, JSON.stringify(mergeData), () => {
          Alert.alert("Completed!", "App will restart to show the recovered answers", [
            { text: 'OK', onPress: () => Expo.Util.reload() },
          ]);
        });
      });

    });
  }

  contentSize = null;

  onContentSizeChange(e) {
    const contentSize = e.nativeEvent.contentSize;
    console.log(JSON.stringify(contentSize));

    // Support earlier versions of React Native on Android.
    if (!contentSize) return;

    if (!this.contentSize || this.contentSize.height !== contentSize.height) {
      this.contentSize = contentSize;
      this.setState({ height: this.contentSize.height + 14 });
    }
  }

  render() {
    const { manifest } = Constants;
    let keyIndex = 0;
    return (
      <KeyboardAvoidingView style={styles.container} behavior='padding' keyboardVerticalOffset={0}>
        <ScrollView
          ref={ref => this.scrollView = ref}
          onContentSizeChange={(contentWidth, contentHeight) => {
            if (this.state.keyboard) {
              const { State: TextInputState } = TextInput;
              const currentlyFocusedField = TextInputState.currentlyFocusedField();
              UIManager.measure(currentlyFocusedField, (originX, originY, width, height, pageX, pageY) => {
                const bottom = pageY + height;
                const viewHeight = Layout.window.height - this.keyboardHeight - 16;
                if (bottom > viewHeight) {
                  const pos = bottom - viewHeight + height;
                  this.scrollView.scrollTo({ y: pos, animated: true });
                }
              });
            }
          }}>
          <View style={{ backgroundColor: 'white' }}>
            <SettingsList borderColor='#c8c7cc' defaultItemSize={40}>
              <SettingsList.Header headerText={getI18nText('设置')} headerStyle={{ color: 'black' }} />
              <SettingsList.Item
                title={getI18nText('显示语言')}
                titleInfo={this.state.language}
                titleInfoStyle={styles.titleInfoStyle}
                onPress={this.onLanguage.bind(this)}
              />
              <SettingsList.Item
                title={getI18nText('圣经版本')}
                titleInfo={this.state.bibleVersion}
                titleInfoStyle={styles.titleInfoStyle}
                onPress={this.onBibleVerse.bind(this)}
              />
              <SettingsList.Item
                title={getI18nText('离线模式')}
                hasNavArrow={false}
                hasSwitch={true}
                switchState={this.state.offlineMode}
                switchOnValueChange={this.onSwitchOffline.bind(this)}
              />
              {/*<SettingsList.Item
                title='字体大小'
                titleInfo='中等'
                titleInfoStyle={styles.titleInfoStyle}
                onPress={this.onFontSize.bind(this)}
              />*/}
              <SettingsList.Item
                title={getI18nText('反馈意见')}
                hasNavArrow={true}
                titleInfoStyle={styles.titleInfoStyle}
                onPress={this.onFeedback.bind(this)}
              />
              <SettingsList.Header headerText='MBSF - Mobile Bible Study Fellowship' headerStyle={{ color: 'black', marginTop: 15 }} />
              <SettingsList.Item
                title={getI18nText('版本') + ': ' + manifest.version}
                titleInfo={getI18nText('检查更新')}
                titleInfoStyle={styles.titleInfoStyle}
                onPress={this.checkForUpdate.bind(this)}
              />
              {
                this.state.showMigration &&
                <SettingsList.Item
                  title='Recover missing answers'
                  hasNavArrow={true}
                  titleStyle={{ color: 'red' }}
                  onPress={this.migrate.bind(this)}
                />
              }
            </SettingsList>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    requestBooks: () => dispatch(requestBooks()),
    clearLesson: () => dispatch(clearLesson()),
    clearPassage: () => dispatch(clearPassage())
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(SettingsScreen)

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleContainer: {
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 15,
    flexDirection: 'row',
  },
  titleIconContainer: {
    marginRight: 15,
    paddingTop: 2,
  },
  sectionHeaderContainer: {
    backgroundColor: '#fbfbfb',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ededed',
  },
  sectionHeaderText: {
    fontSize: 14,
  },
  sectionContentContainer: {
    paddingTop: 8,
    paddingBottom: 12,
    paddingHorizontal: 15,
  },
  sectionContentText: {
    color: '#808080',
    fontSize: 14,
  },
  nameText: {
    fontWeight: '600',
    fontSize: 20,
  },
  slugText: {
    color: '#a39f9f',
    fontSize: 14,
    marginTop: -1,
    backgroundColor: 'transparent',
  },
  descriptionText: {
    fontSize: 14,
    marginTop: 6,
    color: '#4d4d4d',
  },
  colorContainer: {
    flexDirection: 'row',
  },
  colorPreview: {
    width: 17,
    height: 17,
    borderRadius: 2,
    marginRight: 6,
  },
  colorTextContainer: {
    flex: 1,
  },
  textContent: {
    fontSize: 18,
    height: 30
  },
  answerContainer: {
    marginTop: 5,
    height: 100,
    padding: 5,
    backgroundColor: 'whitesmoke',
  },
  answerInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    textAlignVertical: 'top'
  },
  buttonText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center'
  },
  buttonContainer: {
    backgroundColor: '#2980B9',
    width: 80,
    borderRadius: 4
  }
});
