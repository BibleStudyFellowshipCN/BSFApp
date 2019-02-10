import React from 'react';
import { ScrollView, View, Alert, Text, ActivityIndicator, Dimensions, Image, TouchableOpacity } from 'react-native';
import { getI18nText } from '../utils/I18n';
import { CheckBox } from 'react-native-elements';
import { Models } from '../dataStorage/models';
import { callWebServiceAsync, showWebServiceCallErrorsAsync } from '../dataStorage/storage';
import { getCurrentUser } from '../utils/user';
import Colors from '../constants/Colors';
import { EventRegister } from 'react-native-event-listeners';

export default class AttendanceLessonScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: `${navigation.state.params.lessonTitle} ${navigation.state.params.group.id}${getI18nText('组')}`,
      headerLeft: (
        <View style={{ marginLeft: 10 }}>
          <TouchableOpacity onPress={() => navigateBack()}>
            <Image
              style={{ width: 34, height: 34 }}
              source={require('../assets/images/GoBack.png')} />
          </TouchableOpacity>
        </View>),
      headerRight: (
        <View style={{ marginRight: 10, flexDirection: 'row' }}>
          {
            navigation.state.params.group.lesson === 0 &&
            <TouchableOpacity onPress={() => transfer()}>
              <Image
                style={{ width: 34, height: 34 }}
                source={require('../assets/images/assign.png')} />
            </TouchableOpacity>
          }
          <View style={{ width: 6 }} />
          <TouchableOpacity onPress={() => submit()}>
            <Image
              style={{ width: 34, height: 34 }}
              source={require('../assets/images/Ok.png')} />
          </TouchableOpacity>
        </View>)
    };
  };

  state = {
    attendance: null,
    busy: false,
    substitute: this.props.navigation.state.params.substitute,
    windowWidth: Dimensions.get('window').width
  };

  componentWillMount() {
    navigateBack = () => this.props.navigation.pop();
    transfer = () => this.transfer();
    submit = () => this.submit();
    this.listener = EventRegister.addEventListener('screenDimensionChanged', (window) => {
      this.setState({ windowWidth: window.width });
    });

    this.props.navigation.addListener('willFocus', () => {
      this.loadAsync();
    });
  }

  componentWillUnmount() {
    EventRegister.removeEventListener(this.listener)
  }

  async loadAsync() {
    try {
      this.setState({ busy: true });
      const lesson = this.props.navigation.state.params.lesson;
      const group = this.props.navigation.state.params.group.id;
      const result = await callWebServiceAsync(`${Models.HostServer}/attendance/${getCurrentUser().getCellphone()}/${group}/${lesson}`, '', 'GET');
      const succeed = await showWebServiceCallErrorsAsync(result, 200);
      if (succeed) {
        this.setState({ attendance: result.body.users, substitute: result.body.substitute.name });
      }
    }
    finally {
      this.setState({ busy: false });
    }
  }

  async transfer() {
    this.props.navigation.navigate('AttendanceSelectLeader', {
      group: this.props.navigation.state.params.group,
      lesson: this.props.navigation.state.params.lesson,
      data: this.props.navigation.state.params.data,
      onSelected: this.selectTransferLeader.bind(this)
    });
  }

  async selectTransferLeader(leader) {
    const body = {
      lesson: this.props.navigation.state.params.lesson,
      group: this.props.navigation.state.params.group.id,
      leader: leader,
    }
    const result = await callWebServiceAsync(`${Models.HostServer}/transferLeader/${getCurrentUser().getCellphone()}`, '', 'POST', [], body);
    const succeed = await showWebServiceCallErrorsAsync(result, 201);
    return succeed;
  }

  async submit() {
    try {
      this.setState({ busy: true });
      let users = [];
      const attendance = this.state.attendance;
      for (var i in attendance) {
        if (attendance[i].checked) {
          users.push(attendance[i].id);
        }
      }

      const body = {
        group: this.props.navigation.state.params.group.id,
        lesson: this.props.navigation.state.params.lesson,
        users
      };

      const result = await callWebServiceAsync(`${Models.HostServer}/attendance/${getCurrentUser().getCellphone()}`, '', 'POST', [], body);
      const succeed = await showWebServiceCallErrorsAsync(result, 201);
      if (succeed) {
        this.props.navigation.pop();
      }
    }
    finally {
      this.setState({ busy: false });
    }
  }

  onCheck(user) {
    const attendance = this.state.attendance;
    for (let i in attendance) {
      if (attendance[i].id == user.id) {
        attendance[i].checked = !user.checked;
        break;
      }
    }

    this.setState({ attendance });
  }

  getTitle(index, user) {
    if (user.cellphone) {
      return `#${index}: ${user.name} (${user.cellphone})`;
    } else {
      return `#${index}: ${user.name}`;
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
    return (
      <ScrollView style={{ backgroundColor: 'white' }}>
        <View style={{ flex: 1, alignItems: 'center', marginTop: 5, marginBottom: 5 }}>
          {
            this.state.substitute &&
            <View style={{
              borderColor: '#FFE8A1',
              backgroundColor: '#FFF2CC',
              borderWidth: 1,
              borderRadius: 10,
              width: this.state.windowWidth - 20,
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Text style={{ fontSize: 16, margin: 3 }}>{getI18nText('代理组长') + ': ' + this.state.substitute}</Text>
            </View>
          }
          {
            this.state.attendance.map((user) => user.checked ? (
              <CheckBox
                containerStyle={{ width: this.state.windowWidth - 20 }}
                key={keyIndex++}
                title={this.getTitle(++index, user)}
                checked={user.checked}
                onPress={() => { this.onCheck(user) }} />
            ) : null)
          }
          {
            this.state.attendance.map((user) => !user.checked ? (
              <CheckBox
                containerStyle={{ width: this.state.windowWidth - 20 }}
                key={keyIndex++}
                title={this.getTitle(++index, user)}
                checked={user.checked}
                onPress={() => { this.onCheck(user) }} />
            ) : null)
          }
        </View>
      </ScrollView>
    );
  }
}
