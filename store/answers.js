import { debounce } from 'lodash';
import { saveAsync } from '../dataStorage/storage';
import { Models } from '../dataStorage/models';

// ------------------------------------
// Constants
// ------------------------------------
export const RECEIVED_ANSWERS = 'RECEIVED_ANSWERS'
export const LOAD_ANSWERS = 'LOAD_ANSWERS'
export const UPDATE_ANSWER = 'UPDATE_ANSWER'
export const CLEAR_ANSWERS = 'CLEAR_ANSWERS'

export const ANSWER_KEY = 'answer'

function saveAnswer(newState) {
  console.log("Saving answers...");
  saveAsync(newState, Models.Answer);
}
const debouncedSaveAnswer = debounce(saveAnswer, wait = 500);

export function updateAnswer(questionId, answerText) {
  return (dispatch) => {
    dispatch({
      type: UPDATE_ANSWER,
      payload: { questionId, answerText }
    })
  }
}

export function clearAnswers() {
  return (dispatch) => {
    dispatch({
      type: CLEAR_ANSWERS
    })
  }
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  answers: {}
}

const ACTION_HANDLERS = {
  [UPDATE_ANSWER]: (state, action) => {
    const newState = Object.assign({}, state, {
      answers: Object.assign({}, state.answers, {
        [action.payload.questionId]: action.payload
      })
    });
    console.log(`Save answer [${action.payload.questionId}]: ${action.payload.answerText}`);

    debouncedSaveAnswer(newState);
    return newState;
  },
  [CLEAR_ANSWERS]: (state, action) => {
    console.log('Clear answers');
    saveAsync(initialState, Models.Answer);
    return initialState;
  }
}

export default function booksReducer(state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
