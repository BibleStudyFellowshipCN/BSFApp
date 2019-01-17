import React from 'react';
import { getI18nText } from '../store/I18n';
import { WebView, View, ActivityIndicator, Dimensions, TouchableOpacity, Image } from 'react-native';
import Colors from '../constants/Colors';
import { EventRegister } from 'react-native-event-listeners';
import { NavigationActions } from 'react-navigation';

function goback() { }
function refreshWebView() { }

export default class MyBSFScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const canGoBack = navigation.state.params && navigation.state.params.canGoBack;
    return {
      title: getI18nText('MyBSF.org'),
      headerLeft: (
        <View style={{ marginLeft: 10, flexDirection: 'row' }}>
          {
            canGoBack &&
            <TouchableOpacity onPress={() => { goback(); }}>
              <Image
                style={{ width: 34, height: 34 }}
                source={require('../assets/images/GoBack.png')} />
            </TouchableOpacity>
          }
        </View>),
      headerRight: (
        <View style={{ marginRight: 10, flexDirection: 'row' }}>
          <TouchableOpacity onPress={() => { refreshWebView(); }}>
            <Image
              style={{ width: 34, height: 34 }}
              source={require('../assets/images/BsfHome.png')} />
          </TouchableOpacity>
        </View>)
    };
  };

  state = {
    loading: true,
    canGoBack: false,
    windowWidth: Dimensions.get('window').width,
    key: 1,
    isWebViewUrlChanged: false
  };

  constructor(props) {
    super(props);

    this.webUrl = 'https://www.mybsf.org';

    goback = this.goback.bind(this);
    refreshWebView = this.refreshWebView.bind(this);
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

  refreshWebView() {
    this.setState({ key: this.state.key + 1 });
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <WebView
          style={{ flex: 1 }}
          key={this.state.key}
          ref={ref => this.browser = ref}
          source={{ uri: this.webUrl }}
          onLoadEnd={() => {
            this.setState({ loading: false })
          }}
          onLoadStart={() => {
            this.setState({ loading: true })
          }}
          onNavigationStateChange={(navState) => {
            const canGoBack = navState.canGoBack && !navState.loading;
            const isWebViewUrlChanged = (navState.url !== this.webUrl);
            this.setState({ canGoBack, isWebViewUrlChanged });
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
