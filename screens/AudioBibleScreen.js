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
import getI18nText from '../store/I18n';
import { getCurrentUser } from '../store/user';

const audioBookId = require('../assets/audioBookId.json');

export default class AudioBibleScreen extends React.Component {
  static route = {
    navigationBar: {
      title(params) {
        return getI18nText('有声圣经');
      }
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

  _onPlayPausePressed = async () => {
    if (this.sound == null) {
      let lang = 4; // Chinese
      if (getCurrentUser().getLanguage() == 'eng') {
        lang = 1; // English
      }
      let url = 'http://wpaorg.wordproject.com/bibles/app/audio/' + lang + '/' + this.state.id + '/' + this.state.currentChapter + '.mp3';
      console.log(url);
      this.sound = new Expo.Audio.Sound({ source: url });
      // [Wei] setCallback doesn't work!!!
      //await this.sound.setCallback(this._audioCallback);
      await this.sound.loadAsync();
      await this.sound.playAsync();
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
                <Picker.Item label={getI18nText(s.name)} value={s.id} key={s.id} />
              ))}
            </Picker>
          </View>
          <View style={{ width: 170 }}>
            <Picker
              style={{ alignSelf: 'stretch' }}
              selectedValue={this.state.currentChapter}
              onValueChange={this._onChapterSelected}>
              {
                Array(this.state.totalChapter).fill(0).map((e, i) => i + 1).map(s => (<Picker.Item label={getI18nText('第') + s.toString() + getI18nText('章')} value={s} key={s} />))
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
              {this.state.isPlaying ? getI18nText("暂停") : getI18nText("播放")}
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
