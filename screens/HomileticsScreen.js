import React from 'react';
import {
  StyleSheet, Text, View, Platform, ActivityIndicator, TouchableOpacity, Dimensions, Alert
} from 'react-native';
import { Models } from '../dataStorage/models';
import { loadAsync } from '../dataStorage/storage';
import Chat from '../store/chat';
import { Constants } from 'expo';
import { getCurrentUser } from '../store/user';
import Colors from '../constants/Colors';
import { getI18nBibleBook } from '../store/I18n';
import { GiftedChat } from 'react-native-gifted-chat';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import { FontAwesome } from '@expo/vector-icons';

function shareAnswer() { }

export default class HomileticsScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.state.params.title,
      headerRight:
        <View style={{ marginRight: 7 }}>
          <TouchableOpacity onPress={() => { shareAnswer(); }}>
            <FontAwesome color='#fff' size={28} name='send' />
          </TouchableOpacity>
        </View>
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
        _id: Platform.OS + ' ' + Constants['deviceId'],
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
      Alert.alert('Information', 'No answer entered yet');
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
        {
          !this.state.loading &&
          <GiftedChat
            messages={this.state.messages}
            isAnimated={true}
            onSend={(message) => this.chatServer.sendMessage(message)}
            text={this.state.text}
            onInputTextChanged={text => this.setText(text)}
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
    marginTop: -14,
    backgroundColor: '#FAFAFA'
  },
  dayTitle: {
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