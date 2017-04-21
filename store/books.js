import { AsyncStorage } from 'react-native'
import { cacheFetch } from '../store/cache.js'

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
  return (dispatch) => {
    dispatch({
      type: 'REQUEST_CLASS',
    })

    cacheFetch('home.json')
    .then((content) => {
      if (content != null) {
        dispatch({
          type: RECEIVE_BOOKS,
          payload: { state: content }
        })
      }
    })
  }
}

// ------------------------------------
// Reducer
// ------------------------------------
const ACTION_HANDLERS = {
  [REQUEST_BOOKS]: (state, action) => state,
  [RECEIVE_BOOKS]: (state, action) => action.payload.state,
  [FAILURE_BOOKS]: (state, action) => state,
}

export default function booksReducer (state = 0, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
