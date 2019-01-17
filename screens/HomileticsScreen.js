import React from 'react';
import {
  StyleSheet, Text, View, Platform, ActivityIndicator, TouchableOpacity, Dimensions, Alert, Image, Clipboard
} from 'react-native';
import { Models } from '../dataStorage/models';
import { loadAsync } from '../dataStorage/storage';
import Chat from '../store/chat';
import { Constants } from 'expo';
import { getCurrentUser } from '../store/user';
import Colors from '../constants/Colors';
import { getI18nBibleBook, getI18nText } from '../store/I18n';
import { GiftedChat, Bubble } from 'react-native-gifted-chat';
import KeyboardSpacer from 'react-native-keyboard-spacer';

function shareAnswer() { }

export default class HomileticsScreen extends React.Component {
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

  constructor(props) {
    super(props);

    shareAnswer = this.shareAnswer.bind(this);

    let id = '';
    if (props.navigation.state.params) {
      if (props.navigation.state.params.id) {
        id = 'H' + props.navigation.state.params.id
      }

      if (props.navigation.state.params.text) {
        this.questionText = props.navigation.state.params.text;
      }

      if (props.navigation.state.params.quotes) {
        this.quotes = props.navigation.state.params.quotes;
      } else {
        this.quotes = [];
      }
    }

    this.chatServer = new Chat(id, this.onNewMessage.bind(this), this.defaultUserName);
  }

  componentDidMount() {
    navigateBack = () => {
      this.props.navigation.pop();
    }

    console.log('loading messages');
    this.chatServer.loadMessages().then(() => {
      this.setState({ loading: false });
      console.log('loading messages done!');
    });
  }

  onNewMessage(message) {
    this.setState((previousState) => {
      return {
        messages: GiftedChat.append(previousState.messages, message),
      };
    });
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
      Alert.alert(getI18nText('提示'), getI18nText('您没有答这道题目'));
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

  onLongPress(context, message) {
    if (message.text) {
      let options = [getI18nText('拷贝'), getI18nText('取消')];
      let copyIndex = 0;
      let deleteIndex = -1;
      // if (this.isMyMessage(message.user._id)) {
      //   options.unshift(getI18nText('删除'));
      //   deleteIndex = 0;
      //   copyIndex = 1;
      // }
      const cancelButtonIndex = 1;
      context.actionSheet().showActionSheetWithOptions({
        options,
        cancelButtonIndex,
      },
        (buttonIndex) => {
          switch (buttonIndex) {
            case copyIndex:
              Clipboard.setString(message.text);
              break;
            // case deleteIndex:
            //   Alert.alert('TODO', 'Call server API to remove message ' + message.createdAt);
            //   break;
          }
        });
    }
  }

  render() {
    const windowWidth = Dimensions.get('window').width;
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
        {
          this.state.loading &&
          <ActivityIndicator
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
            size="large"
            color={Colors.yellow} />
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
            /*renderMessageText={(e) => {
              console.log(e.currentMessage._id);
              return (<Text>{e.currentMessage._id}</Text>);
            }}*/
            //renderAvatar={(e) => <View />}
            renderAvatar={(e) => {
              const id = e.currentMessage._id;
              console.log(JSON.stringify(id));
              return (<Text>#{id}</Text>);
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
          <Text style={{ color: 'white' }} selectable={true}>{getI18nBibleBook(props.book)}{props.verse}</Text>
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
    top: -10,
    marginHorizontal: 15,
    color: 'black',
    fontWeight: 'bold'
  },
  bibleQuote: {
    marginVertical: 2,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.yellow,
  }
});
