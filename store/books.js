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
    title: '约翰福音2016-2017',
    lessons: [{
      id: '2016_25',
      name: '第25课 约翰福音18:28-19:17 (04/17/2017)'
    }, {
      id: '2016_26',
      name: '第26课 约翰福音19:18-30 (04/24/2017)'
    }, {
      id: '2016_27',
      name: '第27课 约翰福音19:31-42 (05/01/2017)'
    }, {
      id: '2016_28',
      name: '第28课 约翰福音20 (05/08/2017)'
    }, {
      id: '2016_29',
      name: '第29课 约翰福音21 (05/15/2017)'
    }]
  }, {
    title: '罗马书2017-2018',
    lessons: [{
      id: '2017_1',
      name: '第1课'
    }, {
      id: '2017_2',
      name: '第2课'
    }, {
      id: '2017_3',
      name: '第3课'
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
