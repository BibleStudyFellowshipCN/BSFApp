import React from 'react';
import { View, ActivityIndicator, WebView, Dimensions, Image, TouchableOpacity } from 'react-native';
import { getI18nText } from '../store/I18n';
import { getCurrentUser } from '../store/user';
import { KeepAwake } from 'expo';
import Colors from '../constants/Colors';
import { EventRegister } from 'react-native-event-listeners';

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
    loading: true,
    windowWidth: Dimensions.get('window').width
  };

  componentWillMount() {
    navigateBack = () => this.props.navigation.pop();
    this.listener = EventRegister.addEventListener('screenDimensionChanged', (window) => {
      this.setState({ windowWidth: window.width });
    });

    KeepAwake.activate();
  }

  componentWillUnmount() {
    EventRegister.removeEventListener(this.listener);

    KeepAwake.deactivate();
  }

  render() {
    let uri = 'http://mycbsf.org/audio.php?cellphone=' + getCurrentUser().getCellphone();
    if (this.props.navigation.state.params.id) {
      uri += '&lesson=' + this.props.navigation.state.params.id;
    }
    return (
      <View style={{ flex: 1 }}>
        <WebView
          source={{ uri }}
          onLoadEnd={() => {
            this.setState({ loading: false })
          }}
          onLoadStart={() => {
            this.setState({ loading: true })
          }}
        />
        {
          this.state.loading &&
          <ActivityIndicator
            style={{
              position: 'absolute',
              top: 20,
              left: this.state.windowWidth / 2 - 20
            }}
            size="large"
            color={Colors.yellow} />
        }
      </View>
    );
  }
}
