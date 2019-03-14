import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Share,
  Image
} from 'react-native';
import { Print } from 'expo';
import { loadAsync } from '../dataStorage/storage';
import { Models } from '../dataStorage/models';
import { getI18nText } from '../utils/I18n';
import Colors from '../constants/Colors';
import { showMessage } from "react-native-flash-message";

export default class ExportAnswer extends React.Component {

  getAnswer(answers, questionId, isHtml) {
    for (var id in answers) {
      if (id == questionId) {
        return '>>' + answers[id].answerText + (isHtml ? '<br>' : '\n');
      }
    }

    return '';
  }

  getContent(day, answers, isHtml) {
    let result = day.title + (isHtml ? '<br>' : '\n');
    for (var i in day.questions) {
      result += (day.questions[i].questionText + (isHtml ? '<br>' : '\n'));
      result += (this.getAnswer(answers, day.questions[i].id, isHtml) + (isHtml ? '<br>' : '\n'));
    }
    result += (isHtml ? '<br><br>' : '\n');
    return result;
  }

  async onClick() {
    console.log("Save " + this.props.lessonId);
    try {
      const answerContent = await loadAsync(Models.Answer, null, false);
      // console.log(JSON.stringify(answerContent));
      let answers = '';
      if (answerContent && answerContent.answers) {
        answers = answerContent.answers;
      }

      const lessonContent = await loadAsync(Models.Lesson, this.props.lessonId, false);
      if (!lessonContent) {
        showMessage({
          message: getI18nText('错误'),
          description: getI18nText('Network error'),
          duration: 5000,
          type: "danger"
        });
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
      // console.log(shareData);

      Share.share(shareData);
    } catch (error) {
      showMessage({
        message: getI18nText('错误'),
        description: getI18nText(JSON.stringify(error)),
        duration: 5000,
        type: "danger"
      });
    }
  }

  async onPrint() {
    console.log("Print " + this.props.lessonId);
    try {
      const answerContent = await loadAsync(Models.Answer, null, false);
      // console.log(JSON.stringify(answerContent));
      let answers = '';
      if (answerContent && answerContent.answers) {
        answers = answerContent.answers;
      }

      const lessonContent = await loadAsync(Models.Lesson, this.props.lessonId, false);
      if (!lessonContent) {
        showMessage({
          message: getI18nText('错误'),
          description: getI18nText('Network error'),
          duration: 5000,
          type: "danger"
        });
        return;
      }

      let content = '<p><b>' + lessonContent.id + ' ' + lessonContent.name + '</b></p>' +
        '<p>' + getI18nText('背诵经文：') + lessonContent.memoryVerse + '</p>';
      content += '<p>';
      content += this.getContent(lessonContent.dayQuestions.one, answers, true);
      content += this.getContent(lessonContent.dayQuestions.two, answers, true);
      content += this.getContent(lessonContent.dayQuestions.three, answers, true);
      content += this.getContent(lessonContent.dayQuestions.four, answers, true);
      content += this.getContent(lessonContent.dayQuestions.five, answers, true);
      content += this.getContent(lessonContent.dayQuestions.six, answers, true);
      content += '</p>';

      const html = `<style> p { font-size: 11px; } </style> ${content}`;
      // console.log(html);

      // Android has a bug that cannot parse width/height
      if (Platform.OS === 'ios') {
        Print.printAsync({
          html,
          width: 612 - 70,
          height: 792 - 70,
          orientation: Print.Orientation.portrait
        });
      } else {
        Print.printAsync({ html });
      }
    } catch (error) {
      showMessage({
        message: getI18nText('错误'),
        description: getI18nText(JSON.stringify(error)),
        duration: 5000,
        type: "danger"
      });
      return;
    }
  }

  onImportExport() {
    if (this.props.importExport) {
      this.props.importExport();
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={{ width: 10 }} />
        <View style={{ width: 40 }}>
          <TouchableOpacity onPress={this.onPrint.bind(this)}>
            <Image
              style={{ width: 34, height: 34 }}
              source={require('../assets/images/Print.png')} />
          </TouchableOpacity>
        </View>
        <View style={{ width: 40 }}>
          <TouchableOpacity onPress={() => this.onClick()}>
            <Image
              style={{ width: 34, height: 34 }}
              source={require('../assets/images/Share.png')} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.yellow
  }
});
