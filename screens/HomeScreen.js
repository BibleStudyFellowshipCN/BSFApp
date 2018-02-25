import React from 'react';
import { connect } from 'react-redux';
import { FontAwesome } from '@expo/vector-icons';
import { FileSystem } from 'expo';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Platform,
  ProgressViewIOS,
  ProgressBarAndroid
} from 'react-native';
import Accordion from 'react-native-collapsible/Accordion';
import { requestBooks, clearBooks } from "../store/books.js";
import { clearLesson } from '../store/lessons.js'
import { clearPassage } from '../store/passage.js'
import { getI18nText } from '../store/I18n';
import { getCurrentUser } from '../store/user';
import { Models } from '../dataStorage/models';
import { pokeServer, reloadGlobalCache } from '../dataStorage/storage';

class HomeScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    let title = navigation.state.params && navigation.state.params.title ? navigation.state.params.title : 'BSF课程';
    return {
      title: getI18nText(title),
      headerRight: (
        <View style={{ marginRight: 20, flexDirection: 'row' }}>
          <TouchableOpacity onPress={() => { checkForContentUpdate(true); }}>
            <FontAwesome name='download' size={28} color='#fff' />
          </TouchableOpacity>
        </View>)
    };
  };

  state = {
    downloadProgress: '',
    remoteVersion: '',
    downloading: false
  };

  lastCheckForContentUpdateDate = 0;

  componentWillMount() {
    pokeServer(Models.Book, '');
    this.checkForContentUpdate(false);

    if (!this.props.booklist) {
      this.props.requestBooks();
    }

    checkForContentUpdate = this.checkForContentUpdate.bind(this);
  }

  downloadCallback(downloadProgress) {
    if (downloadProgress.totalBytesExpectedToWrite == -1) {
      progress = 1;
    } else {
      progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
    }
    this.setState({ downloadProgress: progress });
  }

  async checkForContentUpdate(showUI) {
    if (this.checkingForContentUpdate) {
      return;
    }
    this.checkingForContentUpdate = true;

    this.lastCheckForContentUpdateDate = (new Date()).getDate();
    try {
      const { localVersion, remoteVersion, localVersionString, remoteVersionString } = await getCurrentUser().getContentVersions(showUI);
      if (localVersion == remoteVersion) {
        if (showUI) {
          Alert.alert(getI18nText('课程没有更新'), getI18nText('是否重新下载？') + '[' + remoteVersionString + ']', [
            { text: 'Yes', onPress: () => { this.downloadContent(remoteVersionString); } },
            { text: 'No', onPress: () => { } },
          ]);
        }
      } else {
        this.downloadContent(remoteVersionString);
      }
    } catch (e) {
      console.log(e);
    }

    this.checkingForContentUpdate = false;
  }

  async downloadContent(remoteVersion) {
    this.downloadFiles = Models.DownloadList.length;
    this.downloadedFiles = 0;
    this.setState({ downloadProgress: 0, downloading: true, remoteVersion });
    for (var i in Models.DownloadList) {
      const remoteUri = Models.DownloadUrl + Models.DownloadList[i] + '.json';
      const localUri = FileSystem.documentDirectory + Models.DownloadList[i] + '.json';
      console.log(`Downlad ${remoteUri} to ${localUri}...`);

      const downloadResumable = FileSystem.createDownloadResumable(remoteUri, localUri, {}, this.downloadCallback.bind(this));
      try {
        const { uri } = await downloadResumable.downloadAsync();

        await reloadGlobalCache(Models.DownloadList[i]);

        this.downloadedFiles++;
        if (this.downloadedFiles >= Models.DownloadList.length) {
          // reload all data
          this.props.clearBooks();
          this.props.clearLesson();
          this.props.clearPassage();
          this.props.requestBooks();
          this.setState({ downloading: false });
        }
      } catch (e) {
        console.log(e);
        this.setState({ downloading: false });
        return;
      }
    }
  }

  goToLesson(lesson) {
    // Check for update every day
    const dayOfToday = (new Date()).getDate();
    console.log('LastCheckForContentUpdateDate: ' + this.lastCheckForContentUpdateDate + ' DayOfToday: ' + dayOfToday);
    if (dayOfToday != this.lastCheckForContentUpdateDate) {
      this.checkForContentUpdate(false);
    }

    let parsed = lesson.name.split(' ');
    this.props.navigation.navigate('Lesson', { lesson, title: parsed[1] });
  }

  render() {
    const progress = (this.state.downloadProgress + this.downloadedFiles) / this.downloadFiles;
    const progressText = getI18nText('下载课程') + ' ' + this.state.remoteVersion + ' (' + parseInt(progress * 100) + '%)';
    return (
      <View style={styles.container}>
        {
          this.state.downloading && Platform.OS === 'ios' &&
          <View>
            <Text style={styles.progress}>{progressText}</Text>
            <ProgressViewIOS style={styles.progress} progress={progress} />
          </View>
        }
        {
          this.state.downloading && Platform.OS === 'android' &&
          <View>
            <Text style={styles.progress}>{progressText}</Text>
            <ProgressBarAndroid style={styles.progress} styleAttr="Horizontal" indeterminate={false} progress={progress} />
          </View>
        }
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}>
          <View style={styles.booksContainer}>
            {
              this.props.booklist &&
              <Accordion
                initiallyActiveSection={0}
                sections={this.props.booklist}
                renderHeader={this._renderHeader.bind(this)}
                renderContent={this._renderContent.bind(this)} />
            }
            {
              !this.props.booklist &&
              <Text style={{ textAlign: 'center', textAlignVertical: 'center', fontSize: 22 }}>Loading</Text>
            }
          </View>
        </ScrollView>
      </View>
    )
  }

  _renderHeader(content, index, isActive) {
    // TODO: clean up backend api for this to work
    const parsed = content.title.indexOf('2');
    const book = content.title.substring(0, parsed);
    const year = content.title.substring(parsed);
    return (
      <View style={styles.bookHeader} >
        <FontAwesome
          name={isActive ? 'minus' : 'plus'}
          size={18}
        />
        <Text style={[styles.bookHeaderText, { fontSize: getCurrentUser().getHomeTitleFontSize() }]}>    {book} ({year})</Text>
      </View>
    )
  }

  _renderContent(content, index, isActive) {
    return (
      <View>
        {content.lessons.map(lesson => (
          <Lesson
            key={lesson.id}
            goToLesson={() => this.goToLesson(lesson)}
            lesson={lesson}
          />))}
      </View>
    )
  }
}

const Lesson = (props) => {
  // TODO: clean up backend api for this to work
  const parsed = props.lesson.name.split(' ')
  const lessonNumber = parsed[0]
  const name = parsed[1]
  const date = parsed[2]
  return (
    <TouchableOpacity style={styles.lessonContainer} onPress={() => props.goToLesson()}>
      <View>
        <View style={styles.lessonMetadata}>
          <Text style={styles.lessonMetadataText}>
            {date} {lessonNumber}
          </Text>
        </View>
        <Text style={{ marginVertical: 4, fontSize: getCurrentUser().getHomeFontSize() }}>
          {name}
        </Text>
      </View>
      <View style={styles.lessonChevron}>
        <FontAwesome
          name='chevron-right'
          color='grey'
          size={16}
        />
      </View>
    </TouchableOpacity>
  )
}

const mapStateToProps = (state) => {
  return {
    booklist: state.books.booklist,
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    requestBooks: () => dispatch(requestBooks()),
    clearLesson: () => dispatch(clearLesson()),
    clearPassage: () => dispatch(clearPassage()),
    clearBooks: () => dispatch(clearBooks())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'whitesmoke',
  },
  contentContainer: {
  },
  booksContainer: {
  },
  bookHeader: {
    flexDirection: 'row',
    paddingVertical: 2,
    backgroundColor: '#FFECC4',
    alignItems: 'center',
    paddingLeft: 15,
    marginTop: 2,
    marginBottom: 2
  },
  bookHeaderText: {
    marginVertical: 6,
    fontWeight: '400',
  },

  lessonContainer: {
    paddingLeft: 25,
    paddingVertical: 5,
    backgroundColor: 'white',
  },
  lessonChevron: {
    position: 'absolute',
    right: 15,
    top: 25,
  },
  lessonMetadata: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  lessonMetadataText: {
    color: 'grey',
  },
  progress: {
    marginHorizontal: 10,
    marginVertical: 5,
  }
});