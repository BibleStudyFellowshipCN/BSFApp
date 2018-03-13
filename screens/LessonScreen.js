import React from 'react';
import { connect } from 'react-redux';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Dimensions
} from 'react-native';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { loadLesson } from '../store/lessons.js'
import Answer from '../components/Answer'
import ExportAnswer from '../components/ExportAnswer.js';
import SyncAnswerToServer from '../components/SyncAnswerToServer.js';
import Colors from '../constants/Colors'
import { getI18nText, getI18nBibleBook } from '../store/I18n';
import { Models } from '../dataStorage/models';
import { pokeServer } from '../dataStorage/storage';
import { getCurrentUser } from '../store/user';

class LessonScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.state.params && navigation.state.params.title ? navigation.state.params.title : '',
      headerRight: <ExportAnswer lessonId={navigation.state.params.lesson.id} />
    };
  };

  constructor() {
    super();
    this.goToPassage = this.goToPassage.bind(this);

    // [Wei] TextInput cannot take do copy-paste on initialPage, this is a bug on Android
    // The workaround is set initialPage to -1 and navigate to page 0 when control is initialized
    this.initialPage = Platform.OS === 'ios' ? 0 : -1;
    this.intervalId = null;
  }

  componentWillMount() {
    pokeServer(Models.Lesson, this.props.navigation.state.params.lesson.id);

    if (!this.props.lesson) {
      this.props.loadLesson();
    }

    if (Platform.OS != 'ios') {
      this.goToFirstPage();
    }
  }

  componentWillUnmount() {
    if (Platform.OS != 'ios') {
      clearInterval(this.intervalId);
    }
  }

  goToFirstPage() {
    if (this.tabView) {
      clearInterval(this.intervalId);
      this.tabView.goToPage(0);
    } else {
      if (!this.intervalId) {
        this.intervalId = setInterval(() => {
          this.goToFirstPage();
        }, 0);
      }
    }
  }

  goToPassage(book, verse) {
    this.props.navigation.navigate('Bible', { book, verse, title: getI18nBibleBook(book) + verse });
  }

  render() {
    const scrollableStyleProps = {
      tabBarBackgroundColor: Colors.yellow,
      tabBarActiveTextColor: 'rgba(255, 255, 255, 1)',
      tabBarInactiveTextColor: 'rgba(0, 0, 0, 0.7)',
      tabBarUnderlineStyle: { backgroundColor: 'white', height: 2 },
      tabBarTextStyle: { fontSize: 20, fontWeight: '700' },
    }

    if (!this.props.lesson) {
      // Display loading screen
      return (
        <View style={styles.BSFQuestionContainer}>
          <Text style={{ marginVertical: 12, color: 'black' }}>Loading</Text>
        </View>
      );
    }

    const dayQuestions = this.props.lesson.dayQuestions;
    const content =
      <ScrollableTabView
        ref={ref => this.tabView = ref}
        {...scrollableStyleProps} initialPage={this.initialPage}>
        <DayQuestions tabLabel={getI18nText("一")} goToPassage={this.goToPassage} day={dayQuestions.one} memoryVerse={this.props.lesson.memoryVerse} />
        <DayQuestions tabLabel={getI18nText("二")} goToPassage={this.goToPassage} day={dayQuestions.two} />
        <DayQuestions tabLabel={getI18nText("三")} goToPassage={this.goToPassage} day={dayQuestions.three} />
        <DayQuestions tabLabel={getI18nText("四")} goToPassage={this.goToPassage} day={dayQuestions.four} />
        <DayQuestions tabLabel={getI18nText("五")} goToPassage={this.goToPassage} day={dayQuestions.five} />
        <DayQuestions tabLabel={getI18nText("六")} goToPassage={this.goToPassage} day={dayQuestions.six} />
      </ScrollableTabView>

    // TODO:[Wei] KeyboardAwareScrollView works on iOS but not Android, KeyboardAvoidingView works on Android, but not iOS :(
    return (Platform.OS === 'ios') ? content : (
      <KeyboardAvoidingView style={styles.container} behavior='padding' keyboardVerticalOffset={80}>
        {content}
      </KeyboardAvoidingView >
    );
  }
}

const DayQuestions = (props) => {
  const content = (
    <View style={styles.BSFQuestionContainer}>
      {
        props.memoryVerse &&
        <Text style={[styles.memoryVerse, { fontSize: getCurrentUser().getLessonFontSize() }]} selectable={true}>{getI18nText('背诵经文：')}{props.memoryVerse}</Text>
      }
      <Text style={[styles.dayTitle, { fontSize: getCurrentUser().getLessonFontSize() }]} selectable={true}>{props.day.title}</Text>
      {
        props.day.readVerse &&
        props.day.readVerse.map((quote) => (
          <BibleQuote key={quote.book + quote.verse} book={quote.book} verse={quote.verse} goToPassage={props.goToPassage} />
        ))
      }
      {
        props.day.questions &&
        props.day.questions.map((question) => (
          <BSFQuestion
            key={question.id}
            question={question}
            goToPassage={props.goToPassage}
          />
        ))
      }
      {
        <SyncAnswerToServer lessonDay={props.day} />
      }
    </View>
  );

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
    <View style={{
      flexDirection: 'row',
      flexWrap: 'wrap',
      maxWidth: Dimensions.get('window').width - 10
    }}>
      {props.question.quotes.map(quote => (
        <BibleQuote key={quote.book + quote.verse} book={quote.book} verse={quote.verse} goToPassage={props.goToPassage} />
      ))}
    </View>
    <Answer questionId={props.question.id} />
  </View>
)

const QuestionText = (props) => (
  <Text style={{ color: 'black', marginBottom: 5, fontSize: getCurrentUser().getLessonFontSize() }} selectable={true}>{props.children}</Text>
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

const mapStateToProps = (state, ownProps) => {
  return {
    lesson: state.lessons[ownProps.navigation.state.params.lesson.id],
  }
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    loadLesson: () => dispatch(loadLesson(ownProps.navigation.state.params.lesson.id)),
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
    fontWeight: 'bold',
  },
  memoryVerse: {
    color: 'black',
    marginBottom: 30,
    fontWeight: 'bold',
  }
});