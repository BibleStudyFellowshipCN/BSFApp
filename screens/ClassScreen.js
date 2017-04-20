import React from 'react';
import { connect } from 'react-redux'
import {
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View, 
  KeyboardAvoidingView, 
} from 'react-native';
import ScrollableTabView from 'react-native-scrollable-tab-view'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { requestPassage } from '../store/passage.js'
import Answer from '../components/Answer'

class ClassScreen extends React.Component {
  static route = {
    navigationBar: {
      title: (route) => {
        return route.lesson.name
      },
    },
  };

  render() {
    const requestPassage = (book, verse) => {
      this.props.requestPassage(book, verse, this.props.navigator)
    }
    let content = (
      <ScrollableTabView initialPage={1}>
        <NotesPage tabLabel="讲义"/>
        <DayQuestions tabLabel="一" requestPassage={requestPassage} day={this.props.dayQuestions.one} readVerse={this.props.dayQuestions.one.readVerse} memoryVerse={this.props.memoryVerse}/>
        <DayQuestions tabLabel="二" requestPassage={requestPassage} day={this.props.dayQuestions.two} readVerse={this.props.dayQuestions.two.readVerse}/>
        <DayQuestions tabLabel="三" requestPassage={requestPassage} day={this.props.dayQuestions.three}  readVerse={this.props.dayQuestions.three.readVerse}/>
        <DayQuestions tabLabel="四" requestPassage={requestPassage} day={this.props.dayQuestions.four} readVerse={this.props.dayQuestions.four.readVerse}/>
        <DayQuestions tabLabel="五" requestPassage={requestPassage} day={this.props.dayQuestions.five} readVerse={this.props.dayQuestions.five.readVerse}/>
        <DayQuestions tabLabel="六" requestPassage={requestPassage} day={this.props.dayQuestions.six} readVerse={this.props.dayQuestions.six.readVerse}/>
      </ScrollableTabView>
    )

    // TODO:[Wei] KeyboardAwareScrollView works on iOS but not Android, KeyboardAvoidingView works on Android, but not iOS :(
    return (Platform.OS === 'ios')? (
      <KeyboardAwareScrollView contentContainerStyle={styles.container} resetScrollToCoords={{ x: 0, y: 0 }} scrollEnabled={false}>
        {content}
      </KeyboardAwareScrollView>
    ) : (
      <KeyboardAvoidingView style={styles.container} behavior='padding' keyboardVerticalOffset={80}>
        {content}
      </KeyboardAvoidingView>
    );
  }
}

const DayQuestions = (props) => {
  if (props.memoryVerse != undefined) {
    memoryVerseUI = <Text style={styles.memoryVerse}>{ props.memoryVerse }</Text>
  } else {
    memoryVerseUI = null
  }

  if (props.readVerse != undefined) {
    for (var verse in props.readVerse) {
      let quote = props.readVerse[verse]
      readVerseUI = <BibleQuote key={quote.book + quote.verse} book={quote.book} verse={quote.verse} requestPassage={props.requestPassage}  />
    } 
  } else {
    readVerseUI = null
  }

  return (
    <ScrollView style={styles.dayQuestionsContainer}>
      <View style={styles.BSFQuestionContainer}>
        { memoryVerseUI }
        <Text style={styles.dayTitle}>{ props.day.title }</Text>
        { readVerseUI }
        { props.day.questions.map(question => (
          <BSFQuestion key={question.id} question={question} requestPassage={props.requestPassage}  />
        )) }
      </View>
    </ScrollView>
  )
}

const BSFQuestion = (props) => (
  <View style={{ marginVertical: 12, }}>
    <QuestionText>
      { props.question.questionText }
    </QuestionText>
    { props.question.quotes.map(quote => (
      <BibleQuote key={quote.book + quote.verse} book={quote.book} verse={quote.verse} requestPassage={props.requestPassage}  />
    )) }
    <Answer questionId={props.question.id} />
  </View>
)

const QuestionText = (props) => (
  <Text style={{ color: 'white', marginBottom: 5, fontSize: 16, }}>{ props.children }</Text>
)

const BibleQuote = (props) => (
  <View style={{ flexDirection: 'row' }}>
    <TouchableOpacity onPress={() => props.requestPassage(props.book, props.verse)}>
      <View style={styles.bibleQuote}>
        <Text> { props.book } { props.verse }</Text>
      </View>
    </TouchableOpacity>
  </View>
)

const NotesPage = (props) => (
  <ScrollView style={styles.dayQuestionsContainer}>
    <View style={styles.BSFQuestionContainer}>
      <Text style={{marginVertical: 12, color: 'white'}}>签到 - TODO by Rui</Text>
      <Text style={{marginVertical: 12, color: 'white'}}>讲道录音 - TODO by Jerry</Text>
      <Text style={{marginVertical: 12, color: 'white'}}>经文释义</Text>
    </View>
  </ScrollView>
)

const mapStateToProps = (state) => {
  return {
    booklist: state.books.booklist,
    dayQuestions: state.class.dayQuestions,
    memoryVerse: state.class.memoryVerse,
  }
}

const mapDispatchToProps = { requestPassage }

export default connect(mapStateToProps, mapDispatchToProps)(ClassScreen)

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dayQuestionsContainer: {
    flex: 1,
    backgroundColor: 'grey',
  },
  BSFQuestionContainer: {
    flex: 1,
    marginHorizontal: 15,
    marginTop: 8,
  },
  bibleQuote: {
    marginVertical: 2,
    paddingHorizontal: 25,
    justifyContent: 'center',
    alignItems: 'center',
    height: 22,
    borderRadius: 11,
    backgroundColor: 'white',
  },
  dayTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  memoryVerse: {
    color: 'white',
    marginBottom: 30,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
