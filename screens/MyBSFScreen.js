import React from 'react';
import { getI18nText } from '../store/I18n';
import { WebView, View, ActivityIndicator, Dimensions, TouchableOpacity, Image } from 'react-native';
import Colors from '../constants/Colors';
import { EventRegister } from 'react-native-event-listeners';
import { NavigationActions } from 'react-navigation';

function goback() { }

export default class MyBSFScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const canGoBack = navigation.state.params && navigation.state.params.canGoBack;
    return {
      title: getI18nText('MyBSF.org'),
      headerLeft: (
        <View style={{ marginHorizontal: 20, flexDirection: 'row' }}>
          {
            canGoBack &&
            <TouchableOpacity onPress={() => { goback(); }}>
              <Image
                style={{ width: 34, height: 34 }}
                source={require('../assets/images/GoBack.png')} />
            </TouchableOpacity>
          }
        </View>)
    };
  };

  state = {
    loading: true,
    canGoBack: false,
    windowWidth: Dimensions.get('window').width,
  };

  constructor(props) {
    super(props);

    goback = this.goback.bind(this);
  }

  componentWillMount() {
    this.listener = EventRegister.addEventListener('screenDimensionChanged', (window) => {
      this.setState({ windowWidth: window.width });
    });
  }

  componentWillUnmount() {
    EventRegister.removeEventListener(this.listener);
  }

  goback() {
    if (this.state.canGoBack) {
      this.browser.goBack();
    }
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <WebView
          ref={ref => this.browser = ref}
          source={{ uri: 'https://www.mybsf.org' }}
          onLoadEnd={() => {
            this.setState({ loading: false })
          }}
          onLoadStart={() => {
            this.setState({ loading: true })
          }}
          onNavigationStateChange={(navState) => {
            const canGoBack = navState.canGoBack && !navState.loading;
            console.log({ navState, canGoBack });
            this.setState({ canGoBack });
            const setParamsAction = NavigationActions.setParams({
              params: { canGoBack },
              key: 'MyBSFScreen',
            })
            this.props.navigation.dispatch(setParamsAction);
          }}
        />
        {
          this.state.loading &&
          <ActivityIndicator
            style={{
              position: 'absolute',
              top: 20,
              left: this.state.windowWidth / 2 - 20
            }}
            size="large"
            color={Colors.yellow} />
        }
      </View>
    );
  }
}
