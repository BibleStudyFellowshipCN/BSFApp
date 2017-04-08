import { AsyncStorage } from 'react-native'
import Storage from 'react-native-storage'
import { debounce } from 'lodash'


if (!global.storage) {
  global.storage = new Storage({
    size: 10000,
    storageBackend: AsyncStorage,
    enableCache: true,
  })
}

const storage = global.storage

// ------------------------------------
// Constants
// ------------------------------------
export const LOAD_ANSWERS = 'LOAD_ANSWERS'
export const UPDATE_ANSWER = 'UPDATE_ANSWER'

export const ANSWER_KEY = 'answer'

// ------------------------------------
// Actions
// ------------------------------------
export function loadAnswers () {
  return (dispatch) => {
    storage.load({ key: ANSWER_KEY })
      .then((answers) => {
        console.log(answers)
        dispatch({
          type: LOAD_ANSWERS,
          payload: answers,
        })
      })
      .catch(err => {
        console.warn(err.message)
      })
  }
}

export function saveAnswer (questionId, answer) {
  storage.save({
    key: ANSWER_KEY,
    id: questionId,
    rawData: answer
  }).then((a, b) => {
    console.log('@@@@@@@@@', a, b)
  })
}
const debouncedSaveAnswer = debounce(saveAnswer, wait = 500)

export function updateAnswer (questionId, answer) {
  return (dispatch) => {
    dispatch({
      type: UPDATE_ANSWER,
      payload: { questionId, answer }
    })

    debouncedSaveAnswer(questionId, answer)
  }
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  answers: {}
}

const ACTION_HANDLERS = {
  [LOAD_ANSWERS]: (state, action) => Object.assign({}, state, {
    answers: action.payload,
  }),
  [UPDATE_ANSWER]: (state, action) => Object.assign({}, state, {
    answers: Object.assign({}, state.answers, {
      [action.payload.questionId]: action.payload.answer
    })
  })
}

export default function booksReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
