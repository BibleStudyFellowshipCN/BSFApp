
import React from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  KeyboardAvoidingView,
  Dimensions
} from 'react-native';
import { getI18nText, getI18nBibleBook } from '../store/I18n';
import { Button } from 'react-native-elements';
import { getCurrentUser } from '../store/user';
import { loadFromCacheAsync } from '../dataStorage/storage';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Answer from '../components/Answer'
import Colors from '../constants/Colors'

export default class HomeDiscussionScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: getI18nText('家庭查经讨论')
    };
  };

  state = {
    loading: true,
    data: null
  }

  componentWillMount() {
    loadFromCacheAsync('homeDiscussion', this.props.navigation.state.params.id).then((data) => {
      this.setState({ loading: false, data });
    });

    goToPassage = this.goToPassage.bind(this);
  }

  goToPassage(book, verse) {
    this.props.navigation.navigate('Bible', { book, verse, title: getI18nBibleBook(book) + verse });
  }

  render() {
    if (this.state.loading) {
      return (
        <View style={styles.container}>
          <ActivityIndicator
            size="large"
            color={Colors.yellow} />
        </View>
      );
    }

    const scrollableStyleProps = {
      tabBarBackgroundColor: Colors.yellow,
      tabBarActiveTextColor: 'rgba(255, 255, 255, 1)',
      tabBarInactiveTextColor: 'rgba(0, 0, 0, 0.7)',
      tabBarUnderlineStyle: { backgroundColor: 'white', height: 2 },
      tabBarTextStyle: { fontSize: 20, fontWeight: '700' },
    }
    const dayQuestions = this.state.data.dayQuestions;
    const content =
      <ScrollableTabView
        ref={ref => this.tabView = ref}
        {...scrollableStyleProps} initialPage={this.initialPage}>
        <DayQuestions tabLabel={getI18nText("一")} day={dayQuestions.one} title={this.state.data.title} />
        <DayQuestions tabLabel={getI18nText("二")} day={dayQuestions.two} />
        <DayQuestions tabLabel={getI18nText("三")} day={dayQuestions.three} />
        <DayQuestions tabLabel={getI18nText("四")} day={dayQuestions.four} />
        <DayQuestions tabLabel={getI18nText("五")} day={dayQuestions.five} />
        <DayQuestions tabLabel={getI18nText("六")} day={dayQuestions.six} />
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
  let keyIndex = 0;
  const content = (
    <View style={styles.BSFQuestionContainer}>
      {
        props.title &&
        <Text style={[styles.dayTitle, { fontSize: getCurrentUser().getLessonFontSize() + 2, fontWeight: 'bold', marginVertical: 7 }]} selectable={true}>{props.title}</Text>
      }
      {
        props.day.mainTruth &&
        <Text style={[styles.dayTitle, { fontSize: getCurrentUser().getLessonFontSize(), marginVertical: 3 }]} selectable={true}>
          <Text>{getI18nText('基本真理：')}</Text>
          <Text>{props.day.mainTruth}</Text>
        </Text>
      }
      {
        props.day.principles &&
        <View style={{ marginVertical: 5 }}>
          <Text style={[styles.dayTitle, { fontSize: getCurrentUser().getLessonFontSize(), marginVertical: 3 }]} selectable={true}>{getI18nText('属灵原则：')}</Text>
          {
            props.day.principles.map((principle) => (
              <Text key={keyIndex++} style={[styles.dayTitle, { fontSize: getCurrentUser().getLessonFontSize(), fontWeight: 'normal' }]} selectable={true}>
                <Text> ●  </Text>
                <Text>{principle}</Text>
              </Text>
            ))
          }
        </View>
      }
      {
        (props.title || props.day.mainTruth || props.day.principles) &&
        <View style={{ marginTop: 7 }} />
      }
      <Text style={[styles.dayTitle, { fontSize: getCurrentUser().getLessonFontSize() }]} selectable={true}>{props.day.title}</Text>
      {
        props.day.description &&
        <Text style={[styles.dayTitle, { fontSize: getCurrentUser().getLessonFontSize(), fontWeight: 'normal', fontStyle: 'italic' }]} selectable={true}>{props.day.description}</Text>
      }
      {
        props.day.readVerse &&
        props.day.readVerse.map((quote) => (
          <BibleQuote key={quote.book + quote.verse} book={quote.book} verse={quote.verse} />
        ))
      }
      {
        props.day.questions &&
        props.day.questions.map((question) => (
          <BSFQuestion
            key={question.id}
            question={question}
          />
        ))
      }
    </View >
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
      {props.question.text}
    </QuestionText>
    <Answer questionId={props.question.id} />
  </View >
)

const QuestionText = (props) => (
  <Text style={{ color: 'black', marginBottom: 5, fontSize: getCurrentUser().getLessonFontSize() }} selectable={true}>{props.children}</Text>
)

const BibleQuote = (props) => (
  <View style={{ flexDirection: 'row' }}>
    <TouchableOpacity onPress={() => goToPassage(props.book, props.verse)}>
      <View style={styles.bibleQuote}>
        <Text style={{ color: 'white' }} selectable={true}> {getI18nBibleBook(props.book)} {props.verse}</Text>
      </View>
    </TouchableOpacity>
  </View>
)

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
  }
});