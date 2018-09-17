import { debounce } from 'lodash';
import { saveAsync } from '../dataStorage/storage';
import { Models } from '../dataStorage/models';

// ------------------------------------
// Constants
// ------------------------------------
export const RECEIVED_ANSWERS = 'RECEIVED_ANSWERS'

export const LOAD_ANSWERS = 'LOAD_ANSWERS'
export const UPDATE_ANSWER = 'UPDATE_ANSWER'

export const ANSWER_KEY = 'answer'

function saveAnswer (newState) {
  console.log("Saving answers...");
  saveAsync(newState, Models.Answer);
}
const debouncedSaveAnswer = debounce(saveAnswer, wait = 500)

export function updateAnswer (questionId, answerText) {
  return (dispatch) => {
    dispatch({
      type: UPDATE_ANSWER,
      payload: { questionId, answerText }
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

    debouncedSaveAnswer(newState)
    return newState;
  },
}

export default function booksReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
