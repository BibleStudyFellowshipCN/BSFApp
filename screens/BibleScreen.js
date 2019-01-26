import React from 'react';
import { connect } from 'react-redux';
import {
  WebView,
  ScrollView,
  Platform,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ProgressViewIOS,
  ProgressBarAndroid
} from 'react-native';
import { loadPassage } from '../store/passage';
import { downloadBibleAsync } from '../dataStorage/storage';
import { Models } from '../dataStorage/models';
import { connectActionSheet } from '@expo/react-native-action-sheet';
import { clearPassage } from '../store/passage.js'
import { getCurrentUser } from '../utils/user';
import { FileSystem } from 'expo';
import { getI18nText } from '../utils/I18n';

@connectActionSheet class BibleScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.state.params && navigation.state.params.title ? navigation.state.params.title : 'Bible',
      headerLeft: (
        <View style={{ marginLeft: 10 }}>
          <TouchableOpacity onPress={() => navigateBack()}>
            <Image
              style={{ width: 34, height: 34 }}
              source={require('../assets/images/GoBack.png')} />
          </TouchableOpacity>
        </View>),
      headerRight: (
        <View style={{ marginRight: 10, flexDirection: 'row' }}>
          <TouchableOpacity onPress={() => { onBibleVerse(true); }}>
            <Image
              style={{ width: 34, height: 34 }}
              source={require('../assets/images/Bible.png')} />
          </TouchableOpacity>
        </View>)
    };
  };

  state = {
    downloading: false,
    downloadProgress: 0,
    downloadBible: ''
  }

  componentWillMount() {
    navigateBack = () => this.props.navigation.pop();
    onBibleVerse = this.onBibleVerse.bind(this);
    this.ensureBibleIsDownloadedAsync().then(() => {
      this.props.clearPassage();
      this.props.loadPassage();
    });
  }

  onBibleSelected(name, version) {
    console.log('onBibleSelected: ' + name + ' ' + version);
    this.onBibleVerseChange(version, getCurrentUser().getBibleVersion2());
  }

  onBibleVerse() {
    this.props.navigation.navigate('BibleSelect', { version: getCurrentUser().getBibleVersion(), onSelected: this.onBibleSelected.bind(this) });
  }

  async onBibleVerseChange(ver1, ver2) {
    // if two versions are the same, we only use one version
    if (ver1 === ver2) {
      ver2 = null;
    }

    console.log(`onBibleVerseChange: ${getCurrentUser().getBibleVersion()}-${getCurrentUser().getBibleVersion2()} => ${ver1}-${ver2}`);

    await getCurrentUser().setBibleVersionAsync(ver1);
    await getCurrentUser().setBibleVersion2Async(ver2);
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
    const fontSize = getCurrentUser().getBibleFontSize();
    const verses = this.props.passage;
    let contentUI;
    // Using text (some Android device cannot show CJK or even UTF8 in WebView)
    if (Platform.OS == 'android') {
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
    } else {
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