import React from 'react';
import { StyleSheet, Text, View, Platform, ActivityIndicator } from 'react-native';
import { getI18nText } from '../store/I18n';
import { Button } from 'react-native-elements';
import { Models } from '../dataStorage/models';
import { loadAsync } from '../dataStorage/storage';
import { GiftedChat } from 'react-native-gifted-chat';
import Chat from '../store/chat';
import { Constants } from 'expo';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import Colors from '../constants/Colors';

export default class GlobalChatScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const title = navigation.state.params && navigation.state.params.title ? navigation.state.params.title : getI18nText('聊天室');
    return {
      title
    };
  };

  state = {
    loading: true,
    messages: [],
  }

  constructor(props) {
    super(props);
    var id = '';
    if (props.navigation.state.params) {
      if (props.navigation.state.params.id) {
        id = props.navigation.state.params.id
      }

      if (props.navigation.state.params.defaultUserName) {
        this.defaultUserName = props.navigation.state.params.defaultUserName;
      } else {
        this.defaultUserName = 'B';
      }
      if (props.navigation.state.params.text) {
        this.state.messages = [
          {
            _id: Math.round(Math.random() * 1000000),
            text: props.navigation.state.params.text,
            user: {
              _id: 0,
              name: 'Q',
            }
          }
        ];
      }
    }
    this.chatServer = new Chat(id, this.onNewMessage.bind(this), this.defaultUserName);
  }

  componentWillMount() {
  }

  componentDidMount() {
    console.log('loading messages');
    this.chatServer.loadMessages().then(() => {
      this.setState({ loading: false });
      console.log('loading messages done!');
    });
  }

  onNewMessage(message) {
    console.log("New message: " + JSON.stringify(message));
    this.setState((previousState) => {
      return {
        messages: GiftedChat.append(previousState.messages, message),
      };
    });
  }

  componentWillUnmount() {
    this.chatServer.closeChat();
  }

  async shareAnswer() {
    let questionId = this.props.navigation.state.params.id;
    const answerContent = await loadAsync(Models.Answer, null, false);
    console.log({ questionId, answerContent });
    if (!answerContent || !answerContent.answers || !answerContent.answers[questionId]) {
      return;
    }

    const message = answerContent.answers[questionId].answerText;
    this.chatServer.sendMessage([{
      _id: Math.round(Math.random() * 1000000),
      text: message,
      user: {
        _id: Platform.OS + ' ' + Constants['deviceId'],
        name: this.defaultUserName
      }
    }]);
  }

  render() {
    return (
      <View style={styles.container}>
        {
          this.state.loading &&
          <ActivityIndicator
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
            size="large"
            color={Colors.yellow} />
        }
        {
          !this.state.loading &&
          <GiftedChat
            messages={this.state.messages}
            isAnimated={true}
            onSend={(message) => {
              this.chatServer.sendMessage(message);
            }}
            user={{
              _id: Platform.OS + ' ' + Constants['deviceId'],
              name: this.defaultUserName
            }}
          />
        }
        {
          Platform.OS == 'android' &&
          <KeyboardSpacer />
        }
        {
          this.props.navigation.state.params.shareAnswer &&
          <View style={{
            position: 'absolute',
            top: 7,
            right: 2
          }}>
            <Button
              backgroundColor='#fcaf17'
              borderRadius={5}
              title={getI18nText('分享答案')}
              onPress={this.shareAnswer.bind(this)} />
          </View>
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
});
