import React from 'react';
import { connect } from 'react-redux'
import { WebView } from 'react-native';
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

class BibleScreen extends React.Component {
  static route = {
    navigationBar: {
      title: (route) => {
        return route.book + route.verse
      },
    },
  };

  componentWillMount() {
    if (!this.props.lesson) {
      this.props.loadLesson(this.props.route.params.lesson.id);
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <ScrollView>
          { this.props.paragraphs.map(paragraph => (
            <Paragraph key={paragraph.id} paragraph={paragraph}/>
          )) }
        </ScrollView>
      </View>
    );
  }
}

const Paragraph = (props) => (
  <View style={styles.paragraphContainer}>
    { props.paragraph.title ? <Text style={styles.verseText}> { props.paragraph.title } </Text> : null }
    <Text>
      { props.paragraph.verses.map(verse => (
        <Verse key={verse.verse} verse={verse} />
      )) }
    </Text>
  </View>
)

const Verse = (props) => (
  <Text style={[styles.verseText, { color: 'black' }]}>
    {props.verse.verse} {props.verse.text}
  </Text>
)

const mapStateToProps = (state) => {
  return {
    paragraphs: state.passage.paragraphs,
  }
}

const mapDispatchToProps = { }

export default connect(mapStateToProps, mapDispatchToProps)(BibleScreen)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: 'whitesmoke',
  },
  paragraphContainer: {
    flex: 1,
    marginTop: 15,
  },
  verseText: {
    color: 'grey',
    fontSize: 18,
    lineHeight: 30,
  }
});
