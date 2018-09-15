import { Models } from '../dataStorage/models';
import { getPassageAsync } from '../dataStorage/storage';
import { getCurrentUser } from '../store/user';

// ------------------------------------
// Constants
// ------------------------------------
export const RECEIVE_PASSAGE = 'RECEIVE_PASSAGE';
export const CLEAR_PASSAGE = 'CLEAR_PASSAGE';

// ------------------------------------
// Actions
// ------------------------------------
export function loadPassage(passageId) {
  return async (dispatch, getState) => {
    try {
      console.log(`loadPassage:${passageId}`);
      const passage = await getPassageAsync(getCurrentUser().getBibleVersion(), passageId);

      let parsedPassage = JSON.parse(JSON.stringify(passage));
      const version = getCurrentUser().getBibleVersion2();
      if (version) {
        let verses = [];
        const passage2 = await getPassageAsync(getCurrentUser().getBibleVersion2(), passageId);
        if (passage2) {
          // merge
          const length = passage.length > passage2.length ? passage.length : passage2.length;
          for (let i = 0; i < length; i++) {
            if (passage[i]) verses.push(passage[i]);
            if (passage2[i]) verses.push(passage2[i]);
          }
          parsedPassage = verses;
        }
      }

      dispatch({
        type: RECEIVE_PASSAGE,
        payload: { id: passageId, passage: parsedPassage }
      });
    } catch (error) {
      console.log(error);
      alert(error);
    }
  }
}

export function clearPassage() {
  console.log('clearPassage');
  return async (dispatch, getState) => {
    try {
      dispatch({
        type: CLEAR_PASSAGE,
        payload: {},
      });
    } catch (error) {
      console.log(error);
      alert(error);
    }
  }
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
}

const ACTION_HANDLERS = {
  [RECEIVE_PASSAGE]: (state, action) => Object.assign({}, state, { [action.payload.id]: action.payload.passage }),
  [CLEAR_PASSAGE]: (state, action) => { return {} }
}

export default function passageReducer(state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
