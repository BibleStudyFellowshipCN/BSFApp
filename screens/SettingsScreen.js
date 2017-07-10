
import React from 'react';
import { connect } from 'react-redux'
import { ScrollView, StyleSheet, Image, Text, View, Alert, TextInput, TouchableOpacity, KeyboardAvoidingView } from 'react-native';
import { Constants } from 'expo';
import { Models } from '../dataStorage/models';
import { clearStorageAsync, callWebServiceAsync, showWebServiceCallErrorsAsync } from '../dataStorage/storage';
import RadioButton from 'radio-button-react-native';
import { getCurrentUser } from '../store/user';
import { requestBooks } from "../store/books.js";
import { FontAwesome } from '@expo/vector-icons';
import SettingsList from 'react-native-settings-list';
import { RkButton } from 'react-native-ui-kitten';

class SettingsScreen extends React.Component {
  static route = {
    navigationBar: {
      title: '我',
    },
  };

  state = {
    language: getCurrentUser().getLanguageDisplayName(),
    bibleVersion: getCurrentUser().getBibleVersionDisplayName()
  };

  async onLanguageChange(language) {
    getCurrentUser().setLanguage(language);
    this.props.requestBooks(language);
    this.setState({ language: getCurrentUser().getLanguageDisplayName() });
  }

  async onBibleVerseChange(version) {
    getCurrentUser().setBibleVersion(version);
    await clearStorageAsync(Models.Passage.key);
    this.setState({ bibleVersion: getCurrentUser().getBibleVersionDisplayName() });
  }

  feedback = '';

  onLanguage() {
    // TODO: [Wei] Find a better UI control
    languages = [];
    for (var i in Models.Languages) {
      const language = Models.Languages[i];
      languages.push({ text: language.DisplayName, onPress: () => this.onLanguageChange(language.Value) });
    }
    Alert.alert('请选择', '显示语言', languages);
  }

  onBibleVerse() {
    versions = [];
    for (var i in Models.BibleVersions) {
      const version = Models.BibleVersions[i];
      versions.push({ text: version.DisplayName, onPress: () => this.onBibleVerseChange(version.Value) });
    }
    Alert.alert('请选择', '圣经版本', versions);
  }

  onFontSize() {
    alert("TODO: onFontSize");
  }

  async onSubmitFeedback() {
    if (this.feedback.trim() == '') {
      Alert.alert('缺少内容', '请输入反馈意见内容', [
        { text: 'OK', onPress: () => this.feedbackInput.focus() },
      ]);
      return;
    }

    const body = { comment: this.feedback };
    const result = await callWebServiceAsync(Models.Feedback.restUri, '', 'POST', [], body);
    const succeed = await showWebServiceCallErrorsAsync(result, 201);
    if (succeed) {
      this.feedbackInput.clear();
      this.feedback = '';
      Alert.alert('谢谢您的反馈意见！');
    }
  }

  render() {
    const { manifest } = Constants;
    let keyIndex = 0;
    return (
      <KeyboardAvoidingView style={styles.container} behavior='padding' keyboardVerticalOffset={0}>
        <SettingsList borderColor='#c8c7cc' defaultItemSize={40}>
          <SettingsList.Header headerText='设置' headerStyle={{ color: 'black' }} />
          <SettingsList.Item
            title='显示语言'
            titleInfo={this.state.language}
            titleInfoStyle={styles.titleInfoStyle}
            onPress={this.onLanguage.bind(this)}
          />
          <SettingsList.Item
            title='圣经版本'
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
          <SettingsList.Header headerText='MBSF - Mobile Bible Study Fellowship' headerStyle={{ color: 'black', marginTop: 15 }} />
          <View style={styles.answerContainer}>
            <TextInput
              style={styles.answerInput}
              ref={(input) => this.feedbackInput = input}
              blurOnSubmit={false}
              placeholder="反馈意见"
              multiline
              onChangeText={(text) => { this.feedback = text }}
            />
          </View>
          <View style={{ alignItems: 'center' }}>
            <RkButton onPress={this.onSubmitFeedback.bind(this)}>提交</RkButton>
          </View>
          <SettingsList.Item
            title='App版本'
            titleInfo={manifest.version}
            hasNavArrow={false}
            titleInfoStyle={styles.titleInfoStyle}
          />
        </SettingsList>
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
