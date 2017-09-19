import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  Picker,
  Slider
} from 'react-native';
import Expo, { Audio } from 'expo';
import { getI18nText, getI18nBibleBook } from '../store/I18n';
import { getCurrentUser } from '../store/user';
import { FontAwesome } from '@expo/vector-icons';

const audioBookId = require('../assets/audioBookId.json');


export default class AudioBibleScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    title = navigation.state.params && navigation.state.params.title ? navigation.state.params.title : '有声圣经';
    return {
      title: getI18nText(title)
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      chapter: 1,
      isPlaying: false,
      isPaused: false,
      isLoading: false,
      isLoaded: false,
      position: 0,
      duration: 0,
      progress: 0
    };
  }

  isSeeking = false;

  componentDidMount() {
    Audio.setIsEnabledAsync(true);
    this._onBookSelected(1);
  }

  componentDidUpdate() {
    //this.props.navigator.updateCurrentRouteParams({ title: getI18nText('有声圣经') });
  }

  _resetAudio = async () => {
    if (this.sound != null) {
      await this.sound.stopAsync();
      await this.sound.unloadAsync();
      this.setState({ isLoaded: false, isPlaying: false, isPaused: false, position: 0, duration: 0, progress: 0 });
      console.log('reset');
      this.sound = null;
    }
  }

  _callback = status => {
    if (status.isLoaded) {
      this.setState({
        isLoaded: true,
        progress: status.positionMillis / status.durationMillis,
        duration: status.durationMillis,
        position: status.positionMillis
      });
    } else {
      if (status.error) {
        console.log(`FATAL PLAYER ERROR: ${status.error}`);
      }
    }
  };

  async _onPlayOrPause() {
    this.setState({ isLoading: true });
    if (!this.state.isPlaying) {
      if (!this.sound) {
        let lang = 4; // Chinese
        if (getCurrentUser().getLanguage() == 'eng') {
          lang = 1; // English
        } else if (getCurrentUser().getLanguage() == 'spa') {
          lang = 6; // Spanish
        }
        let uri = 'http://167.88.37.77/bsf/' + lang + '/' + this.state.id + '/' + this.state.currentChapter + '.mp3';
        console.log(uri);
        try {
          const { sound, status } = await Audio.Sound.create(
            { uri },
            { shouldPlay: false },
            this._callback
          );
          this.sound = sound;
        } catch (error) {
          alert(error);
          this.setState({ isLoading: false });
          return;
        }
      }

      await this.sound.playAsync();
      this.setState({ isPlaying: true, isPaused: false, isLoading: false });
      console.log('playing');
    } else {
      await this.sound.pauseAsync();
      this.setState({ isPlaying: false, isPaused: true, isLoading: false });
      console.log('paused');
    }
  }

  async _onStop() {
    if (this.state.isPlaying || this.state.isPaused) {
      this.setState({ isLoading: true, isLoaded: false });
      await this.sound.stopAsync();
      this.setState({ isPlaying: false, isPaused: false, position: 0, progress: 0, isLoading: false });
      console.log('stopped');
    }
  }

  _onBookSelected = async (id) => {
    let book = audioBookId.find((element) => (element.id == id));
    await this._resetAudio();
    this.setState({
      id,
      name: book.name,
      currentChapter: 1,
      totalChapter: book.chapters,
    });
    console.log(JSON.stringify(this.state));
  }

  _onChapterSelected = async (chapter) => {
    console.log(chapter);
    await this._resetAudio();
    this.setState({ currentChapter: chapter });
  }

  _onSeekSliderValueChange(value) {
    if (this.sound && !this.isSeeking) {
      this.isSeeking = true;
      this.sound.pauseAsync();
    }
  }

  async _onSeekSliderSlidingComplete(value) {
    if (this.sound != null) {
      this.isSeeking = false;
      const seekPosition = value * this.state.duration;
      console.log('Seek: ' + seekPosition);
      this.setState({ progress: seekPosition });
      this.sound.playFromPositionAsync(seekPosition);
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
    console.log(JSON.stringify(this.state));
    const position = this._getMMSSFromMillis(this.state.position);
    const duration = this._getMMSSFromMillis(this.state.duration);
    return (
      <View style={{
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <View style={{ width: 170 }}>
            <Picker
              style={{ alignSelf: 'stretch' }}
              selectedValue={this.state.id}
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
        <Slider
          style={styles.playbackSlider}
          value={this.state.progress}
          onValueChange={this._onSeekSliderValueChange.bind(this)}
          onSlidingComplete={this._onSeekSliderSlidingComplete.bind(this)}
          disabled={this.state.isLoading || !this.state.isLoaded}
        />
        <Text>{position}/{duration}</Text>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', }}>
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
  container: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: '#FFFFFF',
  },
  wrapper: {
  },
  playText: {
    marginTop: 40,
    fontSize: 36,
  },
  playbackSlider: {
    alignSelf: 'stretch',
  }
});
