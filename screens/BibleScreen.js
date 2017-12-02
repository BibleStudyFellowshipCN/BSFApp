import React from 'react';
import { connect } from 'react-redux';
import { WebView } from 'react-native';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { loadPassage } from '../store/passage';
import { pokeServer } from '../dataStorage/storage';
import { Models } from '../dataStorage/models';

const bookid = require('../assets/json/bookid.json');

class BibleScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.state.params && navigation.state.params.title ? navigation.state.params.title : 'Bible'
    };
  };

  componentWillMount() {
    const id = getId(this.props.navigation.state.params.book, this.props.navigation.state.params.verse);
    pokeServer(Models.Passage, id);
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
  const id = getId(ownProps.navigation.state.params.book, ownProps.navigation.state.params.verse);
  return {
    passage: state.passages[id],
  }
};

const mapDispatchToProps = (dispatch, ownProps) => {
  const id = getId(ownProps.navigation.state.params.book, ownProps.navigation.state.params.verse);
  return {
    loadPassage: () => dispatch(loadPassage(id)),
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(BibleScreen)

const styles = StyleSheet.create({
});