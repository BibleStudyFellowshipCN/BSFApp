import React from 'react';
import { connect } from 'react-redux';
import { FontAwesome } from '@expo/vector-icons';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Accordion from 'react-native-collapsible/Accordion';
import { requestBooks } from "../store/books.js";
import { getI18nText } from '../store/I18n';
import { getCurrentUser } from '../store/user';
import { Models } from '../dataStorage/models';
import { pokeServer } from '../dataStorage/storage';

class HomeScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    let title = navigation.state.params && navigation.state.params.title ? navigation.state.params.title : 'BSF课程';
    return {
      title: getI18nText(title),
      headerRight: (
        <View style={{ marginRight: 20 }}>
          <TouchableOpacity onPress={() => { getCurrentUser().checkForUpdate(); }}>
            <FontAwesome name='refresh' size={28} color='#fff' />
          </TouchableOpacity>
        </View>)
    };
  };

  componentWillMount() {
    pokeServer(Models.Book, '');

    if (!this.props.booklist) {
      this.props.requestBooks();
    }
  }

  goToLesson(lesson) {
    let parsed = lesson.name.split(' ');
    this.props.navigation.navigate('Lesson', { lesson, title: parsed[1] });
  }

  render() {
    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}>
          <View style={styles.booksContainer}>
            {
              this.props.booklist &&
              <Accordion
                initiallyActiveSection={0}
                sections={this.props.booklist}
                renderHeader={this._renderHeader.bind(this)}
                renderContent={this._renderContent.bind(this)} />
            }
            {
              !this.props.booklist &&
              <Text style={{ textAlign: 'center', textAlignVertical: 'center', fontSize: 22 }}>Loading</Text>
            }
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
        <Text style={{ fontSize: getCurrentUser().getLessonFontSize() }}>
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
  contentContainer: {
  },
  booksContainer: {
  },
  bookHeader: {
    flexDirection: 'row',
    paddingVertical: 2,
    backgroundColor: '#FFECC4',
    alignItems: 'center',
    paddingLeft: 15,
    marginTop: 2,
    marginBottom: 2
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
  }
});