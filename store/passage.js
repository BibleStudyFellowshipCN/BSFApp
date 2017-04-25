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
  return async(dispatch) => {
    try {
      const content = await loadAsync(Models.Passage, getUrl(book, verse), true)
      if (content != null) {
        dispatch({
          type: RECEIVE_PASSAGE,
          payload: { passage: content }
        })

        navigator.push('bible', { book, verse })
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
  [RECEIVE_PASSAGE]: (state, action) => action.payload.passage,
}

export default function passageReducer (state = 0, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
