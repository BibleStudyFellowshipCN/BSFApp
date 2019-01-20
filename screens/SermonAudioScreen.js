import React from 'react';
import { View, ActivityIndicator, Text, Dimensions, Image, TouchableOpacity } from 'react-native';
import { getI18nText } from '../utils/I18n';
import { getCurrentUser } from '../utils/user';
import { Models } from '../dataStorage/models';
import { callWebServiceAsync, showWebServiceCallErrorsAsync } from '../dataStorage/storage';
import Colors from '../constants/Colors';
import { EventRegister } from 'react-native-event-listeners';
import AudioPlayer from '../components/AudioPlayer';
import { ScrollView } from 'react-native-gesture-handler';

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
      const id = this.props.navigation.state.params.id ? this.props.navigation.state.params.id : '';
      const result = await callWebServiceAsync(Models.AudioInfo.restUri, `/${id}?cellphone=${getCurrentUser().getCellphone()}`, 'GET');
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
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.yellow} />
        </View>);
    }

    if (!this.state.audio || !this.state.audio.lesson || !this.state.audio.message) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 18, margin: 10, fontWeight: 'bold' }}>Network error, please try again later</Text>
        </View>);
    }

    const showNotes = !!(this.state.audio.notes_message && this.state.audio.notes_message.trim().length > 0);
    const showSeminar = !!(this.state.audio.seminar_message && this.state.audio.seminar_message.trim().length > 0);
    const cellphone = getCurrentUser().getCellphone();
    return (
      <ScrollView style={{ flex: 1, backgroundColor: 'white' }}>
        <SermonAudioSection
          title={getI18nText('讲道录音')}
          message={this.state.audio.message}
          width={this.state.windowWidth}
          audio={`http://mycbsf.org:3000/audio/${cellphone}?lesson=${this.state.audio.lesson}&play=1`} />

        {
          showNotes &&
          <SermonAudioSection
            title={getI18nText('经文释义')}
            message={this.state.audio.notes_message}
            width={this.state.windowWidth}
            audio={`http://mycbsf.org:3000/audio/${cellphone}?lesson=${this.state.audio.lesson}&playNotes=1`} />
        }

        {
          showSeminar &&
          <SermonAudioSection
            title={getI18nText('专题讲座')}
            message={this.state.audio.seminar_message}
            width={this.state.windowWidth}
            audio={`http://mycbsf.org:3000/audio/${cellphone}?lesson=${this.state.audio.lesson}&playSeminar=1`} />
        }
      </ScrollView>
    );
  }
}

class SermonAudioSection extends React.Component {

  render() {
    const lines = this.props.message.split('\n');
    let index = 0;
    return (
      <View style={{
        marginTop: 10,
        marginHorizontal: 10,
        borderColor: '#FFE8A1',
        backgroundColor: '#FFF2CC',
        borderWidth: 1,
        borderRadius: 10,
        alignItems: 'center'
      }}>
        <Text style={{ fontSize: 18, margin: 5, fontWeight: 'bold' }}>{this.props.title}</Text>
        {
          lines.map(line => <Text key={index++} style={{ fontSize: 18, left: 0, padding: 1, width: this.props.width - 70 }}>{line.trim()}</Text>)
        }
        <AudioPlayer
          width={this.props.width - 50}
          uri={this.props.audio}
        />
        {/*<View style={{ right: 0 }}>
          <TouchableOpacity>
            <Text>Download</Text>
          </TouchableOpacity>
      </View>*/}
      </View>
    );
  }
}