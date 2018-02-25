import { Models } from '../dataStorage/models';
import { loadAsync } from '../dataStorage/storage';

// ------------------------------------
// Constants
// ------------------------------------
export const RECEIVE_BOOKS = 'RECEIVE_BOOKS';
export const CLEAR_BOOKS = 'CLEAR_BOOKS';

// ------------------------------------
// Actions
// ------------------------------------
export function requestBooks() {
  return async (dispatch) => {

    const books = await loadAsync(Models.Book, '', true);
    dispatch({
      type: RECEIVE_BOOKS,
      payload: { books: books },
    })
  }
}

export function clearBooks() {
  return (dispatch) => {
    dispatch({
      type: CLEAR_BOOKS,
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
  [RECEIVE_BOOKS]: (state, action) => action.payload.books,
  [CLEAR_BOOKS]: (state, action) => { return {}; }
}

export default function booksReducer(state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
