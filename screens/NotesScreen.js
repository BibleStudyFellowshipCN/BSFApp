import React from 'react';
import { getI18nText } from '../store/I18n';
import { WebView } from 'react-native';

export default class HomeTrainingScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: getI18nText('经文释义') + navigation.state.params.title
    };
  };

  render() {
    return (<WebView source={{ uri: this.props.navigation.state.params.uri }} />);
  }
}
