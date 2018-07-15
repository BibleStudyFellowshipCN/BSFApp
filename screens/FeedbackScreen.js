import React from 'react';
import {
  ScrollView, StyleSheet, View, Alert, TextInput, KeyboardAvoidingView, Keyboard,
  UIManager, Platform, Text
} from 'react-native';
import { Models } from '../dataStorage/models';
import { Layout } from '../constants/Layout';
import { callWebServiceAsync, showWebServiceCallErrorsAsync } from '../dataStorage/storage';
import { getI18nText } from '../store/I18n';
import { Button } from 'react-native-elements';
import { getCurrentUser } from '../store/user';

export default class FeedbackScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: getI18nText('反馈意见')
    };
  };

  state = {
    height: 120,
    showMigration: false
  };

  componentWillMount() {
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (event) => {
      this.keyboardHeight = event.endCoordinates.height;
      this.setState({ keyboard: true });
    });
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', (event) => {
      this.setState({ keyboard: false })
    });
  }

  componentWillUnmount() {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }

  feedback = '';

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
        {
          text: 'OK', onPress: () => {
            this.feedbackInput.clear();
            this.props.navigation.goBack();
          }
        },
      ]);
    }
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
    return (
      <KeyboardAvoidingView style={styles.container} behavior='padding' keyboardVerticalOffset={0}>
        <ScrollView
          style={{ backgroundColor: 'white', flex: 1 }}
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
          <View style={styles.answerContainer}>
            <TextInput
              style={[styles.answerInput, { fontSize: getCurrentUser().getLessonFontSize() }]}
              ref={(input) => this.feedbackInput = input}
              blurOnSubmit={false}
              placeholder={getI18nText('反馈意见')}
              multiline
              onChangeText={(text) => { this.feedback = text }}
            />
          </View>
          <View style={{ alignItems: 'center', marginTop: 20 }}>
            <Button
              backgroundColor='#397EDC'
              borderRadius={5}
              containerViewStyle={{ width: 130 }}
              title={getI18nText('提交')}
              onPress={this.onSubmitFeedback.bind(this)} />
          </View>
          {
            this.state.showMigration &&
            <View style={{ alignItems: 'center', marginVertical: 7, marginHorizontal: 3 }}>
              <Text style={{ fontSize: 20, color: 'red', marginBottom: 10 }}>Note: If you see missing answers after update, please click 'Recover' button</Text>
              <Button
                backgroundColor='#397EDC'
                borderRadius={5}
                containerViewStyle={{ width: 130 }}
                title='Recover'
                onPress={() => { getCurrentUser().migrateAsync() }} />
            </View>
          }
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  answerContainer: {
    margin: 5,
    height: 150,
    padding: 5,
    backgroundColor: 'whitesmoke',
  },
  answerInput: {
    height: 150,
    textAlignVertical: 'top'
  }
});
