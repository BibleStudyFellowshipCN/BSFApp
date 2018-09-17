import React from 'react';
import { connect } from 'react-redux';
import { TouchableOpacity, StyleSheet, View, Alert, TextInput, KeyboardAvoidingView, Text, Share, Dimensions, ScrollView } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import { updateAnswer } from '../store/answers';
import { loadAsync } from '../dataStorage/storage';
import { getI18nText } from '../store/I18n';
import { Button } from 'react-native-elements';
import { Models } from '../dataStorage/models';
import { getCurrentUser } from '../store/user';
import SegmentedControlTab from 'react-native-segmented-control-tab';

class AnswerManageScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: getI18nText('答案管理')
    };
  };

  state = {
    answers: '',
    importAnswers: '',
    selectedIndex: 0
  };

  componentWillMount() {
    this.init();
  }

  async init() {
    const answerContent = await loadAsync(Models.Answer, null, false);
    if (answerContent && answerContent.answers) {
      let answers = [];
      for (let i in answerContent.answers) {
        const item = answerContent.answers[i];
        answers.push({ id: item.questionId, value: item.answerText });
      }

      this.setState({ answers: JSON.stringify(answers) });
    }
  }

  export() {
    const shareData = { title: getI18nText('导出'), subject: getI18nText('导出'), message: this.state.answers };
    console.log(shareData);
    Share.share(shareData);
  }

  import() {
    try {
      const content = JSON.parse(this.importAnswerText);
      if (content.length == 0) {
        Alert.alert(getI18nText('错误'), getI18nText('没有答案'));
        return;
      }

      for (let i in content) {
        const item = content[i];
        console.log(item.id + ':' + item.value);
      }

      Alert.alert(getI18nText('确认'), getI18nText('如果本机已有对应的答案，内容将会被覆盖，请确认是否导入答案？'), [
        {
          text: 'Yes', onPress: () => {
            for (let i in content) {
              const item = content[i];
              this.props.updateAnswer(item.id, item.value);
            }

            Alert.alert(getI18nText('导入成功'));
          }
        },
        { text: 'Cancel', onPress: () => { } },
      ]);

    } catch (err) {
      Alert.alert(getI18nText('错误'), getI18nText('答案格式不正确'), [
        { text: 'OK', onPress: () => { } }
      ]);
    }
  }

  render() {
    return (
      <KeyboardAvoidingView style={styles.container} behavior='padding' keyboardVerticalOffset={0}>
        <View style={{ margin: 10 }}>
          <SegmentedControlTab
            values={[getI18nText('导出'), getI18nText('导入')]}
            selectedIndex={this.state.selectedIndex}
            onTabPress={(index) => this.setState({ selectedIndex: index })}
          />
        </View>

        {
          this.state.selectedIndex == 0 &&
          <View style={{ alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 15 }}>{getI18nText('请全选以下文本后复制，或者导出')} </Text>
              <TouchableOpacity onPress={this.export.bind(this)}>
                <Entypo
                  name='share-alternative'
                  size={28}
                  color='#e67e22' />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <Text
                selectable={true}
                style={[styles.answersExport, {
                  fontSize: getCurrentUser().getLessonFontSize(),
                  width: Dimensions.get('window').width - 20
                }]}>{this.state.answers}</Text>
            </ScrollView>
          </View>
        }

        {
          this.state.selectedIndex == 1 &&
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 14 }}>{getI18nText('请在以下粘贴导出的答案用于导入')} </Text>
            <TextInput
              style={[styles.answersImport, {
                fontSize: getCurrentUser().getLessonFontSize(),
                width: Dimensions.get('window').width - 20
              }]}
              blurOnSubmit={false}
              multiline
              defaultValue={this.state.importAnswers}
              onChangeText={(text) => { this.importAnswerText = text }}
            />
            <View style={{ alignItems: 'center' }}>
              <Button
                backgroundColor='#397EDC'
                borderRadius={5}
                containerViewStyle={{ width: 130 }}
                title={getI18nText('导入')}
                onPress={this.import.bind(this)} />
            </View>
          </View>
        }
      </KeyboardAvoidingView>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {};
}

const mapDispatchToProps = {
  updateAnswer
}

export default connect(mapStateToProps, mapDispatchToProps)(AnswerManageScreen)

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  answersExport: {
    margin: 10,
    borderWidth: 1,
    borderColor: 'whitesmoke',
    textAlignVertical: 'top',
    backgroundColor: 'whitesmoke'
  },
  answersImport: {
    height: 170,
    margin: 10,
    borderWidth: 1,
    borderColor: 'whitesmoke',
    textAlignVertical: 'top',
    backgroundColor: 'whitesmoke'
  }
});
