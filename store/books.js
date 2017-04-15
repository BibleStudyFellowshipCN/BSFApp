// ------------------------------------
// Constants
// ------------------------------------
export const REQUEST_BOOKS = 'REQUEST_BOOKS'
export const RECEIVE_BOOKS = 'RECEIVE_BOOKS'
export const FAILURE_BOOKS = 'FAILURE_BOOKS'

// ------------------------------------
// Actions
// ------------------------------------
export function requestBooks () {
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  booklist: [{
    title: '约翰福音',
    lessons: [{
      id: 1,
      name: '第25课 约翰福音18:28-19:17'
    }, {
      id: 2,
      name: '第26课 约翰福音19:18-30'
    }, {
      id: 3,
      name: '第27课 约翰福音19:31-42'
    }, {
      id: 4,
      name: '第28课 约翰福音20'
    }, {
      id: 5,
      name: '第27课 约翰福音21'
    }]
  }, {
    title: '罗马书 - 明年',
    lessons: [{
      id: 6,
      name: '第一课'
    }, {
      id: 7,
      name: '第二课'
    }, {
      id: 8,
      name: '第三课'
    }]
  }]
}

const ACTION_HANDLERS = {
  [REQUEST_BOOKS]: (state, action) => state,
  [RECEIVE_BOOKS]: (state, action) => state,
  [FAILURE_BOOKS]: (state, action) => state,
}

export default function booksReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
