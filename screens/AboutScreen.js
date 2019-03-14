import React from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions } from 'react-native';
import { getI18nText } from '../utils/I18n';
import { EventRegister } from 'react-native-event-listeners';
import { Constants, Updates } from 'expo';
import { Button } from 'react-native-elements';
import Colors from '../constants/Colors';
import { appVersion } from '../dataStorage/storage';

export default class AboutScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: getI18nText('关于CBSF'),
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
    windowWidth: Dimensions.get('window').width
  };

  componentWillMount() {
    navigateBack = () => this.props.navigation.pop();
    this.listener = EventRegister.addEventListener('screenDimensionChanged', (window) => {
      this.setState({ windowWidth: window.width });
    });
  }

  componentWillUnmount() {
    EventRegister.removeEventListener(this.listener);
  }

  render() {
    const version = `${appVersion} (SDK${Constants.manifest.sdkVersion})`;
    return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={{
          marginTop: 10,
          marginHorizontal: 10,
          borderColor: '#FFE8A1',
          backgroundColor: '#FFF2CC',
          borderWidth: 1,
          borderRadius: 10,
          alignItems: 'center'
        }}>
          <Text style={{ fontSize: 18, marginHorizontal: 20, marginVertical: 10, fontWeight: 'bold' }}>This CBSF app has been developed independently from BSF but with BSF’s permission to post lesson questions. CBSF does not collect any data from BSF members but does provide a link to BSF’s official website for members who wish to gain access to all their lesson materials and supplementary resources.</Text>
        </View>
        <View style={{
          marginTop: 10,
          marginHorizontal: 10,
          borderColor: '#FFE8A1',
          backgroundColor: '#FFF2CC',
          borderWidth: 1,
          borderRadius: 10,
          alignItems: 'center'
        }}>
          <Text style={{ fontSize: 18, marginHorizontal: 20, marginTop: 10, fontWeight: 'bold' }}>{getI18nText('版本')}</Text>
          <Text style={{ fontSize: 18, marginHorizontal: 20, fontWeight: 'bold' }}>{version}</Text>
          <Button
            icon={{ name: "refresh", size: 20, color: "white" }}
            title="Reload"
            buttonStyle={{ backgroundColor: Colors.yellow, margin: 10, borderRadius: 30, paddingLeft: 10, paddingRight: 20 }}
            onPress={() => Updates.reload()}
          />
        </View>
      </View>
    );
  }
}
