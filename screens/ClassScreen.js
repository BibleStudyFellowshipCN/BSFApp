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
          <DayQuestions tabLabel="一" requestPassage={requestPassage} />
          <DayQuestions tabLabel="二" requestPassage={requestPassage} />
          <DayQuestions tabLabel="三" requestPassage={requestPassage} />
          <DayQuestions tabLabel="四" requestPassage={requestPassage} />
          <DayQuestions tabLabel="五" requestPassage={requestPassage} />
          <DayQuestions tabLabel="六" requestPassage={requestPassage} />
          <DayQuestions tabLabel="七" requestPassage={requestPassage} />
        </ScrollableTabView>
      </View>
    );
  }
}

const DayQuestions = (props) => (
  <ScrollView style={styles.dayQuestionsContainer}>
    <BSFQuestion requestPassage={props.requestPassage}  />
    <BSFQuestion requestPassage={props.requestPassage}  />
    <BSFQuestion requestPassage={props.requestPassage}  />
    <BSFQuestion requestPassage={props.requestPassage}  />
    <BSFQuestion requestPassage={props.requestPassage}  />
  </ScrollView>
)

const BSFQuestion = (props) => (
  <View style={styles.BSFQuestionContainer}>
    <QuestionText>
      7.这个神迹如何指出耶稣为灵 里饥饿的人所做的事？请将他 行神迹的步骤逐一列出。你可 以怎样依循这些步骤来给别人 生命的粮－－耶稣？ 参阅经文：
    </QuestionText>
    <BibleQuote book='马可福音' verse='6:34-44' requestPassage={props.requestPassage}  />
    <BibleQuote book='马可福音' verse='8:24-28' requestPassage={props.requestPassage} />
    <Answer />
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

const Answer = (props) => (
  <View style={styles.answerContainer}>
    <TextInput
      style={styles.answerInput}
      blurOnSubmit={false}
      multiline
    />
  </View>
)


const mapStateToProps = (state) => {
  return {
    booklist: state.books.booklist,
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
  answerContainer: {
    marginTop: 5,
    height: 90,
    borderRadius: 5,
    padding: 5,
    backgroundColor: 'whitesmoke',
  },
  answerInput: {
    flex: 1,
  }
});
