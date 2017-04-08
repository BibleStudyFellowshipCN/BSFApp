import React from 'react';
import { connect } from 'react-redux'
import {
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import ScrollableTabView from 'react-native-scrollable-tab-view'

class BibleScreen extends React.Component {
  static route = {
    navigationBar: {
      title: (route) => {
        return route.lesson.name
      },
    },
  };

  render() {
    return (
      <View style={styles.container}>
        <BiblePassage passage={this.props.passage}/>
      </View>
    );
  }
}

const BiblePassage = (props) => (
  <View>
  </View>
)

const mapStateToProps = (state) => {
  return {
    passage: state.passage,
  }
}

const mapDispatchToProps = { }

export default connect(mapStateToProps, mapDispatchToProps)(ClassScreen)

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
