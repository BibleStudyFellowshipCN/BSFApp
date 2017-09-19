import React from 'react';
import { View, Text, Platform } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { TabNavigator, TabBarBottom } from 'react-navigation';
import Colors from '../constants/Colors';
import HomeScreen from '../screens/HomeScreen';
import AudioBibleScreen from '../screens/AudioBibleScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { getI18nText } from '../store/I18n';

export default TabNavigator(
  {
    Home: {
      screen: HomeScreen,
    },
    AudioBible: {
      screen: AudioBibleScreen,
    },
    Settings: {
      screen: SettingsScreen,
    },
  },
  {
    navigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused }) => {
        const { routeName } = navigation.state;
        let iconName;
        switch (routeName) {
          case 'Home':
            iconName = 'book';
            break;
          case 'AudioBible':
            iconName = 'headphones';
            break;
          case 'Settings':
            iconName = 'info-circle';
        }
        return (
          <FontAwesome
            name={iconName}
            size={28}
            color={focused ? Colors.tabIconSelected : Colors.tabIconDefault}
            style={{ marginBottom: -3 }}
          />
        );
      },
    }),
    tabBarComponent: TabBarBottom,
    tabBarPosition: 'bottom',
    animationEnabled: false,
    swipeEnabled: false,
    tabBarOptions: {
      activeTintColor: 'white',
      labelStyle: {
        fontSize: 12,
      },
      style: {
        backgroundColor: Colors.yellow
      }
    }
  }
);
