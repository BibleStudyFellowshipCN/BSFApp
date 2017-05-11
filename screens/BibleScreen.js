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

import { loadPassage } from '../store/passage';

class BibleScreen extends React.Component {
  static route = {
    navigationBar: {
      title: (route) => {
        return route.book + route.verse
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
      return (
        <View style={styles.container}>
          <ScrollView>
            {paragraphs.map(paragraph => (
              <Paragraph key={paragraph.id} paragraph={paragraph} />
            ))}
          </ScrollView>
        </View>
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

const Paragraph = (props) => (
  <View style={styles.paragraphContainer}>
    {props.paragraph.title ? <Text style={styles.verseText}> {props.paragraph.title} </Text> : null}
    <Text>
      {props.paragraph.verses.map(verse => (
        <Verse key={verse.verse} verse={verse} />
      ))}
    </Text>
  </View>
)

const Verse = (props) => (
  <Text style={[styles.verseText, { color: 'black' }]}>
    {props.verse.verse} {props.verse.text}
  </Text>
)

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
