// ------------------------------------
// Constants
// ------------------------------------
export const REQUEST_CLASS = 'REQUEST_CLASS'
export const RECEIVE_CLASS = 'RECEIVE_CLASS'
export const FAILURE_CLASS = 'FAILURE_CLASS'

// ------------------------------------
// Actions
// ------------------------------------
export function loadClass (lesson, navigator) {
  const { id, name } = lesson
  return (dispatch) => {
    dispatch({
      type: 'REQUEST_CLASS',
      payload: lesson,
    })
    navigator.push('class', { lesson })
  }
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  id: 0,
  name: '第二十课',
  dayQuestions:  {
    one: {
      questions: [{
        id: 1,
        questionText: '7.这个神迹如何指出耶稣为灵 里饥饿的人所做的事？请将他 行神迹的步骤逐一列出。你可 以怎样依循这些步骤来给别人 生命的粮－－耶稣？ 参阅经文：',
        answer: '',
        quotes: [{
          book: '马可福音',
          verse: '8:24-28',
        }, {
          book: '马可福音',
          verse: '6:34-38',
        }]
      }, {
        id: 2,
        questionText: '8.这个神迹如何指出耶稣为灵 里饥饿的人所做的事？请将他 行神迹的步骤逐一列出。你可 以怎样依循这些步骤来给别人 生命的粮－－耶稣？ 参阅经文：',
        answer: '',
        quotes: [{
          book: '马可福音',
          verse: '8:24-28',
        }, {
          book: '马可福音',
          verse: '6:34-38',
        }]
      }]
    },
    two: { questions: [] },
    three: { questions: [] },
    four: { questions: [] },
    five: { questions: [] },
    six: { questions: [] },
    seven: { questions: [] },
  }
}

const ACTION_HANDLERS = {
  [REQUEST_CLASS]: (state, action) => Object.assign({}, state, {
    id: action.id,
    name: action.name,
  }),
  [RECEIVE_CLASS]: (state, action) => state,
  [FAILURE_CLASS]: (state, action) => state,
}

export default function booksReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
