import React from 'react';
import { ScrollView, StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import { getI18nText } from '../store/I18n';
import { Button } from 'react-native-elements';
import { getCurrentUser } from '../store/user';
import { loadFromCacheAsync } from '../dataStorage/storage';
import Colors from '../constants/Colors'

export default class HomeTrainingScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: getI18nText('教养孩童指南') + navigation.state.params.title
    };
  };

  state = {
    loading: true,
    data: null
  }

  componentWillMount() {
    loadFromCacheAsync('homeTraining', this.props.navigation.state.params.id).then((data) => {
      this.setState({ loading: false, data });
    })
  }

  render() {
    let keyIndex = 0;
    return (
      <View style={styles.container}>
        {
          this.state.loading &&
          <ActivityIndicator
            size="large"
            color={Colors.yellow} />
        }
        {
          !this.state.loading && !this.state.data &&
          <Text selectable={true} style={{ fontSize: getCurrentUser().getLessonFontSize() }}>No content</Text>
        }
        {
          !this.state.loading && this.state.data &&
          <ScrollView
            style={{ backgroundColor: 'white' }}
            ref={ref => this.scrollView = ref}>
            <Text selectable={true} style={{ fontSize: getCurrentUser().getHomeTitleFontSize(), fontWeight: 'bold', margin: 7 }}>{this.state.data.title}</Text>
            {
              this.state.data.content.map(paragraph => (
                <Paragraph key={keyIndex++} type={paragraph.type} text={paragraph.text} />
              ))
            }
          </ScrollView>
        }
      </View>
    );
  }
}

class Paragraph extends React.Component {
  render() {
    if (this.props.type == 'p') {
      return (
        <Text selectable={true} style={{ fontSize: getCurrentUser().getLessonFontSize(), margin: 10 }}>
          <Text selectable={true}>       </Text>
          <Text selectable={true}>{this.props.text}</Text>
        </Text>
      );
    }

    if (this.props.type == 'b') {
      return (<Text selectable={true} style={{ fontSize: getCurrentUser().getLessonFontSize(), margin: 10, fontWeight: 'bold' }}>{this.props.text}</Text>);
    }

    if (this.props.type == 'li') {
      return (
        <Text selectable={true} style={{ fontSize: getCurrentUser().getLessonFontSize(), margin: 10, marginLeft: 24 }}>
          <Text selectable={true}>■  </Text>
          <Text selectable={true}>{this.props.text}</Text>
        </Text>
      );
    }

    return <Text selectable={true} style={{ fontSize: 18, margin: 10 }}>{this.props.text}</Text>
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
