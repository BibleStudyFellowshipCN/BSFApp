import React from 'react';
import { connect } from 'react-redux'
import { ScrollView, StyleSheet, View, Alert, KeyboardAvoidingView, Platform, AsyncStorage, Linking } from 'react-native';
import Expo, { Constants } from 'expo';
import { Models } from '../dataStorage/models';
import { callWebServiceAsync, showWebServiceCallErrorsAsync } from '../dataStorage/storage';
import { getCurrentUser } from '../store/user';
import { requestBooks, clearBooks } from "../store/books.js";
import SettingsList from 'react-native-settings-list';
import { getI18nText } from '../store/I18n';
import { clearLesson } from '../store/lessons.js'
import { clearPassage } from '../store/passage.js'
import { connectActionSheet } from '@expo/react-native-action-sheet';
import { NavigationActions } from 'react-navigation'

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
    fontSize: getCurrentUser().getFontSize(),
    showMigration: false,
    user: {}
  };

  componentWillMount() {
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

  reload() {
    this.props.clearBooks();
    this.props.requestBooks();
    this.props.clearLesson();
    this.props.clearPassage();
  }

  async onLanguageChange(language) {
    if (getCurrentUser().getLanguage() != language) {
      await getCurrentUser().setLanguageAsync(language);

      // Also set the bible version based on language selection
      this.updateBibleVersionBasedOnLanguage(language);

      this.reload();
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

      this.setState({ bibleVersion: getCurrentUser().getBibleVersionDisplayName() });
      this.reload();
    }
  }

  checkAppUpdate() {
    getCurrentUser().checkForUpdate(false);
  }

  checkStoreUpdate() {
    if (Platform.OS == 'ios') {
      Linking.openURL('itms://itunes.apple.com/us/app/apple-store/id1229869018?mt=8').catch(err => alert(err));
    } else if (Platform.OS == 'android') {
      Linking.openURL('market://details?id=org.cbsfappv1.bsfclass').catch(err => alert(err));
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

  getFontText() {
    switch (this.state.fontSize) {
      case 1:
        return getI18nText('小');
      case 2:
        return getI18nText('中');
      case 3:
        return getI18nText('大');
    }
  }

  async onFontSizeChange(value) {
    getCurrentUser().setFontSizeAsync(value);
    this.setState({ fontSize: value });
    this.reload();
  }

  onFontSize() {
    let options = [
      getI18nText('小'),
      getI18nText('中'),
      getI18nText('大'),
    ];
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
          this.onFontSizeChange(buttonIndex + 1);
        }
      }
    );
  }

  onFeedback() {
    this.props.navigation.navigate('GlobalChat', {
      id: Constants['deviceId'],
      title: getI18nText('反馈意见'),
      defaultUserName: 'S'
    });
  }

  onSetPhoneNumber() {
    this.props.navigation.navigate('SetPhone', { refresh: this.onCellphoneChanged.bind(this) });
  }

  async onCellphoneChanged() {
    const phone = getCurrentUser().getCellphone();
    console.log(phone);

    const user = getCurrentUser().getUserPermissions();
    console.log("UserPermissions: " + JSON.stringify(user));
    this.setState({ user });

    this.reload();
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
    const fontSize = getCurrentUser().getSettingFontSize();
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
                titleStyle={{ fontSize }}
                titleInfoStyle={{ fontSize }}
                onPress={this.onLanguage.bind(this)}
              />
              <SettingsList.Item
                title={getI18nText('圣经版本')}
                titleInfo={this.state.bibleVersion}
                titleStyle={{ fontSize }}
                titleInfoStyle={{ fontSize }}
                onPress={this.onBibleVerse.bind(this)}
              />
              <SettingsList.Item
                title={getI18nText('字体大小')}
                titleInfo={this.getFontText()}
                titleStyle={{ fontSize }}
                titleInfoStyle={{ fontSize }}
                onPress={this.onFontSize.bind(this)}
              />
              <SettingsList.Item
                title={getI18nText('手机号码')}
                titleInfo={getI18nText(phone == '' ? '设置' : '更改')}
                hasNavArrow={true}
                titleStyle={{ fontSize }}
                titleInfoStyle={{ fontSize }}
                onPress={this.onSetPhoneNumber.bind(this)}
              />
              {
                this.state.user.isGroupLeader &&
                <SettingsList.Item
                  title={getI18nText('考勤表')}
                  hasNavArrow={true}
                  titleStyle={{ fontSize }}
                  titleInfoStyle={{ fontSize }}
                  onPress={this.onAttendance.bind(this)}
                />
              }
              {
                this.state.user.audio &&
                <SettingsList.Item
                  title={getI18nText('讲道录音')}
                  hasNavArrow={true}
                  titleStyle={{ fontSize }}
                  titleInfoStyle={{ fontSize }}
                  onPress={this.onAudio.bind(this)}
                />
              }
              <SettingsList.Header headerText='MBSF - Mobile Bible Study Fellowship' headerStyle={{ color: 'black', marginTop: 15 }} />
              <SettingsList.Item
                title={getI18nText('版本') + ': ' + manifest.version}
                titleInfo={getI18nText('检查更新')}
                titleStyle={{ fontSize }}
                titleInfoStyle={{ fontSize }}
                onPress={this.checkAppUpdate.bind(this)}
              />
              <SettingsList.Item
                title={getI18nText('反馈意见')}
                hasNavArrow={true}
                titleStyle={{ fontSize }}
                titleInfoStyle={{ fontSize }}
                onPress={this.onFeedback.bind(this)}
              />
              {
                this.state.user.chat &&
                <SettingsList.Item
                  title={getI18nText('聊天室')}
                  hasNavArrow={true}
                  titleStyle={{ fontSize }}
                  titleInfoStyle={{ fontSize }}
                  onPress={() => {
                    this.props.navigation.navigate('GlobalChat', { title: getI18nText('聊天室') });
                  }}
                />
              }
              {
                this.state.showMigration &&
                <SettingsList.Item
                  title='Recover missing answers'
                  hasNavArrow={true}
                  titleStyle={{ color: 'red', fontSize }}
                  titleInfoStyle={{ fontSize }}
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
    clearPassage: () => dispatch(clearPassage()),
    clearBooks: () => dispatch(clearBooks())
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(SettingsScreen)

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
});
