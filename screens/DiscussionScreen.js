import React from 'react';
import {
  StyleSheet, Text, View, Platform, ActivityIndicator, TouchableOpacity, Dimensions, Alert, Image, Clipboard
} from 'react-native';
import { Models } from '../dataStorage/models';
import { loadAsync } from '../dataStorage/storage';
import Chat from '../utils/chat';
import { Constants } from 'expo';
import { getCurrentUser } from '../utils/user';
import Colors from '../constants/Colors';
import { getI18nBibleBook, getI18nText } from '../utils/I18n';
import { GiftedChat, Bubble } from 'react-native-gifted-chat';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import { callWebServiceAsync, showWebServiceCallErrorsAsync } from '../dataStorage/storage';
import { showMessage } from "react-native-flash-message";

export default class DiscussionScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.state.params.title,
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
    text: ''
  }

  contentSize = null;
  defaultUserName = 'B';
  messageId = 1;

  constructor(props) {
    super(props);

    shareAnswer = () => this.shareAnswer();

    let id = '';
    if (props.navigation.state.params) {
      if (props.navigation.state.params.id) {
        id = props.navigation.state.params.id;
        if (props.navigation.state.params.isGroupLeader) {
          id = 'H' + id;
        }
      }

      if (props.navigation.state.params.text) {
        this.questionText = props.navigation.state.params.text.trim();
      }

      if (props.navigation.state.params.quotes) {
        this.quotes = props.navigation.state.params.quotes;
      } else {
        this.quotes = [];
      }
    }

    this.chatServer = new Chat(id, this.onNewMessage.bind(this), this.onDeleteMessage.bind(this), this.defaultUserName);
  }

  componentDidMount() {
    navigateBack = () => this.props.navigation.pop();

    console.log('loading messages');
    this.chatServer.loadMessages().then(() => {
      this.setState({ loading: false });
      console.log('loading messages done!');
    });
  }

  onNewMessage(message) {
    if (typeof message._id === 'number') {
      const id = parseInt(message._id);
      if (id > this.messageId) {
        this.messageId = id;
      }
    } else {
      message._id = ++this.messageId;
    }
    console.log(`onNewMessage: ${JSON.stringify(message)}`);
    this.setState((previousState) => {
      return {
        messages: GiftedChat.append(previousState.messages, message),
      };
    });
  }

  onDeleteMessage(message) {
    // Remove the message
    const newMessages = this.state.messages.filter(item => item.createdAt.getTime() !== parseInt(message.createdAt) || item.user._id !== message.user);
    this.setState({ messages: newMessages });
  }

  componentWillUnmount() {
    this.chatServer.closeChat();
  }

  sendMessage(message) {
    this.chatServer.sendMessage([{
      _id: Math.round(Math.random() * 1000000),
      text: message,
      user: {
        _id: `${Platform.OS} ${Constants['deviceId']}`,
        name: this.defaultUserName
      }
    }]);
  }

  goToPassage(book, verse) {
    this.props.navigation.navigate('Bible', { book, verse, title: getI18nBibleBook(book) + verse });
  }

  async shareAnswer() {
    let questionId = this.props.navigation.state.params.id;
    const answerContent = await loadAsync(Models.Answer, null, false);
    if (!answerContent || !answerContent.answers || !answerContent.answers[questionId] ||
      !answerContent.answers[questionId].answerText ||
      answerContent.answers[questionId].answerText.length < 1) {
      showMessage({
        message: getI18nText('提示'),
        duration: 3000,
        description: getI18nText('您没有答这道题目'),
        type: "info",
      });
      return;
    }

    let message = answerContent.answers[questionId].answerText;
    if (this.state.text.length > 0) {
      message = this.state.text + '\n' + message;
    }

    this.setState({ text: message });
  }

  async setText(text) {
    this.text = text;
    this.setState({ text: text });
  }

  isMyMessage(id) {
    return `${Platform.OS} ${Constants['deviceId']}` === id;
  }

  async deleteMessage(message) {
    try {
      this.setState({ busy: true });
      const result = await callWebServiceAsync(Models.DeleteMessage.restUri, `/${message.createdAt.getTime()}`, 'DELETE');
      await showWebServiceCallErrorsAsync(result, 200);
    }
    finally {
      this.setState({ busy: false });
    }
  }

  onLongPress(context, message) {
    if (message.text) {
      let options = [getI18nText('拷贝'), getI18nText('取消')];
      let copyIndex = 0;
      let cancelButtonIndex = 1;
      let deleteIndex = -1;
      if (this.isMyMessage(message.user._id)) {
        options.splice(1, 0, getI18nText('删除'));
        copyIndex = 0;
        deleteIndex = 1;
        cancelButtonIndex = 2;
      }
      context.actionSheet().showActionSheetWithOptions({
        options,
        cancelButtonIndex,
      },
        (buttonIndex) => {
          switch (buttonIndex) {
            case copyIndex:
              Clipboard.setString(message.text);
              break;
            case deleteIndex:
              this.deleteMessage(message);
              break;
          }
        });
    }
  }

  getIndex(message) {
    const length = this.state.messages.length;
    for (let i = 0; i < length; i++) {
      if (message._id === this.state.messages[i]._id) {
        return length - i;
      }
    }

    return '#';
  }

  render() {
    if (this.state.loading) {
      return (
        <ActivityIndicator
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          size="large"
          color={Colors.yellow} />);
    }

    const windowWidth = Dimensions.get('window').width;
    const iPhoneModel = Constants.platform.ios && Constants.platform.ios.model ? Constants.platform.ios.model : '';
    const isIPhoneX = iPhoneModel.indexOf('X') !== -1 || iPhoneModel.indexOf('Simulator') !== -1;
    return (
      <View style={styles.container}>
        <Text style={[styles.dayTitle, { fontSize: getCurrentUser().getLessonFontSize() }]} selectable={true}>{this.questionText}</Text>
        {
          this.quotes &&
          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginHorizontal: 15,
            maxWidth: windowWidth - 10
          }}>
            {
              this.quotes.map((quote) => (
                <BibleQuote key={quote.book + quote.verse} book={quote.book} verse={quote.verse} goToPassage={this.goToPassage.bind(this)} />
              ))
            }
          </View>
        }
        <View style={{ backgroundColor: '#bdc3c7', height: 1 }} />
        {
          !this.state.loading &&
          <GiftedChat
            messages={this.state.messages}
            isAnimated
            showAvatarForEveryMessage={true}
            showUserAvatar={true}
            onSend={(message) => this.chatServer.sendMessage(message)}
            text={this.state.text}
            onInputTextChanged={text => this.setText(text)}
            onLongPress={this.onLongPress.bind(this)}
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
              const id = this.getIndex(e.currentMessage);
              return (
                <View style={{
                  width: 35, height: 35, borderRadius: 35, backgroundColor: '#cdcdcd',
                  alignItems: 'center', justifyContent: 'center'
                }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 18 }}>{id}</Text>
                </View>
              );
            }}
            renderActions={() => {
              return (
                <TouchableOpacity onPress={() => { shareAnswer(); }}>
                  <Image
                    style={{ width: 34, height: 34, margin: 5 }}
                    source={require('../assets/images/Copy.png')} />
                </TouchableOpacity>
              );
            }}
          />
        }
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

const BibleQuote = (props) => {
  return (
    <View style={{ flexDirection: 'row' }}>
      <TouchableOpacity onPress={() => props.goToPassage(props.book, props.verse)}>
        <View style={styles.bibleQuote}>
          <Text style={{ color: 'white', fontSize: getCurrentUser().getLessonFontSize() - 2 }} selectable={true}>{getI18nBibleBook(props.book)}{props.verse}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA'
  },
  dayTitle: {
    marginTop: 3,
    marginHorizontal: 15,
    color: 'black',
    fontWeight: 'bold'
  },
  bibleQuote: {
    marginVertical: 2,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 11,
    backgroundColor: Colors.yellow,
  }
});
