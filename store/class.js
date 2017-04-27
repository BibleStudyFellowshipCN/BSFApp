import { Models } from '../dataStorage/models';
import { loadAsync } from '../dataStorage/storage';

// ------------------------------------
// Constants
// ------------------------------------
export const RECEIVE_CLASS = 'RECEIVE_CLASS'

// ------------------------------------
// Actions
// ------------------------------------
function getId(lesson) {
  return lesson.id + '.json'
}

export function loadClass (lesson, navigator) {
  const { id, name } = lesson
  return async(dispatch) => {
    try {
      // Then make the http request for the class (a placeholder url below)
      // we use the await syntax.
      const classContent = await loadAsync(Models.Class, `${id}.json`);
      if (classContent) {
        // Now that we received the json, we dispatch an action to update the stage
        dispatch({
          type: 'RECEIVE_CLASS',
          payload: {class: classContent},
        })

        // Finally, we push on a new route
        navigator.push('class', { lesson })
      }
    } catch(error) {
      console.log(error)
      alert(error)
    }
  }
}

// ------------------------------------
// Reducer
// ------------------------------------
const ACTION_HANDLERS = {
  [RECEIVE_CLASS]: (state, action) => action.payload.class,
}

export default function booksReducer (state = 0, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
