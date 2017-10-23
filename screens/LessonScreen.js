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
import ExportAnswer from '../components/ExportAnswer.js';
import Colors from '../constants/Colors'
import SharedStyles from '../constants/SharedStyles';
import { getI18nText, getI18nBibleBook } from '../store/I18n';
import Layout from '../constants/Layout';

class LessonScreen extends React.Component {
  static route = {
    navigationBar: {
      ...SharedStyles.navigationBarStyle,
      title: (params) => {
        // TODO: clean up backend api for this to work
        const parsed = params.lesson.name.split(' ');
        return parsed[1];
      },
      renderRight: (route, props) => {
        return <ExportAnswer lessonId={route.params.lesson.id} />;
      }
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
    const scrollableStyleProps = {
      tabBarBackgroundColor: Colors.yellow,
      tabBarActiveTextColor: 'rgba(255, 255, 255, 1)',
      tabBarInactiveTextColor: 'rgba(0, 0, 0, 0.7)',
      tabBarUnderlineStyle: { backgroundColor: 'white', height: 2 },
      tabBarTextStyle: { fontSize: 20, fontWeight: '700' },
    }

    if (this.props.lesson) {
      dayQuestions = this.props.lesson.dayQuestions;

      const content = <ScrollableTabView initialPage={0} {...scrollableStyleProps}>
        {/*<NotesPage tabLabel="讲义" />*/}
        <DayQuestions tabLabel={getI18nText("一")} goToPassage={this.goToPassage} day={dayQuestions.one} readVerse={dayQuestions.one.readVerse} memoryVerse={this.props.lesson.memoryVerse} />
        <DayQuestions tabLabel={getI18nText("二")} goToPassage={this.goToPassage} day={dayQuestions.two} readVerse={dayQuestions.two.readVerse} />
        <DayQuestions tabLabel={getI18nText("三")} goToPassage={this.goToPassage} day={dayQuestions.three} readVerse={dayQuestions.three.readVerse} />
        <DayQuestions tabLabel={getI18nText("四")} goToPassage={this.goToPassage} day={dayQuestions.four} readVerse={dayQuestions.four.readVerse} />
        <DayQuestions tabLabel={getI18nText("五")} goToPassage={this.goToPassage} day={dayQuestions.five} readVerse={dayQuestions.five.readVerse} />
        <DayQuestions tabLabel={getI18nText("六")} goToPassage={this.goToPassage} day={dayQuestions.six} readVerse={dayQuestions.six.readVerse} />
      </ScrollableTabView>;

      // TODO:[Wei] KeyboardAwareScrollView works on iOS but not Android, KeyboardAvoidingView works on Android, but not iOS :(
      return (Platform.OS === 'ios') ? content : (
        <KeyboardAvoidingView style={styles.container} behavior='padding' keyboardVerticalOffset={80}>
          {content}
        </KeyboardAvoidingView >
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
    memoryVerseUI = <Text style={styles.memoryVerse} selectable={true}>{getI18nText('背诵经文：')}{props.memoryVerse}</Text>
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
      <Text style={styles.dayTitle} selectable={true}>{props.day.title}</Text>
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
    <View style={styles.row}>
      {props.question.quotes.map(quote => (
        <BibleQuote key={quote.book + quote.verse} book={quote.book} verse={quote.verse} goToPassage={props.goToPassage} />
      ))}
    </View>
    <Answer questionId={props.question.id} />
  </View>
)

const QuestionText = (props) => (
  <Text style={{ color: 'black', marginBottom: 5, fontSize: 16, }} selectable={true}>{props.children}</Text>
)

const BibleQuote = (props) => (
  <View style={{ flexDirection: 'row' }}>
    <TouchableOpacity onPress={() => props.goToPassage(props.book, props.verse)}>
      <View style={styles.bibleQuote}>
        <Text style={{ color: 'white' }} selectable={true}> {getI18nBibleBook(props.book)} {props.verse}</Text>
      </View>
    </TouchableOpacity>
  </View>
)

const NotesPage = (props) => (
  <ScrollView style={styles.dayQuestionsContainer}>
    <View style={styles.BSFQuestionContainer}>
      <View style={styles.flowRight}>
        <TextInput style={styles.locationInput} placeholder='课程地点' />
        <TouchableOpacity style={styles.button} underlayColor='#99d9f4'>
          <Text style={styles.buttonText}>签到</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.button} underlayColor='#99d9f4'>
        <Text style={styles.buttonText}>定位</Text>
      </TouchableOpacity>
      <Text style={{ marginVertical: 12, color: 'black' }}>讲道录音 - TODO by Jerry</Text>
      <Text style={{ marginVertical: 12, color: 'black' }}>经文释义</Text>
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
    backgroundColor: 'whitesmoke',
  },
  BSFQuestionContainer: {
    flex: 1,
    marginHorizontal: 15,
    marginTop: 8,
  },
  bibleQuote: {
    marginVertical: 2,
    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.yellow,
  },
  dayTitle: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  memoryVerse: {
    color: 'black',
    marginBottom: 30,
    fontSize: 16,
    fontWeight: 'bold',
  },
  flowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch'
  },
  buttonText: {
    fontSize: 18,
    color: 'white',
    alignSelf: 'center'
  },
  button: {
    height: 36,
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.yellow,
    borderColor: Colors.yellow,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    alignSelf: 'stretch',
    justifyContent: 'center'
  },
  locationInput: {
    height: 36,
    padding: 4,
    marginRight: 5,
    flex: 4,
    fontSize: 18,
    borderWidth: 1,
    borderColor: Colors.yellow,
    borderRadius: 8,
    color: Colors.yellow
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    maxWidth: Layout.window.width
  }
});
