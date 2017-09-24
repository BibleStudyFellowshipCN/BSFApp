import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Alert,
  Share,
  Platform
} from 'react-native';
import { Entypo } from '@expo/vector-icons';
import { loadAsync } from '../dataStorage/storage';
import { Models } from '../dataStorage/models';
import { getI18nText } from '../store/I18n';

export default class ExportAnswer extends React.Component {

  getAnswer(answers, questionId) {
    for (var id in answers) {
      if (id == questionId) {
        return '>>' + answers[id].answerText + '\n';
      }
    }

    return '';
  }

  getContent(day, answers) {
    let result = day.title + '\n';
    for (var i in day.questions) {
      result += (day.questions[i].questionText + '\n');
      result += (this.getAnswer(answers, day.questions[i].id) + '\n');
    }
    result += '\n';
    return result;
  }

  async onClick() {
    console.log("Save " + this.props.lessonId);
    try {
      const answerContent = await loadAsync(Models.Answer, null, false);
      console.log(JSON.stringify(answerContent));
      let answers = '';
      if (answerContent && answerContent.answers) {
        answers = answerContent.answers;
      }

      const lessonContent = await loadAsync(Models.Lesson, this.props.lessonId, false);
      if (!lessonContent) {
        Alert.alert("Error", "Network error");
        return;
      }

      let content = lessonContent.name + '\n\n' + getI18nText('背诵经文：') + lessonContent.memoryVerse + '\n\n';
      content += this.getContent(lessonContent.dayQuestions.one, answers);
      content += this.getContent(lessonContent.dayQuestions.two, answers);
      content += this.getContent(lessonContent.dayQuestions.three, answers);
      content += this.getContent(lessonContent.dayQuestions.four, answers);
      content += this.getContent(lessonContent.dayQuestions.five, answers);
      content += this.getContent(lessonContent.dayQuestions.six, answers);

      const shareData = { title: lessonContent.name, subject: lessonContent.name, message: content };
      console.log(shareData);

      Share.share(shareData);
    } catch (error) {
      console.log(error);
      Alert.alert("Error", error);
      return;
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={this.onClick.bind(this)}>
          <Entypo
            name='share-alternative'
            size={28}
            color='#fff' />
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 54,
    marginTop: 8
  }
});
