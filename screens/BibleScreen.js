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
import { downloadBibleAsync } from '../dataStorage/storage';
import { Models } from '../dataStorage/models';
import { Octicons } from '@expo/vector-icons';
import { connectActionSheet } from '@expo/react-native-action-sheet';
import { clearPassage } from '../store/passage.js'
import { getCurrentUser } from '../store/user';
import { FileSystem } from 'expo';
import { getI18nText } from '../store/I18n';

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
    this.ensureBibleIsDownloadedAsync().then(() => {
      this.props.clearPassage();
      this.props.loadPassage();
    });
  }

  onBibleSelected(name, version) {
    console.log('onBibleSelected: ' + name + ' ' + version);
    this.onBibleVerseChange(version, null);
  }

  onBibleSelected2(name, version) {
    console.log('onBibleSelected2: ' + name + ' ' + version);
    this.onBibleVerseChange(null, version);
  }

  onBibleVerse() {
    this.props.navigation.navigate('BibleSelect', { version: getCurrentUser().getBibleVersion(), onSelected: this.onBibleSelected.bind(this) });
  }

  onBibleVerse2() {
    this.props.navigation.navigate('BibleSelect', { version: getCurrentUser().getBibleVersion2(), removable: true, onSelected: this.onBibleSelected2.bind(this) });
  }

  async onBibleVerseChange(ver1, ver2) {
    let targetVer1 = getCurrentUser().getBibleVersion();
    let targetVer2 = getCurrentUser().getBibleVersion2();
    let changed = false;
    if (!ver1 && !ver2 && targetVer2) {
      targetVer2 = null;
      changed = true;
    }
    if (ver1 && targetVer1 !== version) {
      targetVer1 = ver1;
      changed = true;
    }
    if (ver2 && targetVer2 !== version) {
      targetVer2 = targetVer1 === ver2 ? null : ver2;
      changed = true;
    }
    if (targetVer1 === targetVer2) {
      targetVer2 = null;
      changed = true;
    }

    console.log(`onBibleVerseChange: ${ver1}-${ver2} => ${targetVer1}-${targetVer2} [changed=${changed}]`);
    if (!changed) {
      return;
    }

    await getCurrentUser().setBibleVersionAsync(targetVer1);
    await getCurrentUser().setBibleVersion2Async(targetVer2);
    await this.ensureBibleIsDownloadedAsync();
    this.props.clearPassage();
    this.props.loadPassage();
  }

  async isBibleExistAsync(bible) {
    if (!bible || Models.EmbedBibleList.indexOf(bible) !== -1) {
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
      // For some reason, Android cannot show html with 'tr:nth-child(even)' css...
      const moreStyle = Platform.OS === 'ios' ? 'tr:nth-child(even) { background: #EEEEEE }' : '';
      // Using html
      let html = '<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" /></head>' +
        '<style> td { font-size: ' + fontSize + '; padding: 4px;} ' + moreStyle + '</style><body><table>';
      for (var i in verses) {
        const verse = verses[i];
        html += `<tr><td>${verse.verse} ${verse.text.replace(/\n/g, '<br>')}</td></tr>`;
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
  const bookIdList = require('../assets/json/bookid.json');
  let bookId = 1;
  for (var i in bookIdList) {
    if (bookIdList[i].name == book) {
      bookId = bookIdList[i].id;
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