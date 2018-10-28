import React from 'react';
import { ScrollView, StyleSheet, View, Alert, TextInput, KeyboardAvoidingView, Keyboard } from 'react-native';
import { getI18nText } from '../store/I18n';
import { Button } from 'react-native-elements';
import { getCurrentUser } from '../store/user';

export default class SetPhoneScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: getI18nText('设置手机号码')
    };
  };

  state = {
    cellphone: getCurrentUser().getCellphone(),
    busy: false
  }

  async onSubmit() {
    try {
      this.setState({ busy: true });

      await getCurrentUser().setCellphoneAsync(this.state.cellphone);
      this.props.navigation.state.params.refresh();
      this.props.navigation.goBack();
    }
    finally {
      this.setState({ busy: false });
    }
  }

  render() {
    return (
      <KeyboardAvoidingView style={styles.container} behavior='padding' keyboardVerticalOffset={0}>
        <ScrollView
          style={{ backgroundColor: 'white' }}
          ref={ref => this.scrollView = ref}>
          <View style={{ backgroundColor: 'white' }}>
            <TextInput
              style={styles.cellphoneInput}
              ref={(input) => this.cellphoneInput = input}
              keyboardType='phone-pad'
              defaultValue={this.state.cellphone}
              blurOnSubmit={false}
              placeholder={getI18nText('手机号码')}
              onChangeText={(text) => { this.setState({ cellphone: text }); }}
            />
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Button
                disabled={this.state.busy}
                backgroundColor='#397EDC'
                borderRadius={5}
                containerViewStyle={{ width: 130 }}
                title={getI18nText('提交')}
                onPress={this.onSubmit.bind(this)} />
            </View>
          </View>
        </ScrollView>
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
