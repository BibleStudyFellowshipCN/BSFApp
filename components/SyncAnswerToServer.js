import React from 'react';
import {
  View,
  TouchableOpacity,
  Button,
  StyleSheet,
  Text,
  Alert,
  Platform
} from 'react-native';
import { Entypo } from '@expo/vector-icons';
import { loadAsync, callWebServiceAsync } from '../dataStorage/storage';
import { Models } from '../dataStorage/models';
import { Constants } from 'expo';
import { getCurrentUser } from '../store/user';
import { getI18nText } from '../store/I18n';

export default class SyncAnswerToServer extends React.Component {

  async onUpload() {
    console.log("Upload " + JSON.stringify(this.props.lessonDay));   
    try {
      const answerContent = await loadAsync(Models.Answer, null, false);
      console.log("Upload answer: " + JSON.stringify(answerContent));
      for (i = 0; i < this.props.lessonDay.questions.length; i++) {
        var qid = this.props.lessonDay.questions[i].id;
        var answer = answerContent.answer? null : answerContent.answers[qid];
        var phone = getCurrentUser().getCellphone();
        if (answer) {
          var data = {
            device: Constants['deviceId'],
            question_id: qid,
            answer: answer.answerText,
            cellphone: phone
          }
          await callWebServiceAsync(Models.UploadAnswer.restUri, '?cellphone=' + phone, 'POST', [], data);
        }
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Upload Error", error);
      return;
    }
  }

  async onDownload() {
    console.log("Download " + JSON.stringify(this.props.lessonDay));   
    try {
      for (i = 0; i < this.props.lessonDay.questions.length; i++) {
        var qid = this.props.lessonDay.questions[i].id;
        var cellphone = getCurrentUser().getCellphone();
        const answerContent = await callWebServiceAsync(Models.GetAnswer.restUri, '/' + qid + '?cellphone=' + cellphone, 'GET');
        console.log("Downloaded answer: " + JSON.stringify(answerContent));
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Upload Error", error);
      return;
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <Button
          onPress={this.onUpload.bind(this)}
          title={getI18nText("上传答案")}
          color="#cccccc" />
        <Button
          onPress={this.onDownload.bind(this)}
          title={getI18nText("下载答案")}
          color="#cccccc" />
      </View>
    );
  }
}

const styles = StyleSheet.create({
    container: {
      marginRight: 20,
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    buttonText: {
        flex: 1,
        backgroundColor: 'whitesmoke',
    }
  });