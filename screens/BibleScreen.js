import React from 'react';
import { connect } from 'react-redux';
import { WebView } from 'react-native';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity
} from 'react-native';
import { loadPassage } from '../store/passage';
import { pokeServer } from '../dataStorage/storage';
import { Models } from '../dataStorage/models';
import { Octicons } from '@expo/vector-icons';
import { connectActionSheet } from '@expo/react-native-action-sheet';
import { clearPassage } from '../store/passage.js'
import { getCurrentUser } from '../store/user';

const bookid = require('../assets/json/bookid.json');

function onBibleVerse() { }

@connectActionSheet class BibleScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.state.params && navigation.state.params.title ? navigation.state.params.title : 'Bible',
      headerRight: (
        <View style={{ marginRight: 20 }}>
          <TouchableOpacity onPress={() => onBibleVerse()}>
            <Octicons name='book' size={28} color='#fff' />
          </TouchableOpacity>
        </View>)
    };
  };

  componentWillMount() {
    onBibleVerse = this.onBibleVerse.bind(this);
    const id = getId(this.props.navigation.state.params.book, this.props.navigation.state.params.verse);
    pokeServer(Models.Passage, id);
    if (!this.props.passage) {
      this.props.loadPassage();
    }
  }

  onBibleVerse() {
    let options = [];
    for (var i in Models.BibleVersions) {
      const text = Models.BibleVersions[i].DisplayName;
      options.push(text);
    }
    options.push('Cancel');
    let cancelButtonIndex = options.length - 1;
    let destructiveButtonIndex = cancelButtonIndex;
    this.props.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex,
      },
      buttonIndex => {
        if (buttonIndex != cancelButtonIndex) {
          this.onBibleVerseChange(Models.BibleVersions[buttonIndex].Value);
        }
      }
    );
  }

  async onBibleVerseChange(version) {
    if (getCurrentUser().getBibleVersion() != version) {
      await getCurrentUser().setBibleVersionAsync(version);
      getCurrentUser().logUserInfo();

      this.props.clearPassage();
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
    clearPassage: () => dispatch(clearPassage())
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(BibleScreen)

const styles = StyleSheet.create({
});