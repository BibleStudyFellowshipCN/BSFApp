import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  Picker
} from 'react-native';
import { Audio, KeepAwake } from 'expo';
import { getI18nText, getI18nBibleBook } from '../store/I18n';
import { getCurrentUser } from '../store/user';
import { FontAwesome } from '@expo/vector-icons';

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

    const bookId = parseInt(getCurrentUser().getAudioBibleBook() / 1000);
    let book = audioBookId.find((element) => (element.id == bookId));
    this.state = {
      currentLanguage: getCurrentUser().getLanguage(),
      currentBook: bookId,
      currentChapter: parseInt(getCurrentUser().getAudioBibleBook() % 1000),
      totalChapter: book.chapters,
      isPlaying: false,
      isPaused: false,
      isLoading: false,
      isLoaded: false,
      duration: 0,
      progress: 0
    };
    console.log("Init state: " + JSON.stringify(this.state));
  }

  isSeeking = false;

  componentDidMount() {
    Audio.setIsEnabledAsync(true);
  }

  async _resetAudio() {
    if (this.sound) {
      if (this.state.isPlaying) {
        await this.sound.stopAsync();
      }
      if (this.state.isLoaded) {
        await this.sound.unloadAsync();
      }
    }
    this.setState({ isLoaded: false, isPlaying: false, isPaused: false, duration: 0, progress: 0 });
    console.log('reset');
  }

  async onPlaybackStatusUpdate(status) {
    console.log(JSON.stringify(status));
    if (status.didJustFinish || status.progress == 1) {
      console.log('didJustFinish ' + this.state.currentChapter);
      await this.sound.unloadAsync();
      this.setState({ isLoaded: false });

      var newBook = 1;
      var newChapter = 1;
      if (this.state.currentChapter < this.state.totalChapter) {
        // play next chapter
        newChapter = this.state.currentChapter + 1;
      } else if (this.state.currentBook < 66) {
        // play next book
        newBook = this.state.currentBook + 1;
      }

      this.setState({ currentBook: newBook, currentChapter: newChapter });
      await getCurrentUser().setAudioBibleBook(newBook * 1000 + newChapter);
      await this.sound.loadAsync({ uri: this.getAudioUrl() });
      await this.sound.playAsync();
    } else if (status.isLoaded) {
      this.setState({
        isLoaded: true,
        progress: status.positionMillis / status.durationMillis,
        duration: status.durationMillis
      });
    } else {
      if (status.error) {
        console.log(`FATAL PLAYER ERROR: ${status.error}`);
      }
    }
  }

  getAudioUrl() {
    let lang = 4; // Chinese
    if (getCurrentUser().getLanguage() == 'eng') {
      lang = 1; // English
    } else if (getCurrentUser().getLanguage() == 'spa') {
      lang = 6; // Spanish
    }
    let url = 'http://167.88.37.77/bsf/' + lang + '/' + this.state.currentBook + '/' + this.state.currentChapter + '.mp3';
    console.log(url);
    return url;
  }

  async play() {
    if (!this.sound) {
      try {
        const { sound, status } = await Audio.Sound.create(
          { uri: this.getAudioUrl() },
          { shouldPlay: false },
          this.onPlaybackStatusUpdate.bind(this),
          false
        );
        this.sound = sound;
      } catch (error) {
        alert(error);
        this.setState({ isLoading: false });
        return;
      }
    }
    else {
      if (!this.state.isLoaded) {
        await this.sound.loadAsync({ uri: this.getAudioUrl() });
      }
    }

    this.sound.playFromPositionAsync(this.state.progress * this.state.duration);
    this.setState({ isPlaying: true, isPaused: false, isLoading: false });
    console.log('playing');
    KeepAwake.activate();
  }

  async pause() {
    if (this.sound) {
      await this.sound.pauseAsync();
    }

    this.setState({ isPlaying: false, isPaused: true, isLoading: false });
    console.log('paused');
    KeepAwake.deactivate();
  }

  async _onPlayOrPause() {
    console.log('_onPlayOrPause');
    this.setState({ isLoading: true });
    if (!this.state.isPlaying) {
      this.play();
    } else {
      this.pause();
    }
  }

  async _onStop() {
    if (this.state.isPlaying || this.state.isPaused) {
      this.setState({ isLoading: true, isLoaded: false });
      if (this.sound) {
        await this.sound.stopAsync();
      }
      this.setState({ isPlaying: false, isPaused: false, progress: 0, isLoading: false });
      console.log('stopped');
      KeepAwake.deactivate();
    }
  }

  _onBookSelected = async (id) => {
    let book = audioBookId.find((element) => (element.id == id));
    await this._resetAudio();
    this.setState({
      currentBook: id,
      currentChapter: 1,
      totalChapter: book.chapters,
    });
    await getCurrentUser().setAudioBibleBook(id * 1000 + 1);
    console.log(JSON.stringify(this.state));
  }

  _onChapterSelected = async (chapter) => {
    console.log('_onChapterSelected:' + chapter);
    await this._resetAudio();
    this.setState({ currentChapter: chapter });
    await getCurrentUser().setAudioBibleBook(this.state.currentBook * 1000 + chapter);
  }

  _onSeekSliderValueChange(value) {
    console.log('Seeking: ' + value);
    if (this.sound && this.isPlaying && !this.isSeeking) {
      this.isSeeking = true;
    }
  }

  async _onSeekSliderSlidingComplete(value) {
    console.log('SeekComplete: ' + value);
    if (this.sound != null) {
      this.isSeeking = false;
      this.setState({ progress: value });

      if (this.state.isPlaying) {
        await this.sound.playFromPositionAsync(value * this.state.duration);
      }
    }
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

  render() {
    console.log('State:' + JSON.stringify(this.state));
    const position = this._getMMSSFromMillis(this.state.duration * this.state.progress);
    const duration = this._getMMSSFromMillis(this.state.duration);
    return (
      <View style={{
        flex: 1,
        alignItems: 'center',
        backgroundColor: 'white'
      }}>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ width: 170 }}>
            <Picker
              style={{ alignSelf: 'stretch' }}
              selectedValue={this.state.currentBook}
              onValueChange={this._onBookSelected.bind(this)}>
              {audioBookId.map(s => (
                <Picker.Item label={getI18nBibleBook(s.name)} value={s.id} key={s.id} />
              ))}
            </Picker>
          </View>
          <View style={{ width: 170 }}>
            <Picker
              style={{ alignSelf: 'stretch' }}
              selectedValue={this.state.currentChapter}
              onValueChange={this._onChapterSelected.bind(this)}>
              {
                Array(this.state.totalChapter).fill(0).map((e, i) => i + 1).map(s => (<Picker.Item label={getI18nText('第') + s.toString() + getI18nText('章')} value={s} key={s} />))
              }
            </Picker>
          </View>
        </View>
        {/*
        <Slider
          style={styles.playbackSlider}
          value={this.state.progress}
          onValueChange={this._onSeekSliderValueChange.bind(this)}
          onSlidingComplete={this._onSeekSliderSlidingComplete.bind(this)}
          disabled={this.state.isLoading || !this.state.isLoaded}
        />*/}
        <Text>{position}/{duration}</Text>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
          <TouchableHighlight
            underlayColor={'#FFFFFF'}
            style={styles.wrapper}
            onPress={() => {
              if (!this.state.isLoading) {
                this._onPlayOrPause();
              }
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
              if (!this.state.isLoading) {
                this._onStop();
              }
            }}>
            <FontAwesome
              style={{ marginHorizontal: 30, width: 50 }}
              name='stop'
              size={50}
            />
          </TouchableHighlight>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
  },
});
