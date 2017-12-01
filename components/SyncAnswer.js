import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Alert,
  Share,
  Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { loadAsync } from '../dataStorage/storage';
import { Models } from '../dataStorage/models';
import { getI18nText } from '../store/I18n';

export default class SyncAnswer extends React.Component {

  async onClick() {
    try {
      const answerContent = await loadAsync(Models.Answer, null, false);
      console.log(JSON.stringify(answerContent));
      alert(JSON.stringify(answerContent));
    } catch (error) {
      console.log(error);
      Alert.alert("Error", error);
      return;
    }
  }

  render() {
    return (
      <View style={styles.container}>
        {/*<TouchableOpacity onPress={this.onClick.bind(this)}>
          <MaterialCommunityIcons
            name='cloud-sync'
            size={28}
            color='#fff' />
    </TouchableOpacity>*/}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 54,
    marginTop: 8
  }
});
