import React from 'react';
import { ScrollView, StyleSheet, View, Alert, Text } from 'react-native';
import { getI18nText } from '../store/I18n';
import { getCurrentUser } from '../store/user';
import { CheckBox, Button, SearchBar, Grid, Col, List, ListItem } from 'react-native-elements';

export default class AttendanceScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: getI18nText('考勤表')
    };
  };

  state = {
    userData: this.props.navigation.state.params.data
  }

  async onSubmit() {
    this.props.navigation.goBack();
  }

  render() {
    let keyIndex = 0;
    return (
      <ScrollView
        style={{ backgroundColor: 'white' }}
        ref={ref => this.scrollView = ref}>
        <View style={{ backgroundColor: 'white' }}>
          <Text>{this.state.userData.date}</Text>
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            {
              this.state.userData.attendees.map((user) => (
                <CheckBox
                  key={keyIndex++}
                  title={user.id + ':' + user.name + ' ' + user.cellphone}
                  checked={user.checked} />
              ))
            }
            <Button
              backgroundColor='#397EDC'
              borderRadius={5}
              containerViewStyle={{ width: 130 }}
              title={getI18nText('提交')}
              onPress={this.onSubmit.bind(this)} />
          </View>
        </View>
      </ScrollView>
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
