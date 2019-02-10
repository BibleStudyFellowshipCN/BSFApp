import React from 'react';
import { ScrollView, View, Alert, Text, ActivityIndicator, Dimensions, Image, TouchableOpacity } from 'react-native';
import { getI18nText } from '../utils/I18n';
import { Card, ListItem } from 'react-native-elements';
import { Models } from '../dataStorage/models';
import { callWebServiceAsync, showWebServiceCallErrorsAsync } from '../dataStorage/storage';
import { getCurrentUser } from '../utils/user';
import Colors from '../constants/Colors';
import { EventRegister } from 'react-native-event-listeners';

export default class AttendanceSelectLeaderScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: getI18nText('请选择代理组长'),
      headerLeft: (
        <View style={{ marginLeft: 10 }}>
          <TouchableOpacity onPress={() => navigateBack()}>
            <Image
              style={{ width: 34, height: 34 }}
              source={require('../assets/images/GoBack.png')} />
          </TouchableOpacity>
        </View>)
    };
  };

  state = {
    leaders: null,
    busy: false,
    windowWidth: Dimensions.get('window').width
  };

  componentWillMount() {
    navigateBack = () => this.props.navigation.pop();
    this.listener = EventRegister.addEventListener('screenDimensionChanged', (window) => {
      this.setState({ windowWidth: window.width });
    });

    this.loadAsync();
  }

  componentWillUnmount() {
    EventRegister.removeEventListener(this.listener)
  }

  async loadAsync() {
    try {
      this.setState({ busy: true });
      const lesson = this.props.navigation.state.params.lesson;
      const group = this.props.navigation.state.params.group.id;
      const result = await callWebServiceAsync(`${Models.HostServer}/leaders/${getCurrentUser().getCellphone()}/${group}/${lesson}`, '', 'GET');
      const succeed = await showWebServiceCallErrorsAsync(result, 200);
      if (succeed) {
        this.setState({ leaders: result.body });
      }
    }
    finally {
      this.setState({ busy: false });
    }
  }

  async onSelectd(leader) {
    const leaderId = leader.current ? this.props.navigation.state.params.data.user : leader.id;
    const result = await this.props.navigation.state.params.onSelected(leaderId);
    if (result) {
      this.props.navigation.pop();
    }
  }

  render() {
    if (!this.state.leaders) {
      return (
        <ActivityIndicator
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          size='large'
          color={Colors.yellow} />
      );
    }

    let keyIndex = 0;
    return (
      <ScrollView style={{ flex: 1, backgroundColor: 'white' }}>
        {
          this.state.leaders.map(leader =>
            leader.current ?
              <ListItem
                key={keyIndex++}
                style={{ flex: 1 }}
                leftIcon={{ name: 'star', color: Colors.yellow }}
                title={leader.name}
                hideChevron
                onPress={() => { this.onSelectd(leader) }} /> :
              null)
        }
        {
          this.state.leaders.map(leader =>
            !leader.current ?
              <ListItem
                key={keyIndex++}
                style={{ flex: 1 }}
                leftIcon={{ name: 'star', color: '#eeeeee' }}
                title={leader.name}
                hideChevron
                onPress={() => { this.onSelectd(leader) }} /> :
              null)
        }
      </ScrollView>
    );
  }
}
