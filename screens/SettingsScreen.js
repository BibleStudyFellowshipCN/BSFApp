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
    showMigration: false,
    user: {}
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

    this.onCellphoneChanged();
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

  onSetPhoneNumber() {
    this.props.navigation.navigate('SetPhone', { refresh: this.onCellphoneChanged.bind(this) });
  }

  async onCellphoneChanged() {
    const phone = getCurrentUser().getCellphone();
    console.log(phone);

    const body = { comment: this.feedback };
    const result = await callWebServiceAsync(Models.User.restUri, '/' + phone, 'GET');
    const succeed = await showWebServiceCallErrorsAsync(result);
    if (succeed && result.status == 200) {
      this.setState({ user: result.body });
    }
    else {
      this.setState({ user: {} });
    }
  }

  async onAttendance() {
    const result = await callWebServiceAsync(Models.Attendance.restUri, '?cellphone=' + phone, 'GET');
    const succeed = await showWebServiceCallErrorsAsync(result, 200);
    if (succeed) {
      this.props.navigation.navigate('Attendance', { data: result.body });
    }
  }

  async onAudio() {
    this.props.navigation.navigate('SermonAudio', { user: this.state.user });
  }

  render() {
    const { manifest } = Constants;
    phone = getCurrentUser().getCellphone();
    return (
      <KeyboardAvoidingView style={styles.container} behavior='padding' keyboardVerticalOffset={0}>
        <ScrollView
          style={{ backgroundColor: 'white' }}
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
                title={getI18nText('手机号码')}
                titleInfo={getI18nText(phone == '' ? '设置' : '更改')}
                hasNavArrow={true}
                titleInfoStyle={styles.titleInfoStyle}
                onPress={this.onSetPhoneNumber.bind(this)}
              />
              {
                this.state.user.isGroupLeader &&
                <SettingsList.Item
                  title={getI18nText('考勤表')}
                  hasNavArrow={true}
                  titleInfoStyle={styles.titleInfoStyle}
                  onPress={this.onAttendance.bind(this)}
                />
              }
              {
                this.state.user.audio &&
                <SettingsList.Item
                  title={getI18nText('讲道录音')}
                  hasNavArrow={true}
                  titleInfoStyle={styles.titleInfoStyle}
                  onPress={this.onAudio.bind(this)}
                />
              }
              <SettingsList.Header headerText='MBSF - Mobile Bible Study Fellowship' headerStyle={{ color: 'black', marginTop: 15 }} />
              <SettingsList.Item
                title={getI18nText('版本') + ': ' + manifest.version}
                titleInfo={getI18nText('检查更新')}
                titleInfoStyle={styles.titleInfoStyle}
                onPress={() => { getCurrentUser().checkForUpdate(); }}
              />
              <SettingsList.Item
                title={getI18nText('反馈意见')}
                hasNavArrow={true}
                titleInfoStyle={styles.titleInfoStyle}
                onPress={this.onFeedback.bind(this)}
              />
              {
                this.state.showMigration &&
                <SettingsList.Item
                  title='Recover missing answers'
                  hasNavArrow={true}
                  titleStyle={{ color: 'red' }}
                  onPress={() => getCurrentUser().migrateAsync()}
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
