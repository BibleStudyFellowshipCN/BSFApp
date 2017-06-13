
import Colors from '../constants/Colors';

const navigationBarStyle = {
  backgroundColor: Colors.yellow,
  tintColor: 'white',
  elevation: 0,
  borderBottomWidth: 0,
  titleStyle: {
    fontSize: 22,
    fontWeight: '700'
  }
};

export default {
  navigationBarStyle,
  tabNavItemStyle: {
    navigationBar: navigationBarStyle
  }
}