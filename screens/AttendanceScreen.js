import React from 'react';
import { ScrollView, StyleSheet, View, Alert, Text } from 'react-native';
import { getI18nText } from '../store/I18n';
import { FontAwesome } from '@expo/vector-icons';
import { CheckBox, Button, SearchBar, Grid, Col, List, ListItem } from 'react-native-elements';
import Layout from '../constants/Layout';
import { Models } from '../dataStorage/models';
import { callWebServiceAsync, showWebServiceCallErrorsAsync } from '../dataStorage/storage';

export default class AttendanceScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.state.params.data.date
    };
  };

  constructor(props) {
    super(props);

    const users = this.props.navigation.state.params.data.attendees;
    let groups = [];
    for (let i in users) {
      if (groups.indexOf(users[i].group) === -1) {
        groups.push(users[i].group);
      }
    }

    this.state = {
      classDate: this.props.navigation.state.params.data.date,
      groups,
      users
    };

    console.log(JSON.stringify(this.state));
  }

  async onSubmit(group) {
    let users = [];
    for (var i in this.state.users) {
      if (this.state.users[i].checked && this.state.users[i].group === group) {
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

  getTitle(keyIndex, user) {
    if (user.cellphone) {
      return `#${keyIndex}: ${user.name} (${user.cellphone})`;
    } else {
      return `#${keyIndex}: ${user.name}`;
    }
  }

  render() {
    let keyIndex = 0;
    let groupIndex = {}
    for (let i in this.state.groups) {
      groupIndex[this.state.groups[i]] = 0;
    }
    return (
      <View style={{ flex: 1 }}>
        <ScrollView
          style={{ backgroundColor: 'white' }}
          ref={ref => this.scrollView = ref}>

          {
            this.state.groups.map((group) => (
              <View style={{ alignItems: 'center', marginTop: 10, marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <FontAwesome name='group' size={28} color='#fcaf17' />
                  <Text style={{ fontWeight: 'bold', marginLeft: 10, fontSize: 20 }}>Group#{group}</Text>
                </View>
                {
                  this.state.users.map((user) => (
                    user.group === group &&
                    <CheckBox
                      containerStyle={{ width: Layout.window.width - 20 }}
                      key={keyIndex++}
                      title={this.getTitle(++groupIndex[group], user)}
                      checked={user.checked}
                      onPress={() => { this.onCheck(user) }} />
                  ))
                }

                <Button
                  backgroundColor='#397EDC'
                  borderRadius={5}
                  style={{ marginTop: 7 }}
                  containerViewStyle={{ width: Layout.window.width / 2 }}
                  title={getI18nText('提交') + ' #' + group}
                  onPress={() => this.onSubmit(group)} />

                <View style={{ height: 40 }} />
              </View>
            ))
          }
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
});
