import { Models } from '../dataStorage/models';
import { loadAsync } from '../dataStorage/storage';

// ------------------------------------
// Constants
// ------------------------------------
export const RECEIVE_LESSON = 'RECEIVE_LESSON'
export const CLEAR_LESSON = 'CLEAR_LESSON'

// ------------------------------------
// Actions
// ------------------------------------
export function loadLesson(id) {
  return async (dispatch, getState) => {
    try {
      // Then make the http request for the class (a placeholder url below)
      // we use the await syntax.
      const state = getState();
      if (!state.lessons[id]) {
        const lessonContent = await loadAsync(Models.Lesson, id, true);
        if (lessonContent) {
          // Now that we received the json, we dispatch an action to update the stage
          dispatch({
            type: RECEIVE_LESSON,
            payload: { id: id, lesson: lessonContent },
          })
        }
      }
    } catch (error) {
      console.log(error);
      alert(error);
    }
  }
}

export function clearLesson() {
  return (dispatch) => {
    dispatch({
      type: CLEAR_LESSON,
      payload: {},
    })
  }
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
}

const ACTION_HANDLERS = {
  [RECEIVE_LESSON]: (state, action) => Object.assign({}, state, { [action.payload.id]: action.payload.lesson }),
  [CLEAR_LESSON]: (state, action) => { return {}; }
}

export default function lessonsReducer(state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
