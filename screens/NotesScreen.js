import React from 'react';
import { getI18nText } from '../store/I18n';
import { WebView, View, ActivityIndicator } from 'react-native';
import Layout from '../constants/Layout';
import Colors from '../constants/Colors';

export default class HomeTrainingScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: getI18nText('经文释义') + navigation.state.params.title
    };
  };

  state = {
    loading: true
  };

  render() {
    return (
      <View style={{ flex: 1 }}>
        <WebView
          source={{ uri: this.props.navigation.state.params.uri }}
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
