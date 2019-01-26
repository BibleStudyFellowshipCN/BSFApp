import { Alert } from 'react-native';
import { Audio, KeepAwake } from 'expo';

export default class Sound {
  get state() {
    return {
      isPlaying: this.isPlaying,
      isLoaded: this.isLoaded
    }
  };

  soundState = {
    soundObject: null,
    isLoaded: false,
    isPlaying: false
  };

  async enableAsync(onPlaybackStatusUpdate) {
    if (this.soundState.soundObject) {
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

      this.soundState.soundObject = new Audio.Sound();
      this.soundState.soundObject.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
    } catch (error) {
      console.log(JSON.stringify(error));
    }
  }

  async resetAsync() {
    if (!this.soundState.soundObject) {
      console.log(`Sound:resetAsync:soundObject is null`);
      return;
    }

    console.log('Sound:reset');
    try {
      if (this.soundState.isPlaying) {
        await this.soundState.soundObject.stopAsync();
        this.soundState.isPlaying = false;
      }

      if (this.soundState.isLoaded) {
        await this.soundState.soundObject.unloadAsync();
        this.soundState.isLoaded = false;
      }

      KeepAwake.deactivate();
    } catch (error) {
      console.log(JSON.stringify(error));
    }
  }

  async loadAsync(uri) {
    if (!this.soundState.soundObject) {
      console.log(`Sound:loadAsync:soundObject is null`);
      return;
    }

    console.log(`Sound:loadAsync:${uri}`);

    this.resetAsync();

    try {
      await this.soundState.soundObject.loadAsync({ uri });
      this.soundState.isLoaded = true;
    } catch (error) {
      console.log(JSON.stringify(error));
    }
  }

  async playAsync() {
    if (!this.soundState.soundObject) {
      console.log(`Sound:playAsync:soundObject is null`);
      return;
    }

    if (this.soundState.isPlaying) {
      return;
    }

    console.log('Sound:playing');

    try {
      await this.soundState.soundObject.playAsync();
      this.soundState.isPlaying = true;
      KeepAwake.activate();
    } catch (error) {
      console.log(JSON.stringify(error));
    }
  }

  async pauseAsync() {
    if (!this.soundState.soundObject) {
      console.log(`Sound:pauseAsync:soundObject is null`);
      return;
    }

    if (!this.soundState.isPlaying) {
      return;
    }

    console.log('Sound:paused');
    try {
      await this.soundState.soundObject.pauseAsync();
      this.soundState.isPlaying = false;
      KeepAwake.deactivate();
    } catch (error) {
      console.log(JSON.stringify(error));
    }
  }

  async playFromPositionAsync(positionMillis) {
    if (!this.soundState.soundObject) {
      console.log(`Sound:playFromPositionAsync:soundObject is null`);
      return;
    }

    await this.pauseAsync();

    console.log(`Sound:playFromPositionAsync:${positionMillis}`);
    try {
      await this.soundState.soundObject.playFromPositionAsync(positionMillis);
      this.soundState.isPlaying = true;
      KeepAwake.activate();
    } catch (error) {
      console.log(JSON.stringify(error));
    }
  }
}
