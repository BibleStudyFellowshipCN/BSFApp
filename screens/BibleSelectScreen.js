import React from 'react';
import {
  Alert,
  ScrollView,
  Platform,
  StyleSheet,
  Text,
  View,
  ProgressViewIOS,
  ProgressBarAndroid
} from 'react-native';
import { FileSystem } from 'expo';
import { getI18nText } from '../store/I18n';
import { Models } from '../dataStorage/models';
import { getCurrentUser } from '../store/user';
import Layout from '../constants/Layout';
import { downloadBibleAsync } from '../dataStorage/storage';
import { CheckBox, Button } from 'react-native-elements';

export default class BibleSelectScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: getI18nText('请选择圣经版本')
    };
  };

  state = {
    busy: false,
    selectedBible: this.props.navigation.state.params.version,
    downloading: false,
    downloadProgress: 0,
    downloadBible: '',
  };

  removable = this.props.navigation.state.params.removable;

  componentWillMount() {
  }

  componentWillUnmount() {
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

      const oldVersion = this.state.selectedBible;
      this.setState({ selectedBible: version });

      const result = await this.ensureBibleIsDownloadedAsync(name, version);
      if (!result) {
        Alert.alert(getI18nText('错误'), getI18nText('下载失败'));
        this.setState({ selectedBible: oldVersion });
        return;
      }

      const onSelected = this.props.navigation.state.params.onSelected;
      if (typeof onSelected === 'function') {
        onSelected(name, version);
        this.props.navigation.goBack();
      }
    } finally {
      this.setState({ busy: false });
    }
  }

  onRemoval() {
    const onSelected = this.props.navigation.state.params.onSelected;
    if (typeof onSelected === 'function') {
      onSelected('N/A', null);
      this.props.navigation.goBack();
    }
  }

  render() {
    let keyIndex = 1;
    let bibleIndex = 1;
    const progress = this.state.downloadProgress;
    const progressText = getI18nText('正在下载圣经') + ' ' + this.state.downloadBible + ' (' + parseInt(progress * 100) + '%)';
    const fontSize = getCurrentUser().getBibleFontSize();
    console.log('Current bible: ' + this.state.selectedBible);
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
            this.removable &&
            <CheckBox
              textStyle={{ color: 'red' }}
              containerStyle={{ width: Layout.window.width - 10 }}
              key={keyIndex++}
              title='N/A'
              checked={!this.state.selectedBible}
              onPress={() => { this.onRemoval(); }} />
          }
          {
            Object.keys(Models.BibleVersions).map((lang) => (
              <View key={keyIndex++} style={{ alignItems: "center" }}>
                <Text key={keyIndex++} style={{ fontSize: fontSize + 2, fontWeight: 'bold' }}>{lang}</Text>
                {
                  Models.BibleVersions[lang].map((bible) => (
                    <CheckBox
                      containerStyle={{ width: Layout.window.width - 10 }}
                      key={keyIndex++}
                      title={/*'#' + (bibleIndex++) + ' ' + */bible.name}
                      checked={bible.id === this.state.selectedBible}
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
