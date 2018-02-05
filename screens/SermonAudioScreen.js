import React from 'react';
import { ScrollView, StyleSheet, View, Alert, WebView } from 'react-native';
import { getI18nText } from '../store/I18n';
import { getCurrentUser } from '../store/user';
import { KeepAwake } from 'expo';

export default class SermonAudioScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: getI18nText('讲道录音')
    };
  };

  componentWillMount() {
    KeepAwake.activate();
  }

  componentWillUnmount() {
    KeepAwake.deactivate();
  }

  render() {
    const uri = 'http://cbsf.southcentralus.cloudapp.azure.com/bsf/audio.php?cellphone=' + getCurrentUser().getCellphone();
    return (
      <WebView
        source={{ uri }}
      />
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
