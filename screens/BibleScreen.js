import React from 'react';
import { connect } from 'react-redux'
import { WebView } from 'react-native';
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
import SharedStyles from '../constants/SharedStyles';
import { loadPassage } from '../store/passage';
import { getI18nText, getI18nBibleBook } from '../store/I18n';

class BibleScreen extends React.Component {
  static route = {
    navigationBar: {
      ...SharedStyles.navigationBarStyle,
      title: (route) => {
        return getI18nBibleBook(route.book) + route.verse
      },
    },
  };

  componentWillMount() {
    if (!this.props.passage) {
      this.props.loadPassage();
    }
  }

  render() {
    if (this.props.passage) {
      const paragraphs = this.props.passage.paragraphs;
      let html = '<head><meta name="viewport" content="width=device-width, initial-scale=1" /></head><style> body { font-size: 19;} </style> <body>';
      for (var i in paragraphs) {
        for (var j in paragraphs[i].verses) {
          const verse = paragraphs[i].verses[j];
          html += verse.verse + " " + verse.text + "<br>";
        }
      }
      html += '</body>';
      return (
        <WebView
          source={{ html }}
        />
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

const bookid = require('../assets/bookid.json');

// Build the web service url
function getId(book, verse) {
  // Parse the book name to id
  let bookId = 1;
  for (var i in bookid) {
    if (bookid[i].name == book) {
      bookId = bookid[i].id;
      break;
    }
  }
  return bookId + "/" + verse;
}

const mapStateToProps = (state, ownProps) => {
  const id = getId(ownProps.route.params.book, ownProps.route.params.verse);
  return {
    passage: state.passages[id],
  }
};

const mapDispatchToProps = (dispatch, ownProps) => {
  const id = getId(ownProps.route.params.book, ownProps.route.params.verse);
  return {
    loadPassage: () => dispatch(loadPassage(id)),
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(BibleScreen)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: 'whitesmoke',
  },
  paragraphContainer: {
    flex: 1,
    marginTop: 15,
  },
  verseText: {
    color: 'grey',
    fontSize: 18,
    lineHeight: 30,
  }
});
