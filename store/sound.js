import { Alert } from 'react-native';
import { Audio, KeepAwake } from 'expo';

soundState = {
  soundObject: null,
  isLoaded: false,
  isPlaying: false
};

const singleton = Symbol();
const singletonEnforcer = Symbol();

export default class Sound {
  constructor(enforcer) {
    if (enforcer != singletonEnforcer) throw 'Cannot construct singleton';
  }

  static get instance() {
    if (!this[singleton]) {
      this[singleton] = new Sound(singletonEnforcer);
    }
    return this[singleton];
  }

  get state() {
    return {
      isPlaying: this.isPlaying,
      isLoaded: this.isLoaded
    }
  }

  async enableAsync(onPlaybackStatusUpdate) {
    if (soundState.soundObject) {
      console.log(`Sound:resetAsync:soundObject is already initialized`);
      return;
    }

    console.log('Sound:enable');
    try {
      await Audio.setIsEnabledAsync(true);
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        allowsRecordingIOS: false,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DUCK_OTHERS,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false
      });

      soundState.soundObject = new Expo.Audio.Sound();
      soundState.soundObject.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
    } catch (error) {
      Alert.alert('Error', JSON.stringify(error));
    }
  }

  async resetAsync() {
    if (!soundState.soundObject) {
      console.log(`Sound:resetAsync:soundObject is null`);
      return;
    }

    console.log('Sound:reset');
    try {
      if (soundState.isPlaying) {
        await soundState.soundObject.stopAsync();
        soundState.isPlaying = false;
      }

      if (soundState.isLoaded) {
        await soundState.soundObject.unloadAsync();
        soundState.isLoaded = false;
      }

      KeepAwake.deactivate();
    } catch (error) {
      Alert.alert('Error', JSON.stringify(error));
    }
  }

  async loadAsync(uri) {
    if (!soundState.soundObject) {
      console.log(`Sound:loadAsync:soundObject is null`);
      return;
    }

    console.log(`Sound:loadAsync:${uri}`);

    this.resetAsync();

    try {
      await soundState.soundObject.loadAsync({ uri });
      soundState.isLoaded = true;
    } catch (error) {
      Alert.alert('Error', JSON.stringify(error));
    }
  }

  async playAsync() {
    if (!soundState.soundObject) {
      console.log(`Sound:playAsync:soundObject is null`);
      return;
    }

    if (soundState.isPlaying) {
      return;
    }

    console.log('Sound:playing');

    try {
      await soundState.soundObject.playAsync();
      soundState.isPlaying = true;
      KeepAwake.activate();
    } catch (error) {
      Alert.alert('Error', JSON.stringify(error));
    }
  }

  async pauseAsync() {
    if (!soundState.soundObject) {
      console.log(`Sound:pauseAsync:soundObject is null`);
      return;
    }

    if (!soundState.isPlaying) {
      return;
    }

    console.log('Sound:paused');
    try {
      await soundState.soundObject.pauseAsync();
      soundState.isPlaying = false;
      KeepAwake.deactivate();
    } catch (error) {
      Alert.alert('Error', JSON.stringify(error));
    }
  }

  async playFromPositionAsync(positionMillis) {
    if (!soundState.soundObject) {
      console.log(`Sound:playFromPositionAsync:soundObject is null`);
      return;
    }

    await this.pauseAsync();

    console.log(`Sound:playFromPositionAsync:${positionMillis}`);
    try {
      await soundState.soundObject.playFromPositionAsync(positionMillis);
    } catch (error) {
      Alert.alert('Error', JSON.stringify(error));
    }
  }
}
