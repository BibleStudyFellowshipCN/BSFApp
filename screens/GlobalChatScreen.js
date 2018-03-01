import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { getI18nText } from '../store/I18n';
import { Button } from 'react-native-elements';
import { getCurrentUser } from '../store/user';
import { GiftedChat, Bubble } from 'react-native-gifted-chat';
import Chat from '../store/chat';
import { Constants } from 'expo';
import KeyboardSpacer from 'react-native-keyboard-spacer';

export default class GlobalChatScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: getI18nText('Chat room')
    };
  };

  state = {
    messages: [],
  }

  componentWillMount() {
  }

  componentDidMount() {
    Chat.loadMessages((message) => {
      console.log("New message: " + JSON.stringify(message));
      this.setState((previousState) => {
        return {
          messages: GiftedChat.append(previousState.messages, message),
        };
      });
    });
  }

  componentWillUnmount() {
    Chat.closeChat();
  }

  render() {
    return (
      <View style={styles.container}>
        <GiftedChat
          messages={this.state.messages}
          isAnimated={true}
          onSend={(message) => {
            Chat.sendMessage(message);
          }}
          user={{
            _id: Platform.OS + ' ' + Constants['deviceId'],
            name: 'B'
          }}
        />
        {
          Platform.OS == 'android' &&
          <KeyboardSpacer />
        }
      </View >
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
});
