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

class BibleScreen extends React.Component {
  static route = {
    navigationBar: {
      title: (route) => {
        return route.book
      },
    },
  };

  render() {
    return (
      <View style={styles.container}>
        <ScrollView>
          { this.props.paragraphs.map(paragraph => (
            <Paragraph paragraph={paragraph}/>
          )) }
        </ScrollView>
      </View>
    );
  }
}

const Paragraph = (props) => (
  <View style={styles.paragraphContainer}>
    <Text>
      { props.paragraph.verses.map(verse => (
        <Verse verse={verse} />
      )) }
    </Text>
  </View>
)

const Verse = (props) => (
  <Text style={[styles.verseText, { color: props.verse.bold ? 'black' : 'grey' }]}>
    {props.verse.verse}
    {props.verse.text}
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
  },
  verseText: {
    fontSize: 18,
    lineHeight: 30,
  }
});
