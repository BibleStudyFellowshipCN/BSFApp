import React from 'react';
import { connect } from 'react-redux';
import {
  WebView,
  ScrollView,
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ProgressViewIOS,
  ProgressBarAndroid
} from 'react-native';
import { loadPassage } from '../store/passage';
import { pokeServer, downloadBibleAsync } from '../dataStorage/storage';
import { Models } from '../dataStorage/models';
import { Octicons } from '@expo/vector-icons';
import { connectActionSheet } from '@expo/react-native-action-sheet';
import { clearPassage } from '../store/passage.js'
import { getCurrentUser } from '../store/user';
import { FileSystem } from 'expo';
import { getI18nText } from '../store/I18n';

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

  state = {
    downloading: false,
    downloadProgress: 0,
    downloadBible: ''
  }

  componentWillMount() {
    onBibleVerse = this.onBibleVerse.bind(this);
    onBibleVerse2 = this.onBibleVerse2.bind(this);
    const id = getId(this.props.navigation.state.params.book, this.props.navigation.state.params.verse);
    pokeServer(Models.Passage, id);
    this.ensureBibleIsDownloadedAsync().then(() => {
      this.props.clearPassage();
      this.props.loadPassage();
    });
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
      await this.ensureBibleIsDownloadedAsync();
      this.props.clearPassage();
      this.props.loadPassage();
    }
  }

  async onBibleVerseChange2(version) {
    if (getCurrentUser().getBibleVersion2() != version) {
      await getCurrentUser().setBibleVersion2Async(version);
      await this.ensureBibleIsDownloadedAsync();
      this.props.clearPassage();
      this.props.loadPassage();
    }
  }

  async isBibleExistAsync(bible) {
    if (!bible || Models.EmbedBibleList.indexOf(bible) !== -1) {
      console.log(bible + ': ' + true);
      return true;
    }

    try {
      const localUri = FileSystem.documentDirectory + 'book-' + bible + '.json';
      var info = await FileSystem.getInfoAsync(localUri);
      const exists = info && info.exists;
      console.log(bible + ': ' + exists);
      return exists;
    } catch (e) {
      console.log(e);
    }

    console.log(bible + ': ' + false);
    return false;
  }

  async ensureBibleIsDownloadedAsync() {
    let bibleExist = await this.isBibleExistAsync(getCurrentUser().getBibleVersion());
    if (!bibleExist) {
      this.setState({ downloading: true, downloadBible: getCurrentUser().getBibleVersionDisplayName() });
      await downloadBibleAsync(getCurrentUser().getBibleVersion(), this.downloadCallback.bind(this));
      await this.setState({ downloading: false });
    }

    bibleExist = await this.isBibleExistAsync(getCurrentUser().getBibleVersion2());
    if (!bibleExist) {
      this.setState({ downloading: true, downloadBible: getCurrentUser().getBibleVersion2DisplayName() });
      await downloadBibleAsync(getCurrentUser().getBibleVersion2(), this.downloadCallback.bind(this));
      await this.setState({ downloading: false });
    }
  }

  downloadCallback(downloadProgress) {
    if (downloadProgress.totalBytesExpectedToWrite == -1) {
      progress = 1;
    } else {
      progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
    }
    console.log(`${downloadProgress.totalBytesWritten} / ${downloadProgress.totalBytesExpectedToWrite}`);
    this.setState({ downloadProgress: progress });
  }

  render() {
    const bible = getCurrentUser().getBibleVersion();
    const bible2 = getCurrentUser().getBibleVersion2();
    const fontSize = getCurrentUser().getBibleFontSize();
    const verses = this.props.passage;
    let contentUI;
    // Using text (some Android device cannot show CJK in WebView)
    if (Platform.OS == 'android' &&
      (bible == 'rcuvss' || bible == 'ccb' || bible == 'rcuvts' || bible == 'cnvt' ||
        bible2 == 'rcuvss' || bible2 == 'ccb' || bible2 == 'rcuvts' || bible2 == 'cnvt')) {
      let line = '';
      for (var i in verses) {
        const verse = verses[i];
        if (verse) {
          line += verse.verse + " " + verse.text + "\n";
        }
      }

      contentUI = (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
          <ScrollView>
            <Text selectable={true} style={{
              marginVertical: 3, marginHorizontal: 4, fontSize, lineHeight: 32
            }}>{line}</Text>
          </ScrollView>
        </View>
      );
    }
    else {
      // Using html
      let html = '<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" /></head>' +
        '<style> td { font-size: ' + fontSize + '; padding: 4px;} tr:nth-child(even) { background: #EEEEEE }</style><body><table>';
      for (var i in verses) {
        const verse = verses[i];
        html += `<tr><td>${verse.verse} ${verse.text}</td></tr>`;
      }
      html += '</table></body>';
      contentUI = (<WebView source={{ html }} />);
    }

    const progress = this.state.downloadProgress;
    const progressText = getI18nText('正在下载圣经') + ' ' + this.state.downloadBible + ' (' + parseInt(progress * 100) + '%)';
    return (
      <View style={{ flex: 1 }}>
        {
          this.state.downloading && Platform.OS === 'ios' &&
          <View>
            <Text style={[styles.progress, { fontSize }]}>{progressText}</Text>
            <ProgressViewIOS style={styles.progress} progress={progress} />
          </View>
        }
        {
          this.state.downloading && Platform.OS === 'android' &&
          <View>
            <Text style={[styles.progress, { fontSize }]}>{progressText}</Text>
            <ProgressBarAndroid style={styles.progress} styleAttr="Horizontal" indeterminate={false} progress={progress} />
          </View>
        }
        {contentUI}
      </View>
    );
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
  progress: {
    marginHorizontal: 10,
    marginVertical: 5,
  }
});