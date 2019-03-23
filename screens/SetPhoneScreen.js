import React from 'react';
import { StyleSheet, View, ActivityIndicator, TextInput, KeyboardAvoidingView, Image, TouchableOpacity } from 'react-native';
import { getI18nText } from '../utils/I18n';
import { getCurrentUser } from '../utils/user';
import { Overlay } from 'react-native-elements';
import Colors from '../constants/Colors';

export default class SetPhoneScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: getI18nText('设置手机号码'),
      headerLeft: (
        <View style={{ marginLeft: 10 }}>
          <TouchableOpacity onPress={() => onSubmit()}>
            <Image
              style={{ width: 34, height: 34 }}
              source={require('../assets/images/Ok.png')} />
          </TouchableOpacity>
        </View>)
    };
  };

  state = {
    cellphone: getCurrentUser().getCellphone(),
    busy: false
  }

  componentWillMount() {
    navigateBack = () => this.props.navigation.pop();
    onSubmit = () => this.onSubmit();
  }

  componentDidMount() {
    this.cellphoneInput.focus();
  }

  async onSubmit() {
    try {
      this.setState({ busy: true });

      await getCurrentUser().setCellphoneAsync(this.state.cellphone);
    }
    finally {
      this.setState({ busy: false });
    }

    this.props.navigation.state.params.refresh();
    this.props.navigation.goBack();
  }

  render() {
    return (
      <KeyboardAvoidingView style={styles.container} behavior='padding' keyboardVerticalOffset={0}>
        <View style={{ flex: 1, backgroundColor: 'white' }}>
          <TextInput
            style={styles.cellphoneInput}
            ref={(input) => this.cellphoneInput = input}
            keyboardType='phone-pad'
            defaultValue={this.state.cellphone}
            blurOnSubmit={false}
            placeholder={getI18nText('手机号码')}
            onChangeText={(text) => { this.setState({ cellphone: text }); }}
            onSubmitEditing={this.onSubmit.bind(this)}
          />
        </View>
        {
          this.state.busy &&
          <Overlay isVisible
            windowBackgroundColor="rgba(255, 255, 255, .5)"
            width="auto"
            height="auto">
            <ActivityIndicator
              style={{ justifyContent: 'center', alignItems: 'center' }}
              size='large'
              color={Colors.yellow} />
          </Overlay>
        }
      </KeyboardAvoidingView>
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
