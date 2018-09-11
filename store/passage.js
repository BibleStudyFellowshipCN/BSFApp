import { Models } from '../dataStorage/models';
import { loadAsync } from '../dataStorage/storage';
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
      // Then make the http request for the class (a placeholder url below)
      // we use the await syntax.
      const state = getState();
      if (!state.passages[passageId]) {
        const passage = await loadAsync(Models.Passage, passageId + "?bibleVersion=" + getCurrentUser().getBibleVersion(), true);

        let parsedPassage = JSON.parse(JSON.stringify(passage));
        const version = getCurrentUser().getBibleVersion2();
        if (version) {
          let verses = [];
          const passage2 = await loadAsync(Models.Passage, passageId + "?bibleVersion=" + version, true);
          if (passage2) {
            // merge
            const length = passage2.paragraphs[0].verses.length;
            for (let i = 0; i < length; i++) {
              let verse = passage.paragraphs[0].verses[i];
              if (verse) verses.push(verse);
              verse = passage2.paragraphs[0].verses[i];
              if (verse) verses.push(verse);
            }
            parsedPassage.paragraphs[0].verses = verses;
          }
        }

        dispatch({
          type: RECEIVE_PASSAGE,
          payload: { id: passageId, passage: parsedPassage }
        });
      }
    } catch (error) {
      console.log(error);
      alert(error);
    }
  }
}

export function clearPassage() {
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
