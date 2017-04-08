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

class ClassScreen extends React.Component {
  static route = {
    navigationBar: {
      title: (route) => {
        return route.lesson.name
      },
    },
  };

  render() {
    return (
      <View style={styles.container}>
        <ScrollableTabView>
          <DayQuestions tabLabel="一"/>
          <DayQuestions tabLabel="二"/>
          <DayQuestions tabLabel="三"/>
          <DayQuestions tabLabel="四"/>
          <DayQuestions tabLabel="五"/>
          <DayQuestions tabLabel="六"/>
          <DayQuestions tabLabel="七"/>
        </ScrollableTabView>
      </View>
    );
  }
}

const DayQuestions = (props) => (
  <ScrollView style={styles.dayQuestionsContainer}>
    <BSFQuestion />
    <BSFQuestion />
    <BSFQuestion />
    <BSFQuestion />
    <BSFQuestion />
  </ScrollView>
)

const BSFQuestion = (props) => (
  <View style={styles.BSFQuestionContainer}>
    <QuestionText>
      7.这个神迹如何指出耶稣为灵 里饥饿的人所做的事？请将他 行神迹的步骤逐一列出。你可 以怎样依循这些步骤来给别人 生命的粮－－耶稣？ 参阅经文：
    </QuestionText>
    <BibleQuote book='马可福音' verse='6:34-44' />
    <BibleQuote book='马可福音' verse='8:24-28' />
    <Answer />
  </View>
)

const QuestionText = (props) => (
  <Text style={{ color: 'white', marginBottom: 5, }}>{ props.children }</Text>
)

const BibleQuote = (props) => (
  <View style={{ flexDirection: 'row' }}>
    <TouchableOpacity>
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

const mapDispatchToProps = { }

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
