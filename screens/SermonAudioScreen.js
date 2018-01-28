import React from 'react';
import { ScrollView, StyleSheet, View, Alert, WebView } from 'react-native';
import { getI18nText } from '../store/I18n';
import { Button } from 'react-native-elements';
import { getCurrentUser } from '../store/user';

export default class SermonAudioScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: getI18nText('讲道录音')
    };
  };

  render() {
    const html = '<body oncontextmenu="return false">' +
      '<audio controls="true" autoplay="true" controlsList="nodownload">' +
      '<source src="http://cbsf.southcentralus.cloudapp.azure.com:3000/audio/' + getCurrentUser().getCellphone() + '?play=1" type="audio/mpeg">' +
      'Your browser does not support the audio element.' +
      '</audio>' +
      '</body>';
    return (
      <WebView source={{ html }} />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cellphoneInput: {
    margin: 10,
    height: 80,
    fontSize: 24,
    padding: 5,
    backgroundColor: 'whitesmoke',
  }
});
