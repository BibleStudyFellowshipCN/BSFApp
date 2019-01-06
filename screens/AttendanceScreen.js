import React from 'react';
import { ScrollView, StyleSheet, View, Alert, Text, ActivityIndicator } from 'react-native';
import { getI18nText } from '../store/I18n';
import { FontAwesome } from '@expo/vector-icons';
import { CheckBox, Button } from 'react-native-elements';
import Layout from '../constants/Layout';
import { Models } from '../dataStorage/models';
import { callWebServiceAsync, showWebServiceCallErrorsAsync } from '../dataStorage/storage';
import SegmentedControlTab from 'react-native-segmented-control-tab';
import { getCurrentUser } from '../store/user';
import Colors from '../constants/Colors';
import DatePicker from 'react-native-datepicker';

export default class AttendanceScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: getI18nText('考勤表')
    };
  };

  state = {
    classDate: this.getYYYYMMDD(new Date()),
    attendance: null,
    selectedIndex: 0,
    busy: false
  };

  componentWillMount() {
    this.loadAsync();
  }

  getYYYYMMDD(date) {
    return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
  }

  async loadAsync() {
    try {
      this.setState({ busy: true });
      const result = await callWebServiceAsync(Models.Attendance.restUri, '/' + getCurrentUser().getCellphone(), 'GET');
      const succeed = await showWebServiceCallErrorsAsync(result, 200);
      if (succeed) {
        this.setState({ attendance: result.body });
        console.log('loadAsync: ' + JSON.stringify(this.state));
      }
    }
    finally {
      this.setState({ busy: false });
    }
  }

  async onSubmit(group) {
    try {
      this.setState({ busy: true });
      let users = [];
      const currentGroup = this.state.attendance[this.state.selectedIndex];
      const attendees = currentGroup.attendees;
      for (var i in attendees) {
        if (attendees[i].checked) {
          users.push(attendees[i].id);
        }
      }

      let body = {
        class: currentGroup.class,
        group: currentGroup.group,
        date: currentGroup.date,
        users
      };

      const result = await callWebServiceAsync(Models.Attendance.restUri, '?cellphone=' + phone, 'POST', [], body);
      const succeed = await showWebServiceCallErrorsAsync(result, 201);
      if (succeed) {
        Alert.alert(getI18nText('已经提交，谢谢！'));
      }
    }
    finally {
      this.setState({ busy: false });
    }
  }

  onCheck(user) {
    let attendance = this.state.attendance;
    const attendees = attendance[this.state.selectedIndex].attendees;
    for (let i in attendees) {
      if (attendees[i].id == user.id) {
        attendees[i].checked = !user.checked;
        break;
      }
    }

    this.setState({ attendance });
  }

  getTitle(keyIndex, user) {
    if (user.cellphone) {
      return `#${keyIndex}: ${user.name} (${user.cellphone})`;
    } else {
      return `#${keyIndex}: ${user.name}`;
    }
  }

  onGroupChange(index) {
    this.setState({ selectedIndex: index });
  }

  async onDateChange(date) {
    let attendance = this.state.attendance;
    const currentGroup = attendance[this.state.selectedIndex];
    if (currentGroup.date !== date) {
      currentGroup.date = date;
      this.setState({ attendance });
      await this.refresh(currentGroup.group, date);
    }
  }

  async refresh(group, date) {
    try {
      this.setState({ busy: true });
      const result = await callWebServiceAsync(Models.Attendance.restUri, `/${getCurrentUser().getCellphone()}/${group}/${date}`, 'GET');
      const succeed = await showWebServiceCallErrorsAsync(result, 200);
      if (succeed) {
        let attendance = this.state.attendance;
        const currentGroup = attendance[this.state.selectedIndex];
        if (currentGroup.group !== result.body[0].group) {
          alert('Error!');
          return;
        }

        attendance[this.state.selectedIndex] = result.body[0];
        this.setState({ attendance });
      }
    }
    finally {
      this.setState({ busy: false });
    }
  }

  render() {
    if (!this.state.attendance) {
      return (
        <ActivityIndicator
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          size='large'
          color={Colors.yellow} />
      );
    }

    let keyIndex = 0;
    let index = 0;

    const groups = this.state.attendance.map(item => item.group.toString());
    const currentGroup = this.state.attendance[this.state.selectedIndex];
    const currentGroupTitle = 'Group#' + (currentGroup.name ? currentGroup.group + ' ' + currentGroup.name : currentGroup.group);

    return (
      <View style={{ flex: 1 }}>
        <ScrollView
          style={{ backgroundColor: 'white' }}
          ref={ref => this.scrollView = ref}>

          {
            groups.length > 1 &&
            <View style={{ marginTop: 10, marginHorizontal: 10 }}>
              <SegmentedControlTab
                values={groups}
                selectedIndex={this.state.selectedIndex}
                onTabPress={this.onGroupChange.bind(this)}
              />
            </View>
          }

          <View style={{ alignItems: 'center', marginTop: 10, marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <FontAwesome name='group' size={28} color='#fcaf17' />
              <Text style={{ fontWeight: 'bold', marginLeft: 10, fontSize: 20 }}>{currentGroupTitle}</Text>
            </View>
          </View>

          <View style={{ alignItems: 'center', marginTop: 5, marginBottom: 5 }}>
            <DatePicker
              style={{ width: Layout.window.width - 20 }}
              date={currentGroup.date}
              mode="date"
              placeholder="Select date"
              format="YYYY-MM-DD"
              confirmBtnText="Confirm"
              cancelBtnText="Cancel"
              onDateChange={this.onDateChange.bind(this)}
            />

            {
              currentGroup.attendees.map((user) => user.checked ? (
                <CheckBox
                  containerStyle={{ width: Layout.window.width - 20 }}
                  key={keyIndex++}
                  title={this.getTitle(++index, user)}
                  checked={user.checked}
                  onPress={() => { this.onCheck(user) }} />
              ) : null)
            }

            {
              currentGroup.attendees.map((user) => !user.checked ? (
                <CheckBox
                  containerStyle={{ width: Layout.window.width - 20 }}
                  key={keyIndex++}
                  title={this.getTitle(++index, user)}
                  checked={user.checked}
                  onPress={() => { this.onCheck(user) }} />
              ) : null)
            }
          </View>

          <View style={{ height: 80 }} />
        </ScrollView>

        <View style={{
          position: 'absolute',
          bottom: 0,
          width: Layout.window.width,
          alignItems: 'center',
          backgroundColor: 'white'
        }}>
          <Button
            disabled={this.state.busy}
            backgroundColor='#397EDC'
            borderRadius={5}
            style={{ margin: 7 }}
            containerViewStyle={{ width: Layout.window.width / 2 }}
            title={getI18nText('提交')}
            onPress={() => this.onSubmit(currentGroup)} />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
});
