import React from 'react';
import { connect } from 'react-redux'
import {
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { updateAnswer } from '../store/answers'

function getHeight(text) {
  const lines = text.split('\n');
  return Math.max(lines.length * 21, 120);
}

const Answer = (props) => (
  <View style={[styles.answerContainer, { height: getHeight(props.answer.answerText) }]}>
    <TextInput
      style={styles.answerInput}
      blurOnSubmit={false}
      multiline
      value={props.answer.answerText}
      onChangeText={(text) => {
        props.updateAnswer(
          props.questionId,
          text,
        )
      }}
    />
  </View>
)

const nullAnswer = {
  answerText: ''
}

const mapStateToProps = (state, ownProps) => {
  return {
    answer: state.answers.answers[ownProps.questionId] || nullAnswer
  }
}

const mapDispatchToProps = {
  updateAnswer
}

export default connect(mapStateToProps, mapDispatchToProps)(Answer)

const styles = StyleSheet.create({
  answerContainer: {
    marginTop: 5,
    padding: 5,
    backgroundColor: 'whitesmoke',
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 5,
  },
  answerInput: {
    flex: 1,
    fontSize: 16,
    textAlignVertical: 'top'
  },
});
