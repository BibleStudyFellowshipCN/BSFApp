import React from 'react';
import { connect } from 'react-redux'
import { ScrollView, StyleSheet, View, Alert, Image } from 'react-native';
import { Constants, StoreReview, FileSystem } from 'expo';
import { Models } from '../dataStorage/models';
import { appVersion } from '../dataStorage/storage';
import { getCurrentUser } from '../utils/user';
import { requestBooks, clearBooks } from "../store/books";
import SettingsList from 'react-native-settings-list';
import { getI18nText } from '../utils/I18n';
import { clearLesson } from '../store/lessons.js'
import { clearPassage } from '../store/passage.js'
import { connectActionSheet } from '@expo/react-native-action-sheet';
import { NavigationActions } from 'react-navigation';
import { FontAwesome, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { showMessage } from "react-native-flash-message";

@connectActionSheet class SettingsScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    let title = navigation.state.params && navigation.state.params.title ? navigation.state.params.title : getI18nText('我的设置');
    return {
      title: getI18nText(title)
    };
  };

  state = {
    language: getCurrentUser().getLanguageDisplayName(),
    bibleVersion: getCurrentUser().getBibleVersionDisplayName(),
    fontSize: getCurrentUser().getFontSize(),
    user: {}
  };

  componentWillMount() {
    this.onCellphoneChanged();
  }

  async updateBibleVersionBasedOnLanguage(language) {
    if (language == 'eng') {
      await this.onBibleVerseChange('niv2011');
      await getCurrentUser().setBibleVersion2Async(null);
    } else if (language == 'cht') {
      await this.onBibleVerseChange('rcuvts');
      await getCurrentUser().setBibleVersion2Async('niv2011');
    } else if (language == 'spa') {
      await this.onBibleVerseChange('nvi');
      await getCurrentUser().setBibleVersion2Async('niv2011');
    } else {
      await this.onBibleVerseChange('rcuvss');
      await getCurrentUser().setBibleVersion2Async('niv2011');
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
        params: { title: getI18nText('BSF课程') },
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

  onBibleSelected(name, version) {
    console.log('onBibleSelected: ' + name + ' ' + version);
    this.onBibleVerseChange(version);
    this.setState({ bibleVersion: name });
  }

  onBibleVerse() {
    this.props.navigation.navigate('BibleSelect', { version: getCurrentUser().getBibleVersion(), onSelected: this.onBibleSelected.bind(this) });
  }

  getFontText() {
    switch (this.state.fontSize) {
      case 1:
        return getI18nText('小');
      case 2:
        return getI18nText('中');
      case 3:
        return getI18nText('大');
      case 4:
        return getI18nText("特大");
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
      getI18nText("特大")
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

  onAttendanceHome() {
    this.props.navigation.navigate('AttendanceHome');
  }

  async onAnswerManage() {
    this.props.navigation.navigate('AnswerManage');
  }

  async onClearDownloadFiles() {
    try {
      await getCurrentUser().resetDiscussionReadAsync();

      let freeSize = 0;
      const files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory);
      for (let i in files) {
        const file = files[i];
        console.log(file);
        if (file.toLocaleLowerCase().indexOf('book-') !== -1 && file.toLocaleLowerCase().endsWith('.json')) {
          const fileUri = FileSystem.documentDirectory + file;
          console.log(fileUri);
          const info = await FileSystem.getInfoAsync(fileUri);
          console.log(JSON.stringify(info));
          freeSize += info.size;
          console.log(freeSize);
          await FileSystem.deleteAsync(fileUri, { idempotent: true });
        }
      }
      showMessage({
        message: getI18nText('Completed'),
        description: `Removed ${freeSize} bytes`,
        duration: 3000,
        type: "success"
      });
    } catch (e) {
      showMessage({
        message: getI18nText('错误'),
        description: JSON.stringify(e),
        duration: 5000,
        type: "danger"
      });
    }
  }

  render() {
    phone = getCurrentUser().getCellphone();
    const fontSize = getCurrentUser().getSettingFontSize();
    const showReview = StoreReview.isSupported() && !StoreReview.hasAction();
    return (
      <ScrollView
        style={{ backgroundColor: 'white' }}
        ref={ref => this.scrollView = ref}>
        <View style={{ backgroundColor: 'white' }}>
          <SettingsList borderColor='#c8c7cc' defaultItemSize={40}>
            <SettingsList.Header headerText={getI18nText('设置')} headerStyle={{ color: 'black' }} />
            <SettingsList.Item
              icon={
                <View style={{ marginTop: 3, left: 7 }} >
                  <MaterialIcons color={Colors.yellow} size={28} name='language' />
                </View>
              }
              title={getI18nText('显示语言')}
              titleInfo={this.state.language}
              titleStyle={{ fontSize }}
              titleInfoStyle={{ fontSize }}
              onPress={this.onLanguage.bind(this)}
            />
            <SettingsList.Item
              icon={
                <View style={{ marginTop: 3, left: 7 }} >
                  <MaterialCommunityIcons color={Colors.yellow} size={28} name='book-multiple' />
                </View>
              }
              title={getI18nText('圣经版本')}
              titleInfo={this.state.bibleVersion.length > 23 ? this.state.bibleVersion.substr(0, 23) + '...' : this.state.bibleVersion}
              titleStyle={{ fontSize }}
              titleInfoStyle={{ fontSize }}
              onPress={this.onBibleVerse.bind(this)}
            />
            <SettingsList.Item
              icon={
                <View style={{ marginTop: 3, left: 7 }} >
                  <FontAwesome color={Colors.yellow} size={28} name='font' />
                </View>
              }
              title={getI18nText('字体大小')}
              titleInfo={this.getFontText()}
              titleStyle={{ fontSize }}
              titleInfoStyle={{ fontSize }}
              onPress={this.onFontSize.bind(this)}
            />
            <SettingsList.Item
              icon={
                <View style={{ marginTop: 3, left: 7 }} >
                  <MaterialCommunityIcons color={Colors.yellow} size={28} name='cellphone-iphone' />
                </View>
              }
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
                icon={
                  <View style={{ marginTop: 3, left: 7 }} >
                    <MaterialCommunityIcons color={Colors.yellow} size={28} name='format-list-checks' />
                  </View>
                }
                title={getI18nText('考勤表')}
                hasNavArrow={true}
                titleStyle={{ fontSize }}
                titleInfoStyle={{ fontSize }}
                onPress={this.onAttendanceHome.bind(this)}
              />
            }
            <SettingsList.Item
              icon={
                <View style={{ marginTop: 3, left: 7 }} >
                  <MaterialIcons color={Colors.yellow} size={25} name='devices' />
                </View>
              }
              title={getI18nText('答案管理')}
              hasNavArrow={true}
              titleStyle={{ fontSize }}
              titleInfoStyle={{ fontSize }}
              onPress={this.onAnswerManage.bind(this)}
            />
            <SettingsList.Item
              icon={
                <View style={{ marginTop: 3, left: 7 }} >
                  <FontAwesome color={Colors.yellow} size={28} name='trash' />
                </View>
              }
              title={getI18nText('清空下载文件')}
              hasNavArrow={true}
              titleStyle={{ fontSize }}
              titleInfoStyle={{ fontSize }}
              onPress={this.onClearDownloadFiles.bind(this)}
            />
            <SettingsList.Item
              icon={
                <View style={{ marginTop: 3, left: 7 }} >
                  <MaterialIcons color={Colors.yellow} size={28} name='feedback' />
                </View>
              }
              title={getI18nText('反馈意见')}
              hasNavArrow={true}
              titleStyle={{ fontSize }}
              titleInfoStyle={{ fontSize }}
              onPress={this.onFeedback.bind(this)}
            />
            {
              this.state.user.chat &&
              <SettingsList.Item
                icon={
                  <View style={{ marginTop: 3, left: 7 }} >
                    <FontAwesome color={Colors.yellow} size={24} name='wechat' />
                  </View>
                }
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
              showReview &&
              <SettingsList.Item
                icon={
                  <View style={{ marginTop: 3, left: 7 }} >
                    <MaterialIcons color={Colors.yellow} size={28} name='rate-review' />
                  </View>
                }
                title={getI18nText('评论')}
                titleStyle={{ fontSize }}
                titleInfoStyle={{ fontSize }}
                hasNavArrow={true}
                onPress={() => StoreReview.requestReview()}
              />
            }
            <SettingsList.Item
              icon={
                <View style={{ marginTop: 3, left: 7 }} >
                  <Image
                    style={{ width: 30, height: 30 }}
                    source={require('../assets/images/icon-android.png')} />
                </View>
              }
              title={getI18nText('关于CBSF') + ` (${appVersion})`}
              titleStyle={{ fontSize }}
              titleInfoStyle={{ fontSize }}
              hasNavArrow={true}
              onPress={() => this.props.navigation.navigate('About')}
            />
          </SettingsList>
        </View>
      </ScrollView>
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
