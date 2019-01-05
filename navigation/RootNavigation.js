import React from 'react';
import { StackNavigator } from 'react-navigation';
import Colors from '../constants/Colors'
import MainTabNavigator from './MainTabNavigator';
import LessonScreen from '../screens/LessonScreen';
import BibleScreen from '../screens/BibleScreen';
import SetPhoneScreen from '../screens/SetPhoneScreen';
import AttendanceScreen from '../screens/AttendanceScreen';
import SermonAudioScreen from '../screens/SermonAudioScreen';
import GlobalChatScreen from '../screens/GlobalChatScreen';
import HomeTrainingScreen from '../screens/HomeTrainingScreen';
import HomeDiscussionScreen from '../screens/HomeDiscussionScreen';
import NotesScreen from '../screens/NotesScreen';
import AnswerManageScreen from '../screens/AnswerManageScreen';
import BibleSelectScreen from '../screens/BibleSelectScreen';
//////////////
// added by Frank on Dec 18, 2018
import MyBSFScreen from '../screens/MyBSFScreen';
//////////////

const RootStackNavigator = StackNavigator(
  {
    Main: {
      screen: MainTabNavigator
    },
    Lesson: {
      screen: LessonScreen
    },
    Bible: {
      screen: BibleScreen
    },
    SetPhone: {
      screen: SetPhoneScreen
    },
    Attendance: {
      screen: AttendanceScreen
    },
    SermonAudio: {
      screen: SermonAudioScreen
    },
    GlobalChat: {
      screen: GlobalChatScreen
    },
    HomeTraining: {
      screen: HomeTrainingScreen
    },
    HomeDiscussion: {
      screen: HomeDiscussionScreen
    },
    Notes: {
      screen: NotesScreen
    },
    AnswerManage: {
      screen: AnswerManageScreen
    },
    BibleSelect: {
      screen: BibleSelectScreen
    },
    MyBSF: {
      screen: MyBSFScreen
    }
  },
  {
    navigationOptions: () => ({
      headerStyle: {
        backgroundColor: Colors.yellow,
        shadowColor: 'transparent',
        elevation: 0,
        borderBottomWidth: 0
      },
      headerTitleStyle: {
        color: 'white',
        fontSize: 22,
        fontWeight: '700'
      },
      headerTintColor: 'white'
    })
  }
);

export default class RootNavigator extends React.Component {
  render() {
    return <RootStackNavigator />;
  }
}
