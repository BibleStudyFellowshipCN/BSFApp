import React from 'react';
import { connect } from 'react-redux'
import {
  StyleSheet,
  TextInput,
  View,
  Text,
  TouchableOpacity
} from 'react-native';
import { updateAnswer } from '../store/answers'
import Layout from '../constants/Layout';

class Answer extends React.Component {
  state = {
    editMode: false,
    height: 0
  };

  contentSize = null;

  onContentSizeChange(e) {
    const contentSize = e.nativeEvent.contentSize;
    console.log(JSON.stringify(contentSize));

    // Support earlier versions of React Native on Android.
    if (!contentSize) return;

    if (!this.contentSize || this.contentSize.height !== contentSize.height) {
      this.contentSize = contentSize;
      this.setState({ height: this.contentSize.height + 14 });
    }
  }

  render() {
    let height = Math.max(120, this.state.height);
    console.log({ height, edit: this.state.editMode });
    return (
      <View style={[styles.answerContainer, { height }]}>
        <TextInput
          ref='answer'
          style={styles.answerInput}
          blurOnSubmit={false}
          multiline
          value={this.props.answer.answerText}
          onChange={(e) => this.onContentSizeChange(e)}
          onContentSizeChange={(e) => this.onContentSizeChange(e)}
          onChangeText={(text) => {
            this.props.updateAnswer(
              this.props.questionId,
              text,
            )
          }}
          onEndEditing={() => {
            this.setState({ editMode: false });
          }}
        />
        {
          !this.state.editMode &&
          <TouchableOpacity
            style={{
              position: 'absolute',
              height,
              width: Layout.window.width,
              backgroundColor: 'rgba(0, 0, 0, 0.05)' // 'transparent'
            }}
            onPress={() => {
              this.setState({ editMode: true });
              this.refs.answer.focus();

            }}>
          </TouchableOpacity>
        }
      </View >
    );
  }
}

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