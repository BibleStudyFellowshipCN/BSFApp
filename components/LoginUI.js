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

export default class LoginUI extends React.Component {
  cellphone = "4250001111";

  state = {
    busy: false,
    language: "CHS"
  };

  async onLogon() {
    if (!this.cellphone || this.cellphone.trim() == '') {
      this.cellphoneInput.focus();
    } else {
      this.setState({ busy: true });
      const loggedOn = true; //await getCurrentUser().login(this.email, this.password);
      this.setState({ busy: false });
      if (loggedOn) {
        this.props.onUserLogon({ logon: true });
      } else {
        await alert("Please check your network connection or email/password");
      }
    }
  }

  render() {
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
          {
            Models.Languages.map(item => (
              <RadioButton key={keyIndex++} currentValue={this.state.language} value={item.Value} onPress={() => { this.setState({ language: item.Value }) }} >
                <Text style={styles.textContent} key={keyIndex++}>{item.DisplayName}</Text>
              </RadioButton>
            ))
          }
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
