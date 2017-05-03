import { Models } from '../dataStorage/models';
import { loadAsync } from '../dataStorage/storage';

// ------------------------------------
// Constants
// ------------------------------------
export const RECEIVE_LESSON = 'RECEIVE_LESSON'

// ------------------------------------
// Actions
// ------------------------------------
export function loadLesson(id) {
  return async(dispatch) => {
    try {
      // Then make the http request for the class (a placeholder url below)
      // we use the await syntax.
      const lessonContent = await loadAsync(Models.Lesson, `${id}.json`, true);
      if (lessonContent) {
        // Now that we received the json, we dispatch an action to update the stage
        dispatch({
          type: RECEIVE_LESSON,
          payload: {id: id, lesson: lessonContent},
        })
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
const initialState = {
}

const ACTION_HANDLERS = {
  [RECEIVE_LESSON]: (state, action) => Object.assign({}, state, {[action.payload.id]: action.payload.lesson}),
}

export default function lessonsReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
