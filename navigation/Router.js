import { createRouter } from '@expo/ex-navigation';

import HomeScreen from '../screens/HomeScreen';
import LinksScreen from '../screens/LinksScreen';
import SettingsScreen from '../screens/SettingsScreen';
import LessonScreen from '../screens/LessonScreen'
import BibleScreen from '../screens/BibleScreen'
import RootNavigation from './RootNavigation';
import AudioBibleScreen from '../screens/AudioBibleScreen';

export default createRouter(() => ({
  home: () => HomeScreen,
  links: () => LinksScreen,
  lesson: () => LessonScreen,
  bible: () => BibleScreen,
  settings: () => SettingsScreen,
  audioBible: () => AudioBibleScreen,
  rootNavigation: () => RootNavigation,
}));
