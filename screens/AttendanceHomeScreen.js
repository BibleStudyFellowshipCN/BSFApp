import React from 'react';
import { ScrollView, View, Alert, Text, ActivityIndicator, Dimensions, Image, TouchableOpacity } from 'react-native';
import { getI18nText } from '../utils/I18n';
import { FontAwesome } from '@expo/vector-icons';
import { CheckBox, Button } from 'react-native-elements';
import { Models } from '../dataStorage/models';
import { callWebServiceAsync, showWebServiceCallErrorsAsync } from '../dataStorage/storage';
import SegmentedControlTab from 'react-native-segmented-control-tab';
import { getCurrentUser } from '../utils/user';
import Colors from '../constants/Colors';
import DatePicker from 'react-native-datepicker';
import { EventRegister } from 'react-native-event-listeners';

export default class AttendanceHomeScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    let title = getI18nText('考勤表');
    if (navigation.state.params && navigation.state.params.rate) {
      title += ' ' + navigation.state.params.rate;
    }
    return {
      title: title,
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
    data: null,
    lessons: null,
    rates: null,
    busy: false,
    windowWidth: Dimensions.get('window').width
  };

  componentWillMount() {
    navigateBack = () => this.props.navigation.pop();
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
      const result = await callWebServiceAsync(`${Models.HostServer}/attendanceSummary/`, getCurrentUser().getCellphone(), 'GET');
      const succeed = await showWebServiceCallErrorsAsync(result, 200);
      if (succeed) {
        const data = result.body;
        let lessons = [];
        let rates = {};
        let totalRate = 0;
        let totalRateCount = 0;
        for (let i = 1; i < 30; i++) {
          const { displayName, value } = this.getRate(data.attendance, i);
          if (value) {
            totalRate += value;
            totalRateCount++;
          }

          rates[i] = displayName;
          lessons.push({ id: i, displayName: '第' + i + '课', rate: displayName });
        }

        this.setState({ data: data, lessons: lessons, rates: rates });
        if (totalRateCount > 0) {
          this.props.navigation.setParams({ rate: Math.round(totalRate / totalRateCount * 100) / 100 + '%' });
        }
      }
    }
    finally {
      this.setState({ busy: false });
    }
  }

  getRate(attendance, lesson) {
    let total = 0;
    let count = 0;
    for (let i in attendance) {
      if (attendance[i].lesson === lesson) {
        total += attendance[i].rate;
        count++;
      }
    }

    if (count === 0) {
      return { displayName: '-' };
    }

    const value = Math.round(total / count * 100) / 100;
    return { displayName: value + '%' + (count > 1 ? '*' : ''), value: value };
  }

  gotoGroup(lesson) {
    let count = 0;
    let lastMatchingGroup = null;
    for (let i in this.state.data.groups) {
      const group = this.state.data.groups[i];
      if (group.lesson === 0 || lesson.id === group.lesson) {
        lastMatchingGroup = group;
        count++;
        if (count > 1) {
          break;
        }
      }
    }
    if (count > 1) {
      this.props.navigation.navigate('AttendanceGroup', { lesson: lesson.id, lessonTitle: lesson.displayName, data: this.state.data });
    } else {
      this.props.navigation.navigate('AttendanceLesson', { lesson: lesson.id, lessonTitle: lesson.displayName, data: this.state.data, group: lastMatchingGroup });
    }
  }

  render() {
    if (!this.state.data) {
      return (
        <ActivityIndicator
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          size='large'
          color={Colors.yellow} />
      );
    }

    let keyIndex = 0;
    const lessons = this.state.lessons;
    return (
      <View style={{ flex: 1 }}>
        <ScrollView
          style={{ backgroundColor: 'white' }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 10 }}>
            {
              lessons.map(lesson => {
                const title = lesson.displayName;
                return (
                  <TouchableOpacity
                    key={keyIndex++}
                    onPress={() => this.gotoGroup(lesson)}>
                    <View style={{
                      width: (this.state.windowWidth / 4 - 15),
                      borderColor: '#cdcdcd',
                      borderWidth: 0.5,
                      borderRadius: 10,
                      height: 80,
                      margin: 5,
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Text style={{
                        fontSize: 15,
                        fontWeight: 'bold',
                        color: Colors.yellow
                      }}>{title}</Text>
                      <Text style={{
                        fontSize: 16,
                        fontWeight: 'bold'
                      }}>{lesson.rate}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            }
          </View>
          <View style={{ height: 80 }} />
        </ScrollView>
      </View >
    );
  }
}
