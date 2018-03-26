import React from 'react';
import { ScrollView, StyleSheet, View, ActivityIndicator, WebView } from 'react-native';
import { getI18nText } from '../store/I18n';
import { getCurrentUser } from '../store/user';
import { KeepAwake } from 'expo';
import Layout from '../constants/Layout';
import Colors from '../constants/Colors';

export default class SermonAudioScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: getI18nText('讲道录音')
    };
  };

  state = {
    loading: true
  };

  componentWillMount() {
    KeepAwake.activate();
  }

  componentWillUnmount() {
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
              left: Layout.window.width / 2 - 20
            }}
            size="large"
            color={Colors.yellow} />
        }
      </View>
    );
  }
}
