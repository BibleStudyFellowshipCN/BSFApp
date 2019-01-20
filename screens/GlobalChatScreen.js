import React from 'react';
import { StyleSheet, View, Text, Platform, ActivityIndicator, Dimensions, Image, TouchableOpacity } from 'react-native';
import { getI18nText } from '../utils/I18n';
import { GiftedChat, Bubble } from 'react-native-gifted-chat';
import Chat from '../utils/chat';
import { Constants } from 'expo';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import Colors from '../constants/Colors';
import { EventRegister } from 'react-native-event-listeners';

export default class GlobalChatScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const title = navigation.state.params && navigation.state.params.title ? navigation.state.params.title : getI18nText('聊天室');
    return {
      title,
      headerLeft: (
        <View style={{ marginLeft: 10 }}>
          <TouchableOpacity onPress={() => navigateBack()}>
            <Image
              style={{ width: 34, height: 34 }}
              source={require('../assets/images/GoBack.png')} />
          </TouchableOpacity>
        </View>)
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
    navigateBack = () => this.props.navigation.pop();
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
    if (this.state.loading) {
      return (
        <ActivityIndicator
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          size="large"
          color={Colors.yellow} />);
    }

    const iPhoneModel = Constants.platform.ios && Constants.platform.ios.model ? Constants.platform.ios.model : '';
    const isIPhoneX = iPhoneModel.indexOf('X') !== -1 || iPhoneModel.indexOf('Simulator') !== -1;
    return (
      <View style={styles.container}>
        <GiftedChat
          style={{ flex: 1, background: 'white' }}
          messages={this.state.messages}
          isAnimated={true}
          showAvatarForEveryMessage={true}
          showUserAvatar={true}
          onSend={(message) => {
            this.chatServer.sendMessage(message);
          }}
          user={{
            _id: Platform.OS + ' ' + Constants['deviceId'],
            name: this.defaultUserName
          }}
          renderBubble={props => {
            return (
              <Bubble
                {...props}
                textStyle={{
                  right: {
                    color: '#202020'
                  }
                }}
                wrapperStyle={{
                  left: {
                    backgroundColor: '#eeeeee',
                  },
                  right: {
                    backgroundColor: '#FFECB3',
                  },
                }}
              />
            );
          }}
          renderAvatar={(e) => {
            const isSystem = e.currentMessage.user._id === 'System';
            return (
              <View style={{
                width: 40, height: 40, borderRadius: 40,
                backgroundColor: isSystem ? '#95a5a6' : Colors.yellow,
                alignItems: 'center', justifyContent: 'center'
              }}>
                <Text style={{ fontWeight: 'bold', fontSize: 10, color: 'white' }}>{isSystem ? 'Admin' : 'BSFer'}</Text>
              </View>
            );
          }}
        />
        {
          // When keyboard is not shown on iPhoneX+, we show some space
          isIPhoneX &&
          <View style={{ height: 30 }} />
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
    backgroundColor: '#FAFAFA'
  }
});
