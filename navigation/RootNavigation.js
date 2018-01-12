import { Notifications } from 'expo';
import React from 'react';
import { StackNavigator } from 'react-navigation';
import Colors from '../constants/Colors'
import MainTabNavigator from './MainTabNavigator';
import registerForPushNotificationsAsync from '../api/registerForPushNotificationsAsync';
import LessonScreen from '../screens/LessonScreen';
import BibleScreen from '../screens/BibleScreen';
import FeedbackScreen from '../screens/FeedbackScreen';
import SetPhoneScreen from '../screens/SetPhoneScreen';

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
    Feedback: {
      screen: FeedbackScreen
    },
    SetPhone: {
      screen: SetPhoneScreen
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
  componentDidMount() {
    //this._notificationSubscription = this._registerForPushNotifications();
  }

  componentWillUnmount() {
    //this._notificationSubscription && this._notificationSubscription.remove();
  }

  render() {
    return <RootStackNavigator />;
  }

  _registerForPushNotifications() {
    // Send our push token over to our backend so we can receive notifications
    // You can comment the following line out if you want to stop receiving
    // a notification every time you open the app. Check out the source
    // for this function in api/registerForPushNotificationsAsync.js
    registerForPushNotificationsAsync();

    // Watch for incoming notifications
    this._notificationSubscription = Notifications.addListener(
      this._handleNotification
    );
  }

  _handleNotification = ({ origin, data }) => {
    console.log(
      `Push notification ${origin} with data: ${JSON.stringify(data)}`
    );
  };
}
