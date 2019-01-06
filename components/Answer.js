import React from 'react';
import { connect } from 'react-redux';
import {
  StyleSheet,
  TextInput,
  View,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { updateAnswer } from '../store/answers';
import { getCurrentUser } from '../store/user';

class Answer extends React.Component {
  state = {
    editMode: false,
    height: 0
  };

  contentSize = null;

  onContentSizeChange(e) {
    const contentSize = e.nativeEvent.contentSize;

    // Support earlier versions of React Native on Android.
    if (!contentSize) return;

    if (!this.contentSize || this.contentSize.height !== contentSize.height) {
      this.contentSize = contentSize;
      this.setState({ height: this.contentSize.height + 14 });
    }
  }

  onLayout(e) {
    this.setState({ width: Dimensions.get('window').width });
  }

  render() {
    const height = Math.max(this.props.homiletics ? 210 : 120, this.state.height);
    const answerWidth = this.state.width - 32;
    return (
      <View style={[styles.answerContainer, { height }]} onLayout={this.onLayout.bind(this)}>
        <TextInput
          ref={ref => this.answer = ref}
          style={[styles.answerInput, { fontSize: getCurrentUser().getLessonFontSize() }]}
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
              width: answerWidth,
              backgroundColor: 'rgba(0, 0, 0, 0.05)' // 'transparent'
            }}
            onPress={() => {
              this.setState({ editMode: true });
              this.answer.focus();
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
    borderRadius: 5
  },
  answerInput: {
    flex: 1,
    textAlignVertical: 'top'
  },
});