import React from 'react';
import { getI18nText } from '../store/I18n';
import { getCurrentUser } from '../store/user';

import { Button, Text, View, StyleSheet } from 'react-native';
import { Constants, WebBrowser } from 'expo';

//export default class MyBSFScreen extends Component {
export default class MyBSFScreen extends React.Component {
  state = {
    result: null,
  };

  render() {
    return (
      <View style={styles.container}>
        <Button
          style={styles.paragraph}
          title="Open MyBSF.org"
          onPress={this._handlePressButtonAsync}
        />        
      </View>
    );
  }

  _handlePressButtonAsync = async () => {

    let result = await WebBrowser.openAuthSessionAsync('https://www.mybsf.org');
    
    this.setState({ result });
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1',
  },
});
