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
    const title = navigation.state.params && navigation.state.params.title ? navigation.state.params.title : getI18nText('聊天室');
    return {
      title
    };
  };

  state = {
    messages: [],
  }

  constructor(props) {
    super(props);
    var id = '';
    if (props.navigation.state.params) {
      if (props.navigation.state.params.id) {
        id = props.navigation.state.params.id
      }
      if (props.navigation.state.params.text) {
        this.state.messages = [
          {
            _id: Math.round(Math.random() * 1000000),
            text: props.navigation.state.params.text,
            createdAt: new Date(2018, 2, 28),
            user: {
              _id: 0,
              name: 'Q',
            }
          }
        ];
      }
    }
    this.chatServer = new Chat(id);
  }

  componentWillMount() {
  }

  componentDidMount() {
    this.chatServer.loadMessages((message) => {
      console.log("New message: " + JSON.stringify(message));
      this.setState((previousState) => {
        return {
          messages: GiftedChat.append(previousState.messages, message),
        };
      });
    });
  }

  componentWillUnmount() {
    this.chatServer.closeChat();
  }

  render() {
    return (
      <View style={styles.container}>
        <GiftedChat
          messages={this.state.messages}
          isAnimated={true}
          onSend={(message) => {
            this.chatServer.sendMessage(message);
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
