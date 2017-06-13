// TODO: Use Redux and with better UX

import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  Picker,
  Button,
} from 'react-native';
import Expo, { Audio } from 'expo';

const audioBookId = require('../assets/audioBookId.json');

export default class AudioBibleScreen extends React.Component {
  static route = {
    navigationBar: {
      title: '有声圣经',
    },
  };

  constructor(props) {
    super(props);
    this.sound = null;
    this.state = {
      chapter: 1,
      isPlaying: false,
    };
  }

  componentDidMount() {
    Audio.setIsEnabledAsync(true);
    this._onBookSelected(1);
  }

  _resetAudio = async () => {
    if (this.sound != null) {
      await this.sound.stopAsync();
      await this.sound.unloadAsync();
      this.sound = null;
      this.setState({ isPlaying: false });
    }
  }

  _callback = status => {
    //console.log(JSON.stringify(status));
    if (status.isLoaded) {
      /*this.setState({
        playbackInstancePosition: status.positionMillis,
        playbackInstanceDuration: status.durationMillis,
        shouldPlay: status.shouldPlay,
        isPlaying: status.isPlaying,
        isBuffering: status.isBuffering,
        rate: status.rate,
        muted: status.isMuted,
        volume: status.volume,
        loopingType: status.isLooping ? LOOPING_TYPE_ONE : LOOPING_TYPE_ALL,
        shouldCorrectPitch: status.shouldCorrectPitch,
      });*/
    } else {
      if (status.error) {
        console.log(`FATAL PLAYER ERROR: ${status.error}`);
      }
    }
  };

  _onPlayPausePressed = async () => {
    console.log(JSON.stringify(this.state));
    if (this.sound == null) {
      let uri = 'http://wpaorg.wordproject.com/bibles/app/audio/4/' + this.state.id + '/' + this.state.currentChapter + '.mp3';
      console.log(uri);

      const source = { uri };
      const initialStatus = {
        shouldPlay: true,

      };
      const { instance, status } = await Audio.Sound.create(
        source,
        initialStatus,
        this._callback
      );
      this.sound = instance;
      this.setState({ isPlaying: true });
    }
    else if (this.state.isPlaying) {
      console.log("Pause")
      this.sound.pauseAsync();
      this.setState({ isPlaying: false });
    } else {
      console.log("Play")
      this.sound.playAsync();
      this.setState({ isPlaying: true });
    }
  }

  _onBookSelected = (id) => {
    let book = audioBookId.find((element) => (element.id == id));
    this._resetAudio();
    this.setState({
      id,
      name: book.name,
      currentChapter: 1,
      totalChapter: book.chapters,
    });
    console.log(JSON.stringify(this.state));
  }

  _onChapterSelected = (chapter) => {
    console.log(chapter);
    this._resetAudio();
    this.setState({ currentChapter: chapter });
  }

  render() {
    console.log(JSON.stringify(this.state));
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
              onValueChange={this._onBookSelected}>
              {audioBookId.map(s => (
                <Picker.Item label={s.name} value={s.id} key={s.id} />
              ))}
            </Picker>
          </View>
          <View style={{ width: 170 }}>
            <Picker
              style={{ alignSelf: 'stretch' }}
              selectedValue={this.state.currentChapter}
              onValueChange={this._onChapterSelected}>
              {
                Array(this.state.totalChapter).fill(0).map((e, i) => i + 1).map(s => (<Picker.Item label={'第' + s.toString() + '章'} value={s} key={s} />))
              }
            </Picker>
          </View>
        </View>
        <View style={{ flex: 1, flexDirection: 'column', alignItems: 'center', }}>
          <TouchableHighlight
            underlayColor={'#FFFFFF'}
            style={styles.wrapper}
            onPress={this._onPlayPausePressed}>
            <Text style={styles.playText}>
              {this.state.isPlaying ? "暂停" : "播放"}
            </Text>
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
});
