import React from 'react';
import { connect } from 'react-redux'
import { ScrollView, StyleSheet, View, Alert, KeyboardAvoidingView, Platform, AsyncStorage } from 'react-native';
import Expo, { Constants } from 'expo';
import { Models } from '../dataStorage/models';
import { callWebServiceAsync, showWebServiceCallErrorsAsync } from '../dataStorage/storage';
import { getCurrentUser } from '../store/user';
import { requestBooks } from "../store/books.js";
import SettingsList from 'react-native-settings-list';
import { getI18nText } from '../store/I18n';
import { clearLesson } from '../store/lessons.js'
import { clearPassage } from '../store/passage.js'
import { connectActionSheet } from '@expo/react-native-action-sheet';
import { NavigationActions } from 'react-navigation'
import { LegacyAsyncStorage } from 'expo';

@connectActionSheet class SettingsScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    let title = navigation.state.params && navigation.state.params.title ? navigation.state.params.title : '我';
    return {
      title: getI18nText(title)
    };
  };

  state = {
    language: getCurrentUser().getLanguageDisplayName(),
    bibleVersion: getCurrentUser().getBibleVersionDisplayName(),
    showMigration: false
  };

  componentWillMount() {
    if (Platform.OS == 'ios') {
      LegacyAsyncStorage.getItem('ANSWER', (err, oldData) => {
        if (err || !oldData) {
          oldData = "{}";
        }
        let oldAnswer = JSON.parse(oldData);
        if (oldAnswer.rawData) {
          this.setState({ showMigration: true });
        }
      });
    }
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

  async migrate() {
    const key = 'ANSWER';
    await LegacyAsyncStorage.migrateItems([key]);

    LegacyAsyncStorage.getItem(key, (err, oldData) => {
      if (err || !oldData) {
        oldData = "{}";
      }
      let oldAnswer = JSON.parse(oldData);
      if (!oldAnswer.rawData) {
        Alert.alert("No need to recover", "We don't find any data from previous version");
        return;
      }
      console.log(JSON.stringify(oldAnswer));

      AsyncStorage.getItem(key, (err, newData) => {
        if (err || !newData) {
          newData = "{}";
        }

        let newAnswer = JSON.parse(newData);
        if (!newAnswer.rawData) {
          newAnswer.rawData = {
            answers: {}
          };
        }
        console.log(JSON.stringify(newAnswer));

        let mergeData = JSON.parse(JSON.stringify(newAnswer));
        for (var item in oldAnswer.rawData.answers) {
          let currentItem = oldAnswer.rawData.answers[item];
          let targetItem = mergeData.rawData.answers[item];
          if (!targetItem) {
            mergeData.rawData.answers[item] = currentItem;
          } else {
            if (targetItem.answerText.indexOf(currentItem.answerText) == -1) {
              mergeData.rawData.answers[item].answerText = currentItem.answerText + "\n" + mergeData.rawData.answers[item].answerText;
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
    return (
      <KeyboardAvoidingView style={styles.container} behavior='padding' keyboardVerticalOffset={0}>
        <ScrollView
          ref={ref => this.scrollView = ref}>
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
                onPress={() => { getCurrentUser().checkForUpdate(); }}
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
  }
});
