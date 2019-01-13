import React from 'react';
import { getI18nText } from '../store/I18n';
import { WebView, View, ActivityIndicator, Dimensions } from 'react-native';
import Colors from '../constants/Colors';
import { EventRegister } from 'react-native-event-listeners';

export default class MyBSFScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: getI18nText('MyBSF.org')
    };
  };

  state = {
    loading: true,
    windowWidth: Dimensions.get('window').width
  };

  componentWillMount() {
    this.listener = EventRegister.addEventListener('screenDimensionChanged', (window) => {
      this.setState({ windowWidth: window.width });
    });
  }

  componentWillUnmount() {
    EventRegister.removeEventListener(this.listener);
  }

  render() {
    const uri = 'https://www.mybsf.org';
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
