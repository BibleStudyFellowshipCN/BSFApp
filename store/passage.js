import { Models } from '../dataStorage/models';
import { loadAsync } from '../dataStorage/storage';

// ------------------------------------
// Constants
// ------------------------------------
export const RECEIVE_PASSAGE = 'RECEIVE_PASSAGE'

const bookid = require('../assets/bookid.json');

// Build the web service url
function getUrl(book, verse) {
  // Parse the book name to id
  let bookId = 1;
  for (var i in bookid) {
    if (bookid[i].name == book) {
      bookId = bookid[i].id;
      break;
    }
  }
  return bookId + "/" + verse;
}

// ------------------------------------
// Actions
// ------------------------------------
export function requestPassage (book, verse, navigator) {
  return async(dispatch, getState) => {
    try {
      const id = getUrl(book, verse);
      const state = getState();
      let content;
      if (!state.passages[id]) {
        content = await loadAsync(Models.Passage, id);
        if (content) {
          dispatch({
            type: RECEIVE_PASSAGE,
            payload: { id: id, passage: content }
          });

          navigator.push('bible', { book, verse });
        }
      }
      else {
        navigator.push('bible', { book, verse });
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
  passages: {}
}

const ACTION_HANDLERS = {
  [RECEIVE_PASSAGE]: (state, action) => Object.Assign({}, state.passages, { [action.payload.id]: action.payload.passage}),
}

export default function passageReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
