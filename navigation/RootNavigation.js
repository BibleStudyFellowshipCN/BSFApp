import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { Notifications } from 'expo';
import {
  StackNavigation,
  TabNavigation,
  TabNavigationItem,
} from '@expo/ex-navigation';
import { FontAwesome } from '@expo/vector-icons';
import Alerts from '../constants/Alerts';
import Colors from '../constants/Colors';
import registerForPushNotificationsAsync from '../api/registerForPushNotificationsAsync';
import SharedStyles from '../constants/SharedStyles';
import { getI18nText, getI18nBibleBook } from '../store/I18n';

export default class RootNavigation extends React.Component {
  componentDidMount() {
    this._notificationSubscription = this._registerForPushNotifications();
  }

  componentWillUnmount() {
    this._notificationSubscription && this._notificationSubscription.remove();
  }

  render() {
    return (
      <TabNavigation tabBarColor={Colors.yellow} id="tab-navigation" navigatorUID="tab-navigation" tabBarHeight={56} initialTab="class">
        {/*<TabNavigationItem
          id="home"
          renderIcon={isSelected => this._renderIcon('BSF', isSelected)}>
          <StackNavigation initialRoute="home" />
        </TabNavigationItem>

        <TabNavigationItem
          id="group"
          renderIcon={isSelected => this._renderIcon('组', isSelected)}>
          <StackNavigation initialRoute="links" />
        </TabNavigationItem>*/}

        <TabNavigationItem
          id="class"
          renderIcon={isSelected => this._renderIcon(getI18nText('课'), 'book', isSelected)}>
          <StackNavigation
            initialRoute="home"
            defaultRouteConfig={SharedStyles.tabNavItemStyle}
          />
        </TabNavigationItem>

        <TabNavigationItem
          id="audioBible"
          renderIcon={isSelected => this._renderIcon(getI18nText('有声圣经'), 'headphones', isSelected)}>
          <StackNavigation initialRoute="audioBible"
            defaultRouteConfig={SharedStyles.tabNavItemStyle}
          />
        </TabNavigationItem>

        <TabNavigationItem
          id="profile"
          renderIcon={isSelected => this._renderIcon(getI18nText('我'), 'info-circle', isSelected)}>
          <StackNavigation initialRoute="settings"
            defaultRouteConfig={SharedStyles.tabNavItemStyle}
          />
        </TabNavigationItem>
      </TabNavigation>
    );
  }

  _renderIcon(name, iconName, isSelected) {
    return (
      <View style={{ justifyContent: 'center', alignItems: 'center' }}>
        <FontAwesome
          name={iconName}
          size={26}
          color={isSelected ? Colors.tabIconSelected : Colors.tabIconDefault}
        />
        <Text style={{ color: isSelected ? Colors.tabIconSelected : Colors.tabIconDefault, fontSize: 12 }}>
          {name}
        </Text>
      </View>
    );
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
    this.props.navigator.showLocalAlert(
      `Push notification ${origin} with data: ${JSON.stringify(data)}`,
      Alerts.notice
    );
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  selectedTab: {
    color: Colors.tabIconSelected,
  }
});
