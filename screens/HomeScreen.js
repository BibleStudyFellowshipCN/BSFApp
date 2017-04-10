import React from 'react';
import { connect } from 'react-redux'
import { FontAwesome } from '@expo/vector-icons';
import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { loadClass } from '../store/class.js'

import Accordion from 'react-native-collapsible/Accordion';

import { MonoText } from '../components/StyledText';

class HomeScreen extends React.Component {
  static route = {
    navigationBar: {
      visible: false,
    },
  };

  render() {
    console.log(this.props.books)
    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}>

          <View style={styles.booksContainer}>
            <Accordion 
              sections={this.props.booklist}
              renderHeader={this._renderHeader.bind(this)}
              renderContent={this._renderContent.bind(this)}
            />
          </View>
        </ScrollView>
      </View>
    );
  }

  _renderHeader(content, index, isActive) {
    return (
      <View style={styles.bookHeader} >
        <View style={styles.bookHeaderIcon}>
          <FontAwesome
            name={ isActive ? 'minus' : 'plus'}
            size={ 18 }
          />
        </View>
        <Text style={styles.bookHeaderText}> { content.title } </Text>
      </View>
    )
  }

  _renderContent(content, index, isActive) {
    return (
      <View>
        { content.lessons.map(lesson => (

          <Lesson
            key={lesson.id}
            loadClass={() => this.props.loadClass(lesson, this.props.navigator)}
            lesson={lesson} 
            navigator={this.props.navigator}
          />)) }
      </View>
    )
  }

  _handleLearnMorePress = () => {
    Linking.openURL(
      'https://docs.expo.io/versions/latest/guides/development-mode'
    );
  };

  _handleHelpPress = () => {
    Linking.openURL(
      'https://docs.expo.io/versions/latest/guides/up-and-running.html#can-t-see-your-changes'
    );
  };
}

const Lesson = (props) => (
  <View>
    <TouchableOpacity onPress={() => props.loadClass()}>
      <Text style={styles.lessonText}>
        {props.lesson.name}
      </Text>
    </TouchableOpacity>
  </View>
)

const mapStateToProps = (state) => {
  return {
    booklist: state.books.booklist,
  }
}

const mapDispatchToProps = { loadClass }

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  developmentModeText: {
    marginBottom: 20,
    color: 'rgba(0,0,0,0.4)',
    fontSize: 15,
    textAlign: 'center',
  },
  contentContainer: {
    paddingTop: 80,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeImage: {
    width: 140,
    height: 38,
    resizeMode: 'contain',
    marginTop: 3,
    marginLeft: -10,
  },
  booksContainer: {
    marginHorizontal: 15,
  },
  bookHeader: {
    flexDirection: 'row',
    paddingVertical: 2,
    backgroundColor: 'white',
  },
  bookHeaderIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookHeaderText: {
    fontSize: 18,
    marginVertical: 6,
  },
  lessonText: {
    fontSize: 18,
    marginVertical: 6
  },
});
