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
} from 'react-native';
import ScrollableTabView from 'react-native-scrollable-tab-view'

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
    return (
      <View style={styles.container}>
        <ScrollableTabView>
          <DayQuestions tabLabel="一" requestPassage={requestPassage} day={this.props.dayQuestions.one} />
          <DayQuestions tabLabel="二" requestPassage={requestPassage} day={this.props.dayQuestions.two} />
          <DayQuestions tabLabel="三" requestPassage={requestPassage} day={this.props.dayQuestions.three} />
          <DayQuestions tabLabel="四" requestPassage={requestPassage} day={this.props.dayQuestions.four}/>
          <DayQuestions tabLabel="五" requestPassage={requestPassage} day={this.props.dayQuestions.five}/>
          <DayQuestions tabLabel="六" requestPassage={requestPassage} day={this.props.dayQuestions.six}/>
          <DayQuestions tabLabel="七" requestPassage={requestPassage} day={this.props.dayQuestions.seven}/>
        </ScrollableTabView>
      </View>
    );
  }
}

const DayQuestions = (props) => (
  <ScrollView style={styles.dayQuestionsContainer}>
    { props.day.questions.map(question => (
      <BSFQuestion key={question.id} question={question} requestPassage={props.requestPassage}  />
    )) }
  </ScrollView>
)

const BSFQuestion = (props) => (
  <View style={styles.BSFQuestionContainer}>
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
  <Text style={{ color: 'white', marginBottom: 5, }}>{ props.children }</Text>
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

const mapStateToProps = (state) => {
  return {
    booklist: state.books.booklist,
    dayQuestions: state.class.dayQuestions,
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
    padding: 15,
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
});
