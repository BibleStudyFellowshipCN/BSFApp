import React from 'react';
import { StackNavigator } from 'react-navigation';
import Colors from '../constants/Colors'
import MainTabNavigator from './MainTabNavigator';
import LessonScreen from '../screens/LessonScreen';
import BibleScreen from '../screens/BibleScreen';
import SetPhoneScreen from '../screens/SetPhoneScreen';
import AttendanceScreen from '../screens/AttendanceScreen';
import AttendanceHomeScreen from '../screens/AttendanceHomeScreen';
import AttendanceGroupScreen from '../screens/AttendanceGroupScreen';
import AttendanceLessonScreen from '../screens/AttendanceLessonScreen';
import AttendanceSelectLeaderScreen from '../screens/AttendanceSelectLeaderScreen';
import LectureMaterialScreen from '../screens/LectureMaterialScreen';
import GlobalChatScreen from '../screens/GlobalChatScreen';
import HomeTrainingScreen from '../screens/HomeTrainingScreen';
import HomeDiscussionScreen from '../screens/HomeDiscussionScreen';
import NotesScreen from '../screens/NotesScreen';
import AnswerManageScreen from '../screens/AnswerManageScreen';
import BibleSelectScreen from '../screens/BibleSelectScreen';
import DiscussionScreen from '../screens/DiscussionScreen';
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
    AttendanceHome: {
      screen: AttendanceHomeScreen
    },
    AttendanceGroup: {
      screen: AttendanceGroupScreen
    },
    AttendanceLesson: {
      screen: AttendanceLessonScreen
    },
    AttendanceSelectLeader: {
      screen: AttendanceSelectLeaderScreen
    },
    LectureMaterial: {
      screen: LectureMaterialScreen
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
    },
    Discussion: {
      screen: DiscussionScreen
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
