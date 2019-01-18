import React from 'react';
import { View, ActivityIndicator, Text, Dimensions, Image, TouchableOpacity } from 'react-native';
import { getI18nText } from '../store/I18n';
import { getCurrentUser } from '../store/user';
import { Models } from '../dataStorage/models';
import { callWebServiceAsync, showWebServiceCallErrorsAsync } from '../dataStorage/storage';
import Colors from '../constants/Colors';
import { EventRegister } from 'react-native-event-listeners';
import AudioPlayer from '../components/AudioPlayer';

export default class SermonAudioScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: getI18nText('课程资料'),
      headerLeft: (
        <View style={{ marginLeft: 10 }}>
          <TouchableOpacity onPress={() => navigateBack()}>
            <Image
              style={{ width: 34, height: 34 }}
              source={require('../assets/images/GoBack.png')} />
          </TouchableOpacity>
        </View>)
    };
  };

  state = {
    busy: true,
    audio: null,
    windowWidth: Dimensions.get('window').width
  };

  componentWillMount() {
    navigateBack = () => this.props.navigation.pop();
    this.listener = EventRegister.addEventListener('screenDimensionChanged', (window) => {
      this.setState({ windowWidth: window.width });
    });

    this.loadAsync();
  }

  async loadAsync() {
    try {
      this.setState({ busy: true });
      const result = await callWebServiceAsync(Models.AudioInfo.restUri, `/${this.props.navigation.state.params.id}?cellphone=${getCurrentUser().getCellphone()}`, 'GET');
      const succeed = await showWebServiceCallErrorsAsync(result, 200);
      if (succeed) {
        this.setState({ audio: result.body });
        console.log('loadAsync: ' + JSON.stringify(this.state));
      }
    }
    finally {
      this.setState({ busy: false });
    }
  }

  componentWillUnmount() {
    EventRegister.removeEventListener(this.listener);
  }

  render() {
    if (this.state.busy) {
      return (
        <ActivityIndicator
          style={{
            position: 'absolute',
            top: 20,
            left: this.state.windowWidth / 2 - 20
          }}
          size="large"
          color={Colors.yellow} />);
    }

    if (!this.state.audio || !this.state.audio.lesson || !this.state.audio.message) {
      return <Text>Network error, please try again later</Text>
    }

    return (
      <View style={{ flex: 1 }}>
        <Text>{this.state.audio.message}</Text>
        <AudioPlayer
          ref={ref => this.audioPlayer1 = ref}
          width={this.state.windowWidth - 15}
          uri={`http://mycbsf.org:3000/audio/4255162615?lesson=${this.state.audio.lesson}&play=1`}
        />

        {
          this.state.audio.notes_message && this.state.audio.notes_message.length > 0 &&
          <View>
            <Text>{this.state.audio.notes_message}</Text>
            <AudioPlayer
              ref={ref => this.audioPlayer2 = ref}
              width={this.state.windowWidth - 15}
              uri={`http://mycbsf.org:3000/audio/4255162615?lesson=${this.state.audio.lesson}&playNotes=1`}
            />
          </View>
        }

        {
          this.state.audio.seminar_message && this.state.audio.seminar_message.length > 0 &&
          <View>
            <Text>{this.state.audio.seminar_message}</Text>
            <AudioPlayer
              ref={ref => this.audioPlayer3 = ref}
              width={this.state.windowWidth - 15}
              uri={`http://mycbsf.org:3000/audio/4255162615?lesson=${this.state.audio.lesson}&playSeminar=1`}
            />
          </View>
        }
      </View>
    );
  }
}
