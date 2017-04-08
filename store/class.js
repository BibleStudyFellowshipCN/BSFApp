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
  class: {
    id: 0,
    name: '第二十课',
    dayQuestions:  {
      one: {},
      two: {},
      three: {},
      four: {},
      five: {},
      six: {},
      seven: {},
    }
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
