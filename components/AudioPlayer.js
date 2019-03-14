import React from 'react';
import {
  View,
  TouchableHighlight,
  Text
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Sound from '../utils/sound';
import { Slider } from 'react-native-elements'
import Colors from '../constants/Colors';

export default class AudioPlayer extends React.Component {
  state = {
    isLoaded: false,
    isPlaying: false,
    duration: 0,
    progress: 0,
    error: null
  };

  soundInstance = new Sound();

  componentWillMount() {
    this.init();
  }

  componentWillUnmount() {
    this.soundInstance.resetAsync();
  }

  async init() {
    await this.soundInstance.enableAsync(this.onPlaybackStatusUpdate.bind(this));
    await this.loadAsync(this.props.uri);
  }

  async resetAudio() {
    await this.soundInstance.resetAsync();

    await this.setState({
      isLoaded: false,
      isPlaying: false,
      duration: 0,
      progress: 0,
      error: null
    });
  }

  async onPlaybackStatusUpdate(status) {
    if (status.isLoaded && !this.isSeeking) {
      await this.setState({
        progress: status.positionMillis / status.durationMillis,
        duration: status.durationMillis
      });
    }

    if (status.didJustFinish || status.progress == 1) {
      // console.log('didJustFinish');
      if (this.props.onFinished) {
        this.props.onFinished();
      }
    }

    if (status.error) {
      // console.log(status.error);
      await this.resetAudio();
      await this.setState({ error: status.error });
    }
  }

  async loadAsync(uri) {
    console.log('loadAsync:' + uri);
    await this.setState({ uri, isLoaded: false });

    await this.soundInstance.loadAsync(uri);
    await this.setState({ isLoaded: true });
  }

  async playAsync() {
    await this.soundInstance.playAsync();
    await this.setState({ isPlaying: true });
  }

  async play() {
    await this.soundInstance.playFromPositionAsync(this.state.progress * this.state.duration);
    await this.setState({ isPlaying: true });
  }

  async pause() {
    await this.soundInstance.pauseAsync();
    await this.setState({ isPlaying: false });
  }

  getMMSSFromMillis(millis) {
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

  onSeekSliderValueChange(value) {
    // console.log('Seeking: ' + value);
    if (!this.isSeeking) {
      this.isSeeking = true;
    }

    this.setState({ progress: value });
  }

  async onSeekSliderSlidingComplete(value) {
    console.log('SeekComplete: ' + value);
    if (!this.isSeeking) {
      return;
    }
    this.isSeeking = false;
    this.setState({ progress: value });

    if (this.state.isPlaying) {
      await this.soundInstance.playFromPositionAsync(value * this.state.duration);
    }
  }

  async onPlayOrPauseOrReload() {
    if (this.state.error) {
      console.log('Error, reload the audio');
      await this.resetAudio();
      await this.loadAsync(this.state.uri);
      await this.playAsync();
      return;
    }

    if (this.state.isLoaded) {
      this.state.isPlaying ? this.pause() : this.play();
    }
  }

  render() {
    const position = this.getMMSSFromMillis(this.state.duration * this.state.progress);
    const duration = this.getMMSSFromMillis(this.state.duration);
    const width = Math.max(this.props.width || 330, 330);
    const height = Math.max(this.props.height || 40, 40);
    const color = this.props.color ? this.props.color : Colors.yellow;
    return (
      <View style={{
        flexDirection: 'row',
        backgroundColor: this.props.backgroundColor ? this.props.backgroundColor : '#202020',
        borderRadius: 40,
        alignItems: 'center',
        width,
        height,
        margin: 10
      }}>
        <TouchableHighlight
          underlayColor={'#0000'}
          style={{
            marginLeft: 15,
            width: 30
          }}
          onPress={() => {
            this.onPlayOrPauseOrReload();
          }}>
          <FontAwesome
            color={color}
            name={this.state.error ? 'refresh' : this.state.isLoaded ? (this.state.isPlaying ? 'pause' : 'play') : 'hand-stop-o'}
            size={28}
          />
        </TouchableHighlight>
        <Text style={{ width: 90, color }}>{position}/{duration}</Text>
        <Slider
          style={{
            alignSelf: 'stretch',
            width: width - 150
          }}
          thumbTintColor={Colors.yellow}
          minimumTrackTintColor={'#FFB900'}
          maximumTrackTintColor={'#525E54'}
          value={this.state.progress}
          onValueChange={this.onSeekSliderValueChange.bind(this)}
          onSlidingComplete={this.onSeekSliderSlidingComplete.bind(this)}
          disabled={!this.state.isLoaded}
        />
      </View>
    );
  }
}
