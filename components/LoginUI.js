import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  TextInput,
  Button,
  ActivityIndicator,
  Alert
} from 'react-native';
import Layout from '../constants/Layout';
import { getImage } from '../components/ImageMap';
import Colors from '../constants/Colors';
import { Models } from '../dataStorage/models';
import RadioButton from 'radio-button-react-native';
import { getCurrentUser } from '../store/user';

export default class LoginUI extends React.Component {
  cellphone = "4250000000";

  state = {
    busy: false,
    language: Models.Languages[0].Value
  };

  async onLogon() {
    if (!this.cellphone || this.cellphone.trim() == '') {
      this.cellphoneInput.focus();
    } else {
      this.setState({ busy: true });
      const logon = await getCurrentUser().loginAsync(this.cellphone, this.state.language);
      this.setState({ busy: false });
      if (logon) {
        this.props.onUserLogon({ logon: true });
      } else {
        await alert("Please check your network connection or email/password");
      }
    }
  }

  render() {
    let keyIndex = 0;
    return (
      <KeyboardAvoidingView behavior="padding" style={styles.container}>
        <View style={styles.logonContainer}>
          <Image
            style={styles.logo}
            source={getImage('AppIcon')} />
          <ActivityIndicator
            size="large"
            animating={this.state.busy} />
          <TextInput
            ref={(input) => this.cellphoneInput = input}
            style={styles.input}
            defaultValue={this.cellphone}
            placeholder="cellphone"
            placeholderTextColor="rgba(255,255,255,0.7)"
            onChangeText={(text) => this.cellphone = text}
            keyboardType="phone-pad" />
          <View style={styles.langView}>
            {
              Models.Languages.map(item => (
                <RadioButton key={keyIndex++} currentValue={this.state.language} value={item.Value} onPress={() => { this.setState({ language: item.Value }) }} >
                  <Text style={styles.textContent} key={keyIndex++}>{item.DisplayName}</Text>
                </RadioButton>
              ))
            }
          </View>
          <View style={styles.buttonView}>
            <TouchableOpacity style={styles.buttonContainer} onPress={this.onLogon.bind(this)} disabled={this.state.busy}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  logonContainer: {
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120
  },
  input: {
    height: 40,
    width: 240,
    backgroundColor: 'rgba(0,0,0,0.2)',
    marginBottom: 10,
    color: '#FFF',
    paddingHorizontal: 10,
    marginHorizontal: 5,
    borderRadius: 8
  },
  buttonContainer: {
    backgroundColor: Colors.yellow,
    paddingVertical: 10,
    marginHorizontal: 5,
    marginVertical: 1,
    width: 240,
    borderRadius: 8
  },
  buttonText: {
    textAlign: 'center',
    color: '#FFFFFF',
    fontWeight: '700',
  },
  langView: {
    flex: 1,
    flexDirection: 'row',
    maxHeight: 40,
    justifyContent: 'space-between',
    marginVertical: 6
  },
  buttonView: {
    flex: 1,
    flexDirection: 'row',
    maxHeight: 40,
    justifyContent: 'space-between',
    marginVertical: 2
  },
  imageStyle: {
    width: Layout.window.width,
    height: Layout.window.height - 130,
  },
  wrapper: {
  },
  slide: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
