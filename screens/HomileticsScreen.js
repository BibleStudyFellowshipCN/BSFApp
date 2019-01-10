import React from 'react';
import {
  StyleSheet, Text, View, Platform, ScrollView, TouchableOpacity, Dimensions, TextInput,
  KeyboardAvoidingView
} from 'react-native';
import { Models } from '../dataStorage/models';
import { loadAsync } from '../dataStorage/storage';
import Chat from '../store/chat';
import { Constants } from 'expo';
import { getCurrentUser } from '../store/user';
import Colors from '../constants/Colors';
import { getI18nText, getI18nBibleBook } from '../store/I18n';
import { Button } from 'react-native-elements';

export default class HomileticsScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.state.params.title
    };
  };

  state = {
    loading: true,
    messages: [],
    width: Dimensions.get('window').width,
    height: 0
  }

  contentSize = null;

  constructor(props) {
    super(props);

    let id = '';
    if (props.navigation.state.params) {
      if (props.navigation.state.params.id) {
        id = props.navigation.state.params.id
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

  componentWillMount() {
  }

  componentDidMount() {
    console.log('loading messages');
    this.chatServer.loadMessages().then(() => {
      this.setState({ loading: false });
      console.log('loading messages done!');
    });
  }

  onContentSizeChange(e) {
    const contentSize = e.nativeEvent.contentSize;

    // Support earlier versions of React Native on Android.
    if (!contentSize) return;

    if (!this.contentSize || this.contentSize.height !== contentSize.height) {
      this.contentSize = contentSize;
      this.setState({ height: this.contentSize.height + 14 });
    }
  }

  onLayout(e) {
    this.setState({ width: Dimensions.get('window').width });
  }

  onNewMessage(message) {
    console.log("New message: " + JSON.stringify(message));
    let messages = this.state.messages;
    messages.push(message);
    this.setState({ messages });
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

  goToPassage(book, verse) {
    this.props.navigation.navigate('Bible', { book, verse, title: getI18nBibleBook(book) + verse });
  }

  onSubmit() {

  }

  isMyMessage(id) {
    return id === `${Platform.OS} ${Constants['deviceId']}`;
  }

  render() {
    const height = Math.min(Math.max(30, this.state.height), Dimensions.get('window').height / 4);
    const windowWidth = Dimensions.get('window').width;
    let keyIndex = 0;
    console.log(this.state.messages);
    return (
      <KeyboardAvoidingView style={styles.container} behavior='padding' keyboardVerticalOffset={80}>
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
        <ScrollView style={{ flex: 1, marginVertical: 7 }}>
          <View style={{ marginHorizontal: 7, backgroundColor: '#FAFAFA' }}>
            {
              this.state.messages.map((msg) =>
                this.isMyMessage(msg.user._id) ? <View key={keyIndex++} style={{
                  marginLeft: windowWidth / 5,
                  marginBottom: 7,
                  padding: 10,
                  backgroundColor: '#2979FF',
                  borderRadius: 20
                }}>
                  <Text key={keyIndex++} style={{ color: 'white' }}>{msg.text}</Text>
                  <Text key={keyIndex++} style={{ color: 'white' }}>{msg.createdAt.toLocaleString()}</Text>
                </View>
                  :
                  <View key={keyIndex++} style={{
                    marginLeft: 7,
                    marginRight: windowWidth / 5,
                    marginBottom: 7,
                    padding: 10,
                    backgroundColor: '#EEEEEE',
                    borderRadius: 20
                  }}>
                    <Text key={keyIndex++}>{msg.text}</Text>
                    <Text key={keyIndex++}>{msg.createdAt.toLocaleString()}</Text>
                  </View>
              )
            }
          </View>
        </ScrollView>

        <View style={{ flexDirection: 'row', marginVertical: 2 }}>
          <View style={{ width: 120 }}>
            <Button
              style={{ flex: 1 }}
              disabled={this.state.busy}
              backgroundColor={Colors.yellow}
              borderRadius={5}
              title={getI18nText('分享答案')}
              onPress={this.onSubmit.bind(this)} />
          </View>
          <View style={[styles.answerContainer, { height, width: this.state.width - 190 }]} onLayout={this.onLayout.bind(this)}>
            <TextInput
              ref={ref => this.answer = ref}
              style={[styles.answerInput, { fontSize: getCurrentUser().getLessonFontSize() }]}
              onChange={(e) => this.onContentSizeChange(e)}
              onContentSizeChange={(e) => this.onContentSizeChange(e)}
              onChangeText={(text) => {
              }}
            />
          </View>
        </View>
      </KeyboardAvoidingView >
    );
  }
}

let lastBibleQuote;
const BibleQuote = (props) => {
  const repeat = lastBibleQuote === props.book;
  lastBibleQuote = props.book;
  return (
    <View style={{ flexDirection: 'row' }}>
      <TouchableOpacity onPress={() => props.goToPassage(props.book, props.verse)}>
        <View style={styles.bibleQuote}>
          <Text style={{ color: 'white' }} selectable={true}>{repeat ? '' : getI18nBibleBook(props.book)}{props.verse}</Text>
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
    marginTop: -15,
    marginHorizontal: 15,
    color: 'black',
    fontWeight: 'bold',
  },
  bibleQuote: {
    marginVertical: 2,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.yellow,
  },
  answerContainer: {
    flex: 1,
    marginTop: 5,
    padding: 5,
    backgroundColor: 'whitesmoke',
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 5,
    marginHorizontal: 10
  },
  answerInput: {
    flex: 1,
    textAlignVertical: 'top'
  }
});