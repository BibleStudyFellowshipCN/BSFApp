import { Models } from '../dataStorage/models';
import { loadAsync } from '../dataStorage/storage';

// ------------------------------------
// Constants
// ------------------------------------
export const RECEIVE_BOOKS = 'RECEIVE_BOOKS';

// ------------------------------------
// Actions
// ------------------------------------
export function requestBooks() {
  return async (dispatch) => {

    const books = await loadAsync(Models.Book, '', false);
    dispatch({
      type: RECEIVE_BOOKS,
      payload: { books: books },
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
}

export default function booksReducer(state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
