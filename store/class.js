import { cacheFetch } from '../store/cache.js'

// ------------------------------------
// Constants
// ------------------------------------
export const REQUEST_CLASS = 'REQUEST_CLASS'
export const RECEIVE_CLASS = 'RECEIVE_CLASS'
export const FAILURE_CLASS = 'FAILURE_CLASS'

// ------------------------------------
// Actions
// ------------------------------------
function getUrl(lesson) {
  return lesson.id + '.json'
}

export function loadClass (lesson, navigator) {
  const { id, name } = lesson
  return async(dispatch) => {

    // First dispatch an action that says that we are requesting a class
    dispatch({
      type: 'REQUEST_CLASS',
      payload: lesson,
    })

    try {
      // Then make the http request for the class (a placeholder url below)
      // we use the await syntax.
      const content = await cacheFetch(getUrl(lesson))
      if (content != null) {
        // Now that we received the json, we dispatch an action saying we received it
        dispatch({
          type: 'RECEIVE_CLASS',
          payload: {state: content},
        })

        // TODO: write a the action handler to update the state with the received data.

        // Finally, we push on a new route
        navigator.push('class', { lesson })
      }
    } catch(error) {
      alert(error)
      // We handle errors here, and dispatch the failure action in case of an error
      console.log(error)
      dispatch({
        type: 'FAILURE_CLASS',
        payload: error,
      })
    }
  }
}

// ------------------------------------
// Reducer
// ------------------------------------
const ACTION_HANDLERS = {
  [REQUEST_CLASS]: (state, action) => state,
  [RECEIVE_CLASS]: (state, action) => action.payload.state,
  [FAILURE_CLASS]: (state, action) => state,
}

export default function booksReducer (state = 0, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
