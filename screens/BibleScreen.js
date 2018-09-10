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
import { pokeServer } from '../dataStorage/storage';
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
    bibleExist: true,
    bibleExist2: true,
    downloading: false,
    downloadProgress: 0
  }

  componentWillMount() {
    onBibleVerse = this.onBibleVerse.bind(this);
    onBibleVerse2 = this.onBibleVerse2.bind(this);
    const id = getId(this.props.navigation.state.params.book, this.props.navigation.state.params.verse);
    pokeServer(Models.Passage, id);
    this.checkBibleExistAsync();
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

      await this.checkBibleExistAsync();
      this.props.clearPassage();
      this.props.loadPassage();
    }
  }

  async onBibleVerseChange2(version) {
    if (getCurrentUser().getBibleVersion2() != version) {
      await getCurrentUser().setBibleVersion2Async(version);
      getCurrentUser().logUserInfo();

      await this.checkBibleExistAsync();
      this.props.clearPassage();
      this.props.loadPassage();
    }
  }

  async isBibleExistAsync(bible) {
    console.log("check " + bible);
    if (!bible || Models.EmbedBibleList.indexOf(bible) !== -1) {
      return true;
    }

    try {
      const localUri = FileSystem.documentDirectory + 'book-' + bible + '.json';
      var info = await FileSystem.getInfoAsync(localUri);
      return (info && info.exists);
    } catch (e) {
      console.log(e);
    }

    return false;
  }

  async checkBibleExistAsync() {
    const bibleExist = await this.isBibleExistAsync(getCurrentUser().getBibleVersion());
    const bibleExist2 = await this.isBibleExistAsync(getCurrentUser().getBibleVersion2());
    this.setState({ bibleExist, bibleExist2 });
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

  async downloadBible(bible) {
    if (this.state.downloading) {
      return;
    }

    try {
      await this.setState({ downloading: true });

      const remoteUri = Models.DownloadBibleUrl + bible + '.json';
      const localUri = FileSystem.documentDirectory + 'temp.json';
      console.log(`Downlad ${remoteUri} to ${localUri}...`);

      const downloadResumable = FileSystem.createDownloadResumable(remoteUri, localUri, {}, this.downloadCallback.bind(this));
      const { uri } = await downloadResumable.downloadAsync();

      const finalUri = FileSystem.documentDirectory + 'book-' + bible + '.json';
      console.log(`Move ${localUri} to ${finalUri}...`);
      await Expo.FileSystem.moveAsync({ from: localUri, to: finalUri });
    } catch (e) {
      console.log(e);
      alert(JSON.stringify(e));
    } finally {
      await this.setState({ downloading: false });
      await this.checkBibleExistAsync();
    }
  }

  render() {
    const bible = getCurrentUser().getBibleVersion();
    const bible2 = getCurrentUser().getBibleVersion2();

    if (!this.props.passage) {
      // Display loading screen
      return (
        <View style={styles.BSFQuestionContainer}>
          <Text style={{ marginVertical: 12, color: 'black' }}>Loading</Text>
        </View>
      );
    }

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
    const progressText = getI18nText('下载圣经') + ' (' + parseInt(progress * 100) + '%)';
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
        {
          !this.state.downloading && !this.state.bibleExist &&
          <View>
            <TouchableOpacity onPress={() => {
              this.downloadBible(getCurrentUser().getBibleVersion());
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
                <Octicons name='cloud-download' size={28} color='#fcaf17' />
                <Text style={[styles.progress, { fontSize }]}>{getI18nText('下载圣经')}: {getCurrentUser().getBibleVersionDisplayName()}</Text>
              </View>
            </TouchableOpacity>
          </View>
        }
        {
          !this.state.downloading && !this.state.bibleExist2 &&
          <View>
            <TouchableOpacity onPress={() => {
              this.downloadBible(getCurrentUser().getBibleVersion2());
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
                <Octicons name='cloud-download' size={28} color='#fcaf17' />
                <Text style={[styles.progress, { fontSize }]}>{getI18nText('下载圣经')}: {getCurrentUser().getBibleVersion2DisplayName()}</Text>
              </View>
            </TouchableOpacity>
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