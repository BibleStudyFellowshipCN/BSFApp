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
import AudioPlayer from '../components/AudioPlayer';

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

  getAudioUrl() {
    return `http://mycbsf.org/mp3/${this.state.currentVersion}/${this.state.currentBook}/${this.state.currentChapter}.mp3`;
  }

  async updateAudio(play) {
    await this.audioPlayer.resetAudio();
    await this.audioPlayer.loadAsync(this.getAudioUrl());
    if (play) {
      await this.audioPlayer.playAsync();
    }
  }

  async _onBookSelected(id) {
    let book = audioBookId.find((element) => (element.id == id));
    this.setState({ currentBook: id, currentChapter: 1, totalChapter: book.chapters });
    await getCurrentUser().setAudioBibleBook(this.state.currentVersion * 1000 * 1000 + id * 1000 + 1);
    await this.updateAudio();
  }

  async _onChapterSelected(chapter) {
    this.setState({ currentChapter: chapter });
    await getCurrentUser().setAudioBibleBook(this.state.currentVersion * 1000 * 1000 + this.state.currentBook * 1000 + chapter);
    await this.updateAudio();
  }

  async _onVersionSelected(value) {
    this.setState({ currentVersion: value });
    await getCurrentUser().setAudioBibleBook(value * 1000 * 1000 + this.state.currentBook * 1000 + this.state.currentChapter);
    await this.updateAudio();
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

  async onFinished() {
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

    await this.updateAudio(true);
  }

  render() {
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
          <AudioPlayer
            ref={ref => this.audioPlayer = ref}
            width={this.state.width - 15}
            uri={this.getAudioUrl()}
            onFinished={this.onFinished.bind(this)}
          />
        </View>
      </ScrollView>
    );
  }
}
