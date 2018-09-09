import React from 'react';
import { connect } from 'react-redux';
import { WebView, ScrollView, Platform } from 'react-native';
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
function onBibleVerse2() { }

@connectActionSheet class BibleScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.state.params && navigation.state.params.title ? navigation.state.params.title : 'Bible',
      headerRight: (
        <View style={{ marginRight: 20, flexDirection: 'row', backgroundColor: '#fcaf17', alignItems: 'baseline' }}>
          <TouchableOpacity onPress={() => onBibleVerse()}>
            <Octicons name='book' size={28} color='#fff' />
          </TouchableOpacity>
          <Text style={{ marginLeft: 3, fontSize: 12, color: 'white' }}>1</Text>
          <View style={{ width: 7 }} />
          <TouchableOpacity onPress={() => onBibleVerse2()}>
            <Octicons name='book' size={28} color='#fff' />
          </TouchableOpacity>
          <Text style={{ marginLeft: 3, fontSize: 12, color: 'white' }}>2</Text>
        </View>)
    };
  };

  componentWillMount() {
    onBibleVerse = this.onBibleVerse.bind(this);
    onBibleVerse2 = this.onBibleVerse2.bind(this);
    const id = getId(this.props.navigation.state.params.book, this.props.navigation.state.params.verse);
    pokeServer(Models.Passage, id);
    if (!this.props.passage) {
      this.props.loadPassage();
    }
  }

  onBibleVerse() {
    let options = [];
    const version = getCurrentUser().getBibleVersion();
    for (var i in Models.BibleVersions) {
      const text = Models.BibleVersions[i].DisplayName;
      options.push((version === Models.BibleVersions[i].Value) ? '>' + text : text);
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

  onBibleVerse2() {
    let options = [];
    const version = getCurrentUser().getBibleVersion2();
    let found = false;
    for (var i in Models.BibleVersions) {
      const text = Models.BibleVersions[i].DisplayName;
      if (version === Models.BibleVersions[i].Value) {
        options.push('>' + text);
        found = true;
      } else {
        options.push(text);
      }
    }
    options.unshift(found ? "N/A" : ">N/A");
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
          this.onBibleVerseChange2(buttonIndex === 0 ? null : Models.BibleVersions[buttonIndex - 1].Value);
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

  async onBibleVerseChange2(version) {
    if (getCurrentUser().getBibleVersion2() != version) {
      await getCurrentUser().setBibleVersion2Async(version);
      getCurrentUser().logUserInfo();

      this.props.clearPassage();
      this.props.loadPassage();
    }
  }

  render() {
    if (this.props.passage) {
      const fontSize = getCurrentUser().getBibleFontSize();
      const paragraphs = this.props.passage.paragraphs;

      // Using text (some Android device cannot show CJK in WebView)
      const bible = getCurrentUser().getBibleVersion();
      const bible2 = getCurrentUser().getBibleVersion2();
      if (Platform.OS == 'android' &&
        (bible == 'rcuvss' || bible == 'ccb' || bible == 'rcuvts' || bible == 'cnvt' ||
          bible2 == 'rcuvss' || bible2 == 'ccb' || bible2 == 'rcuvts' || bible2 == 'cnvt')) {
        let line = '';
        for (var i in paragraphs) {
          for (var j in paragraphs[i].verses) {
            const verse = paragraphs[i].verses[j];
            line += verse.verse + " " + verse.text + "\n";
          }
        }

        return (
          <View style={{ flex: 1, backgroundColor: 'white' }}>
            <ScrollView>
              <Text selectable={true} style={{
                marginVertical: 3, marginHorizontal: 4, fontSize, lineHeight: 32
              }}>{line}</Text>
            </ScrollView>
          </View>
        );
      }

      // Using html
      let html = '<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" /></head>' +
        '<style> td { font-size: ' + fontSize + '; padding: 4px;} tr:nth-child(even) { background: #EEEEEE }</style><body><table>';
      for (var i in paragraphs) {
        for (var j in paragraphs[i].verses) {
          const verse = paragraphs[i].verses[j];
          html += `<tr><td>${verse.verse} ${verse.text}</td></tr>`;
        }
      }
      html += '</table></body>';
      console.log(html);
      return (<WebView source={{ html }} />);
    } else {
      // Display loading screen
      return (
        <View style={styles.BSFQuestionContainer}>
          <Text style={{ marginVertical: 12, color: 'black' }}>Loading</Text>
        </View>
      );
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