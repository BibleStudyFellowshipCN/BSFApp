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
import { loadLesson } from '../store/lessons.js'
import Answer from '../components/Answer'

class LessonScreen extends React.Component {
  static route = {
    navigationBar: {
      title: (params) => {
        return params.lesson.name
      },
    },
  };

  constructor() {
    super();
    this.goToPassage = this.goToPassage.bind(this);
  }

  componentWillMount() {
    if (!this.props.lesson) {
      this.props.loadLesson();
    }
  }

  goToPassage(book, verse) {
    this.props.navigator.push('bible', { book, verse });
  }

  render() {
    if (this.props.lesson) {
      dayQuestions = this.props.lesson.dayQuestions;
      // TODO:[Wei] KeyboardAwareScrollView works on iOS but not Android, KeyboardAvoidingView works on Android, but not iOS :(
      return (Platform.OS === 'ios') ? (
        <ScrollableTabView initialPage={1}>
          <NotesPage tabLabel="讲义" />
          <DayQuestions tabLabel="一" goToPassage={this.goToPassage} day={dayQuestions.one} readVerse={dayQuestions.one.readVerse} memoryVerse={this.props.memoryVerse} />
          <DayQuestions tabLabel="二" goToPassage={this.goToPassage} day={dayQuestions.two} readVerse={dayQuestions.two.readVerse} />
          <DayQuestions tabLabel="三" goToPassage={this.goToPassage} day={dayQuestions.three} readVerse={dayQuestions.three.readVerse} />
          <DayQuestions tabLabel="四" goToPassage={this.goToPassage} day={dayQuestions.four} readVerse={dayQuestions.four.readVerse} />
          <DayQuestions tabLabel="五" goToPassage={this.goToPassage} day={dayQuestions.five} readVerse={dayQuestions.five.readVerse} />
          <DayQuestions tabLabel="六" goToPassage={this.goToPassage} day={dayQuestions.six} readVerse={dayQuestions.six.readVerse} />
        </ScrollableTabView>
      ) : (
          <KeyboardAvoidingView style={styles.container} behavior='padding' keyboardVerticalOffset={80}>
            <ScrollableTabView initialPage={1}>
              <NotesPage tabLabel="讲义" />
              <DayQuestions tabLabel="一" goToPassage={this.goToPassage} day={dayQuestions.one} readVerse={dayQuestions.one.readVerse} memoryVerse={this.props.memoryVerse} />
              <DayQuestions tabLabel="二" goToPassage={this.goToPassage} day={dayQuestions.two} readVerse={dayQuestions.two.readVerse} />
              <DayQuestions tabLabel="三" goToPassage={this.goToPassage} day={dayQuestions.three} readVerse={dayQuestions.three.readVerse} />
              <DayQuestions tabLabel="四" goToPassage={this.goToPassage} day={dayQuestions.four} readVerse={dayQuestions.four.readVerse} />
              <DayQuestions tabLabel="五" goToPassage={this.goToPassage} day={dayQuestions.five} readVerse={dayQuestions.five.readVerse} />
              <DayQuestions tabLabel="六" goToPassage={this.goToPassage} day={dayQuestions.six} readVerse={dayQuestions.six.readVerse} />
            </ScrollableTabView>
          </KeyboardAvoidingView>
        );
    } else {
      // Display loading screen
      return (
        <View style={styles.BSFQuestionContainer}>
          <Text style={{ marginVertical: 12, color: 'black' }}>Loading</Text>
        </View>
      )
    }
  }
}

// Scroll a component into view. Just pass the component ref string.
function inputFocused(refName) {
  setTimeout(() => {
    let scrollResponder = this.refs.scrollView.getScrollResponder();
    scrollResponder.scrollResponderScrollNativeHandleToKeyboard(
      React.findNodeHandle(this.refs[refName]),
      110, //additionalOffset
      true
    );
  }, 50);
}

const DayQuestions = (props) => {
  if (props.memoryVerse != undefined) {
    memoryVerseUI = <Text style={styles.memoryVerse}>{props.memoryVerse}</Text>
  } else {
    memoryVerseUI = null
  }

  if (props.readVerse != undefined) {
    for (var verse in props.readVerse) {
      let quote = props.readVerse[verse]
      readVerseUI = <BibleQuote key={quote.book + quote.verse} book={quote.book} verse={quote.verse} goToPassage={props.goToPassage} />
    }
  } else {
    readVerseUI = null
  }

  const content = (
    <View style={styles.BSFQuestionContainer}>
      {memoryVerseUI}
      <Text style={styles.dayTitle}>{props.day.title}</Text>
      {readVerseUI}
      {props.day.questions.map((question, index) => (
        <BSFQuestion
          key={question.id}
          question={question}
          goToPassage={props.goToPassage}
        />
      ))}
    </View>
  );

  // TODO: Need verify if this new KeyboardAwareScrollView position can work on Android
  return (Platform.OS === 'ios') ? (
    <KeyboardAwareScrollView style={styles.dayQuestionsContainer} extraScrollHeight={80}>
      {content}
    </KeyboardAwareScrollView>
  ) : (
      <ScrollView style={styles.dayQuestionsContainer}>
        {content}
      </ScrollView>
    );
}

const BSFQuestion = (props) => (
  <View style={{ marginVertical: 12, }}>
    <QuestionText>
      {props.question.questionText}
    </QuestionText>
    {props.question.quotes.map(quote => (
      <BibleQuote key={quote.book + quote.verse} book={quote.book} verse={quote.verse} goToPassage={props.goToPassage} />
    ))}
    <Answer questionId={props.question.id} />
  </View>
)

const QuestionText = (props) => (
  <Text style={{ color: 'white', marginBottom: 5, fontSize: 16, }}>{props.children}</Text>
)

const BibleQuote = (props) => (
  <View style={{ flexDirection: 'row' }}>
    <TouchableOpacity onPress={() => props.goToPassage(props.book, props.verse)}>
      <View style={styles.bibleQuote}>
        <Text> {props.book} {props.verse}</Text>
      </View>
    </TouchableOpacity>
  </View>
)

const NotesPage = (props) => (
  <ScrollView style={styles.dayQuestionsContainer}>
    <View style={styles.BSFQuestionContainer}>
      <Text style={{ marginVertical: 12, color: 'white' }}>签到 - TODO by Rui</Text>
      <Text style={{ marginVertical: 12, color: 'white' }}>讲道录音 - TODO by Jerry</Text>
      <Text style={{ marginVertical: 12, color: 'white' }}>经文释义</Text>
    </View>
  </ScrollView>
)

const mapStateToProps = (state, ownProps) => {
  return {
    lesson: state.lessons[ownProps.route.params.lesson.id],
  }
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    loadLesson: () => dispatch(loadLesson(ownProps.route.params.lesson.id)),
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(LessonScreen)

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
