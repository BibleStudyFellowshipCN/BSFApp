import React from 'react';
import { connect } from 'react-redux'
import { FontAwesome } from '@expo/vector-icons';
import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import Accordion from 'react-native-collapsible/Accordion';
import { MonoText } from '../components/StyledText';
import Colors from '../constants/Colors'
import { requestBooks } from "../store/books.js";
import { getI18nText, getI18nBibleBook } from '../store/I18n';

class HomeScreen extends React.Component {
  static route = {
    navigationBar: {
      title(params) {
        return getI18nText('BSF课程');
      }
    }
  };

  componentDidUpdate() {
    this.props.navigator.updateCurrentRouteParams({ title: getI18nText('BSF课程') });
  }

  componentDidMount() {
    this.props.requestBooks();
  }

  goToLesson(lesson) {
    this.props.navigation.getNavigator('root').push('lesson', { lesson });
  }

  render() {
    mainUI = null
    if (this.props.booklist != undefined) {
      mainUI = <Accordion
        initiallyActiveSection={0}
        sections={this.props.booklist}
        renderHeader={this._renderHeader.bind(this)}
        renderContent={this._renderContent.bind(this)} />
    }
    else {
      mainUI = <Text style={{ textAlign: 'center', textAlignVertical: 'center', fontSize: 22 }}>正在加载</Text>
    }

    return (
      <View style={styles.container}>
        {
          Platform.OS == 'ios' &&
          <Text style={{ color: 'red', fontSize: 16, fontWeight: 'bold', margin: 5 }}>11/13 Notice: After the recent app update, you'll not see your notes, please do not uninstall the app (your data is not lost), we're working on a fix to bring your notes back</Text>
        }
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}>
          <View style={styles.booksContainer}>
            {mainUI}
          </View>
        </ScrollView>
      </View>
    )
  }

  _renderHeader(content, index, isActive) {
    // TODO: clean up backend api for this to work
    const parsed = content.title.indexOf('2');
    const book = content.title.substring(0, parsed);
    const year = content.title.substring(parsed);
    return (
      <View style={styles.bookHeader} >
        <FontAwesome
          name={isActive ? 'minus' : 'plus'}
          size={18}
        />
        <Text style={styles.bookHeaderText}>    {book} ({year})</Text>
      </View>
    )
  }

  _renderContent(content, index, isActive) {
    return (
      <View>
        {content.lessons.map(lesson => (
          <Lesson
            key={lesson.id}
            goToLesson={() => this.goToLesson(lesson)}
            lesson={lesson}
          />))}
      </View>
    )
  }
}

const Lesson = (props) => {
  // TODO: clean up backend api for this to work
  const parsed = props.lesson.name.split(' ')
  const lessonNumber = parsed[0]
  const name = parsed[1]
  const date = parsed[2]
  return (
    <TouchableOpacity style={styles.lessonContainer} onPress={() => props.goToLesson()}>
      <View>
        <View style={styles.lessonMetadata}>
          <Text style={styles.lessonMetadataText}>
            {date} {lessonNumber}
          </Text>
        </View>
        <Text style={styles.lessonText}>
          {name}
        </Text>
      </View>
      <View style={styles.lessonChevron}>
        <FontAwesome
          name='chevron-right'
          color='grey'
          size={16}
        />
      </View>
    </TouchableOpacity>
  )
}

const mapStateToProps = (state) => {
  return {
    booklist: state.books.booklist,
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    requestBooks: () => dispatch(requestBooks())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'whitesmoke',
  },
  developmentModeText: {
    marginBottom: 20,
    color: 'rgba(0,0,0,0.4)',
    fontSize: 15,
    textAlign: 'center',
  },
  contentContainer: {
  },
  booksContainer: {
  },
  bookHeader: {
    flexDirection: 'row',
    paddingVertical: 2,
    backgroundColor: '#FFECC4',
    alignItems: 'center',
    height: 60,
    paddingLeft: 15,
    marginTop: 2,
    marginBottom: 2
  },
  bookHeaderIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookHeaderText: {
    fontSize: 20,
    marginVertical: 6,
    fontWeight: '400',
  },

  lessonContainer: {
    paddingLeft: 25,
    paddingVertical: 5,
    backgroundColor: 'white',
    height: 60,
  },
  lessonChevron: {
    position: 'absolute',
    right: 15,
    top: 25,
  },
  lessonMetadata: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  lessonMetadataText: {
    color: 'grey',
  },
  lessonText: {
    fontSize: 18,
  },
});
