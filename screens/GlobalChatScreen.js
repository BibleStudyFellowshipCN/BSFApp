import React from 'react';
import { StyleSheet, View, Platform, ActivityIndicator, Dimensions } from 'react-native';
import { getI18nText } from '../store/I18n';
import { GiftedChat } from 'react-native-gifted-chat';
import Chat from '../store/chat';
import { Constants } from 'expo';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import Colors from '../constants/Colors';
import { EventRegister } from 'react-native-event-listeners';

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
    windowWidth: Dimensions.get('window').width
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
    this.listener = EventRegister.addEventListener('screenDimensionChanged', (window) => {
      this.setState({ windowWidth: window.width });
    });
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
    EventRegister.removeEventListener(this.listener);
    this.chatServer.closeChat();
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
            style={{ flex: 1 }}
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
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
});
