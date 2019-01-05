import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  Picker,
  Dimensions,
  Slider,
  Alert,
  ScrollView
} from 'react-native';
import { getI18nText, getI18nBibleBookFromLang } from '../store/I18n';
import { getCurrentUser } from '../store/user';
import { FontAwesome } from '@expo/vector-icons';
import { Models } from '../dataStorage/models';
import Sound from '../store/sound';
const soundInstance = Sound.instance;

const audioBookId = require('../assets/json/audioBookId.json');

export default class AudioBibleScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    let title = navigation.state.params && navigation.state.params.title ? navigation.state.params.title : '有声圣经';
    return {
      title: getI18nText(title)
    };
  };

  constructor(props) {
    super(props);

    const value = parseInt(getCurrentUser().getAudioBibleBook());

    // set up default veresion based on language
    let currentVersion = parseInt(value / 1000 / 1000);
    switch (currentVersion) {
      case 1:
        break;
      case 4:
        break;
      case 6:
        break;
      case 13:
        break;
      default:
        currentVersion = 1;
    }
    const currentBook = parseInt(value / 1000 % 1000);
    const currentChapter = parseInt(value % 1000);

    let book = audioBookId.find((element) => (element.id == currentBook));
    this.state = {
      currentVersion,
      currentBook,
      currentChapter,
      totalChapter: book.chapters,
      isPlaying: false,
      isLoaded: false,
      duration: 0,
      progress: 0,
      width: Dimensions.get('window').width
    };
  }

  isSeeking = false;

  componentDidMount() {
    soundInstance.enableAsync(this.onPlaybackStatusUpdate.bind(this));
  }

  async _resetAudio() {
    await soundInstance.resetAsync();

    this.setState({
      isLoaded: false,
      isPlaying: false,
      duration: 0,
      progress: 0
    });
    console.log('reset');
  }

  async onPlaybackStatusUpdate(status) {
    //console.log(JSON.stringify(status));
    if (status.didJustFinish || status.progress == 1) {
      console.log('didJustFinish ' + this.state.currentChapter);

      await soundInstance.resetAsync();

      var newBook = 1;
      var newChapter = 1;
      if (this.state.currentChapter < this.state.totalChapter) {
        // play next chapter
        newBook = this.state.currentBook;
        newChapter = this.state.currentChapter + 1;
      } else if (this.state.currentBook < 66) {
        // play next book
        newBook = this.state.currentBook + 1;
      }

      this.setState({ currentBook: newBook, currentChapter: newChapter });
      await getCurrentUser().setAudioBibleBook(
        this.state.currentVersion * 1000 * 1000 + newBook * 1000 + newChapter
      );

      await soundInstance.loadAsync(this.getAudioUrl());
      await soundInstance.playAsync();
    } else if (status.isLoaded) {
      this.setState({
        isLoaded: true,
        progress: status.positionMillis / status.durationMillis,
        duration: status.durationMillis
      });
    } else {
      if (status.error) {
        Alert.alert('Audio error', status.error);
        await this._resetAudio();
      }
    }
  }

  getAudioUrl() {
    return `http://mycbsf.org/mp3/${this.state.currentVersion}/${this.state.currentBook}/${this.state.currentChapter}.mp3`;
  }

  async play() {
    if (!this.state.isLoaded) {
      await soundInstance.loadAsync(this.getAudioUrl());
    }

    await soundInstance.playFromPositionAsync(this.state.progress * this.state.duration);
    this.setState({ isPlaying: true, isLoaded: true });
  }

  async pause() {
    await soundInstance.pauseAsync();
    this.setState({ isPlaying: false, isLoaded: true });
  }

  async _onBookSelected(id) {
    let book = audioBookId.find((element) => (element.id == id));
    await this._resetAudio();
    this.setState({
      currentBook: id,
      currentChapter: 1,
      totalChapter: book.chapters
    });
    await getCurrentUser().setAudioBibleBook(this.state.currentVersion * 1000 * 1000 + id * 1000 + 1);
    console.log(JSON.stringify(this.state));
  }

  async _onChapterSelected(chapter) {
    console.log('_onChapterSelected:' + chapter);
    await this._resetAudio();
    this.setState({ currentChapter: chapter });
    await getCurrentUser().setAudioBibleBook(this.state.currentVersion * 1000 * 1000 + this.state.currentBook * 1000 + chapter);
  }

  _onSeekSliderValueChange(value) {
    console.log('Seeking: ' + value);
    if (this.sound && this.isPlaying && !this.isSeeking) {
      this.isSeeking = true;
    }
  }

  async _onSeekSliderSlidingComplete(value) {
    console.log('SeekComplete: ' + value);
    this.isSeeking = false;
    this.setState({ progress: value });

    if (this.state.isPlaying) {
      await soundInstance.playFromPositionAsync(value * this.state.duration);
    }
  }

  async _onVersionSelected(value) {
    console.log('Swtich version:' + value);
    await this._resetAudio();
    this.setState({ currentVersion: value });
    await getCurrentUser().setAudioBibleBook(value * 1000 * 1000 + this.state.currentBook * 1000 + this.state.currentChapter);
  }

  _getMMSSFromMillis(millis) {
    const totalSeconds = millis / 1000;
    const seconds = Math.floor(totalSeconds % 60);
    const minutes = Math.floor(totalSeconds / 60);

    const padWithZero = number => {
      const string = number.toString();
      if (number < 10) {
        return '0' + string;
      }
      return string;
    };
    return padWithZero(minutes) + ':' + padWithZero(seconds);
  }

  getBookName(name) {
    let lang = 'chs';
    switch (parseInt(this.state.currentVersion)) {
      case 1:
        lang = 'eng';
        break;
      case 6:
        lang = 'spa';
        break;
      case 13:
        lang = 'cht';
        break;
    }
    return getI18nBibleBookFromLang(name, lang);
  }

  getChapterName(name) {
    return name;
  }

  render() {
    //console.log('State:' + JSON.stringify(this.state));
    const position = this._getMMSSFromMillis(this.state.duration * this.state.progress);
    const duration = this._getMMSSFromMillis(this.state.duration);
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={{ alignItems: 'center' }}>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ width: this.state.width / 3 }}>
              <Picker
                style={{ alignSelf: 'stretch' }}
                selectedValue={this.state.currentVersion}
                onValueChange={this._onVersionSelected.bind(this)}>
                {
                  Models.AudioBibles.map(s => (
                    <Picker.Item label={s.DisplayName} value={parseInt(s.Value)} key={s.Value} />
                  ))}
              </Picker>
            </View>
            <View style={{ width: this.state.width / 3 }}>
              <Picker
                style={{ alignSelf: 'stretch' }}
                selectedValue={this.state.currentBook}
                onValueChange={this._onBookSelected.bind(this)}>
                {audioBookId.map(s => (
                  <Picker.Item label={this.getBookName(s.name)} value={s.id} key={s.id} />
                ))}
              </Picker>
            </View>
            <View style={{ width: this.state.width / 3 }}>
              <Picker
                style={{ alignSelf: 'stretch' }}
                selectedValue={this.state.currentChapter}
                onValueChange={this._onChapterSelected.bind(this)}>
                {
                  Array(this.state.totalChapter).fill(0).map((e, i) => i + 1).map(s => (<Picker.Item label={this.getChapterName(s.toString())} value={s} key={s} />))
                }
              </Picker>
            </View>
          </View>
          <Slider
            style={styles.playbackSlider}
            value={this.state.progress}
            onValueChange={this._onSeekSliderValueChange.bind(this)}
            onSlidingComplete={this._onSeekSliderSlidingComplete.bind(this)}
            disabled={!this.state.isLoaded}
          />
          <Text>{position}/{duration}</Text>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
            <TouchableHighlight
              underlayColor={'#FFFFFF'}
              style={styles.wrapper}
              onPress={() => {
                this.state.isPlaying ? this.pause() : this.play();
              }}>
              <FontAwesome
                style={{ marginHorizontal: 30, width: 50 }}
                name={this.state.isPlaying ? 'pause' : 'play'}
                size={50}
              />
            </TouchableHighlight>
            <TouchableHighlight
              underlayColor={'#FFFFFF'}
              style={styles.wrapper}
              onPress={() => {
                this._resetAudio();
              }}>
              <FontAwesome
                style={{ marginHorizontal: 30, width: 50 }}
                name='stop'
                size={50}
              />
            </TouchableHighlight>
          </View>
        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
  },
  playbackSlider: {
    alignSelf: 'stretch',
  }
});
