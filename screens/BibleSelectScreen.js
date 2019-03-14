import React from 'react';
import {
  Alert,
  ScrollView,
  Platform,
  StyleSheet,
  Text,
  View,
  ProgressViewIOS,
  ProgressBarAndroid,
  Dimensions,
  TouchableOpacity,
  Image
} from 'react-native';
import { FileSystem } from 'expo';
import { getI18nText } from '../utils/I18n';
import { Models } from '../dataStorage/models';
import { getCurrentUser } from '../utils/user';
import { downloadBibleAsync } from '../dataStorage/storage';
import { CheckBox } from 'react-native-elements';
import { EventRegister } from 'react-native-event-listeners';
import { showMessage } from "react-native-flash-message";
import Colors from '../constants/Colors';

export default class BibleSelectScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: getI18nText('请选择圣经版本'),
      headerLeft: (
        <View style={{ marginLeft: 10 }}>
          <TouchableOpacity onPress={() => navigateBack()}>
            <Image
              style={{ width: 34, height: 34 }}
              source={require('../assets/images/Ok.png')} />
          </TouchableOpacity>
        </View>)
    };
  };

  state = {
    busy: false,
    downloading: false,
    downloadProgress: 0,
    downloadBible: '',
    windowWidth: Dimensions.get('window').width
  };

  constructor(props) {
    super(props);
    let selectedBibles = [getCurrentUser().getBibleVersion()];
    const bibleVersion2 = getCurrentUser().getBibleVersion2();
    if (bibleVersion2) {
      selectedBibles.push(bibleVersion2);
    }
    this.state.selectedBibles = selectedBibles;
  }

  componentWillMount() {
    navigateBack = () => this.props.navigation.pop();
    this.listener = EventRegister.addEventListener('screenDimensionChanged', (window) => {
      this.setState({ windowWidth: window.width });
    });
  }

  componentWillUnmount() {
    EventRegister.removeEventListener(this.listener)
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

  async ensureBibleIsDownloadedAsync(name, version) {
    let bibleExist = await this.isBibleExistAsync(version);
    if (!bibleExist) {
      this.setState({ downloading: true, downloadBible: name });
      await downloadBibleAsync(version, this.downloadCallback.bind(this));
      await this.setState({ downloading: false });
      bibleExist = await this.isBibleExistAsync(version);
    }

    return bibleExist;
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

  async onSelect(name, version) {
    this.setState({ busy: true });
    try {
      console.log('Select: ' + version);

      const result = await this.ensureBibleIsDownloadedAsync(name, version);
      if (!result) {
        showMessage({
          message: getI18nText('错误'),
          description: getI18nText('下载失败'),
          duration: 5000,
          type: "danger"
        });
        return;
      }

      const selectedBibles = this.state.selectedBibles;
      console.log(`Before: ${JSON.stringify(selectedBibles)}`);
      const existing = selectedBibles.indexOf(version);
      if (existing !== -1) {
        if (selectedBibles.length > 1) {
          selectedBibles.splice(existing, 1);
        }
      } else {
        if (selectedBibles.length <= 1) {
          selectedBibles.push(version);
        } else {
          selectedBibles[0] = selectedBibles[1];
          selectedBibles[1] = version;
        }
      }
      console.log(`After: ${JSON.stringify(selectedBibles)}`);
      this.setState({ selectedBibles });

      // Save
      await getCurrentUser().setBibleVersionAsync(selectedBibles[0]);
      await getCurrentUser().setBibleVersion2Async(selectedBibles.length > 1 ? selectedBibles[1] : null);

      // Notify selection change
      const onSelected = this.props.navigation.state.params.onSelected;
      if (typeof onSelected === 'function') {
        onSelected(getCurrentUser().getBibleVersionDisplayName(), getCurrentUser().getBibleVersion());
      }
    } finally {
      this.setState({ busy: false });
    }
  }

  render() {
    let keyIndex = 1;
    const progress = this.state.downloadProgress;
    const progressText = getI18nText('正在下载圣经') + ' ' + this.state.downloadBible + ' (' + parseInt(progress * 100) + '%)';
    const fontSize = getCurrentUser().getBibleFontSize();
    console.log(`Selected bibles: ${JSON.stringify(this.state.selectedBibles)}`);
    return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
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
        <ScrollView>
          {
            Object.keys(Models.BibleVersions).map((lang) => (
              <View key={keyIndex++} style={{ alignItems: "center" }}>
                <Text key={keyIndex++} style={{ fontSize: fontSize + 2, fontWeight: 'bold' }}>{lang}</Text>
                {
                  Models.BibleVersions[lang].map((bible) => (
                    <CheckBox
                      containerStyle={{ width: this.state.windowWidth - 10 }}
                      checkedColor={Colors.yellow}
                      key={keyIndex++}
                      title={bible.name}
                      checked={this.state.selectedBibles.indexOf(bible.id) !== -1}
                      onPress={() => { this.onSelect(bible.name, bible.id); }} />
                  ))
                }
              </View>
            ))
          }
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  progress: {
    marginHorizontal: 10,
    marginVertical: 5,
  }
});
