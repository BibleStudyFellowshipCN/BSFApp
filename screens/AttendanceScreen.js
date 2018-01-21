import React from 'react';
import { ScrollView, StyleSheet, View, Alert, Text } from 'react-native';
import { getI18nText } from '../store/I18n';
import { getCurrentUser } from '../store/user';
import { CheckBox, Button, SearchBar, Grid, Col, List, ListItem } from 'react-native-elements';
import Layout from '../constants/Layout';
import { Models } from '../dataStorage/models';
import { callWebServiceAsync, showWebServiceCallErrorsAsync } from '../dataStorage/storage';

export default class AttendanceScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: getI18nText('考勤表') + '  (' + navigation.state.params.data.date + ')'
    };
  };

  state = {
    classDate: this.props.navigation.state.params.data.date,
    users: this.props.navigation.state.params.data.attendees
  }

  async onSubmit() {
    let users = [];
    for (var i in this.state.users) {
      if (this.state.users[i].checked) {
        users.push(this.state.users[i].id);
      }
    }

    let body = { date: this.state.classDate, users };
    console.log(JSON.stringify(body));

    const result = await callWebServiceAsync(Models.Attendance.restUri, '?cellphone=' + phone, 'POST', [], body);
    const succeed = await showWebServiceCallErrorsAsync(result, 201);
    if (succeed) {
      Alert.alert(getI18nText('已经提交，谢谢！'));
    }
  }

  onCheck(user) {
    const newValue = user.checked ? false : true;
    users = this.state.users
    for (var i in users) {
      if (users[i].id == user.id) {
        users[i].checked = newValue;
        break;
      }
    }

    this.setState({ users });
  }

  render() {
    let keyIndex = 0;
    return (
      <View style={{ flex: 1 }}>
        <ScrollView
          style={{ backgroundColor: 'white' }}
          ref={ref => this.scrollView = ref}>
          <View style={{ alignItems: 'center', marginTop: 10, marginBottom: 50 }}>
            {
              this.state.users.map((user) => (
                <CheckBox
                  containerStyle={{ width: Layout.window.width - 20 }}
                  key={keyIndex++}
                  title={`#${keyIndex}: ${user.name} (${user.cellphone})`}
                  checked={user.checked}
                  onPress={() => { this.onCheck(user) }} />
              ))
            }
          </View>
        </ScrollView>
        <View style={{
          position: 'absolute',
          bottom: 5,
          width: Layout.window.width,
          alignItems: 'center'
        }}>
          <Button
            backgroundColor='#397EDC'
            borderRadius={5}
            containerViewStyle={{ width: 130 }}
            title={getI18nText('提交')}
            onPress={this.onSubmit.bind(this)} />
        </View>
      </View>
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
