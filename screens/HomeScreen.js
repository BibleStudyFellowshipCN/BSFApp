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
  AsyncStorage,
  Alert
} from 'react-native';
import Accordion from 'react-native-collapsible/Accordion';
import { MonoText } from '../components/StyledText';
import Colors from '../constants/Colors'
import { requestBooks } from "../store/books.js";
import { getI18nText, getI18nBibleBook } from '../store/I18n';
import { RkButton } from 'react-native-ui-kitten';
import { LegacyAsyncStorage } from 'expo';

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

  async migrate() {
    const keys = [];
    await LegacyAsyncStorage.getAllKeys((err, keys) => {
      LegacyAsyncStorage.multiGet(keys, (err, stores) => {
        stores.map((result, i, store) => {
          // get at each store's key/value so you can work with it
          let key = store[i][0];
          let value = store[i][1];
          console.log("[OLD]" + key + ":" + value);

          AsyncStorage.getItem(key, (err, newData) => {
            if (err || !newData) {
              newData = "{}";
            }
            console.log("[NEW]" + key + ":" + newData);
            AsyncStorage.setItem(key, value, () => {
              AsyncStorage.mergeItem(key, newData, () => {
                AsyncStorage.getItem(key, (err, result) => {
                  console.log("[MERGED]" + key + ":" + result);
                  keys.push(key);
                });
              });
            });
          });
        });

        Alert.alert("Complete", "Please check your notes, if not working, please send us feedback");
      });
    });
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
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}>
          <View style={styles.booksContainer}>
            {
              Platform.OS == 'ios' &&
              <View>
                <Text style={{ color: 'red', fontSize: 16, fontWeight: 'bold', margin: 5 }}>11/13 Notice: After the recent app update, you'll not see your notes, please do not uninstall the app (your data is not lost), we're working on a fix to bring your notes back</Text>
                <View style={{ flexDirection: 'row' }}>
                  <RkButton onPress={this.migrate.bind(this)}>Try fix1</RkButton>
                </View>
              </View>
            }
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
