import { combineReducers } from 'redux'
import booksReducer from './books'
import passageReducer from './passage'

export const makeRootReducer = (asyncReducers) => {
  return combineReducers({
    books: booksReducer,
    passage: passageReducer,
    ...asyncReducers
  })
}

export const injectReducer = (store, { key, reducer }) => {
  if (Object.hasOwnProperty.call(store.asyncReducers, key)) return

  store.asyncReducers[key] = reducer
  store.replaceReducer(makeRootReducer(store.asyncReducers))
}

export default makeRootReducer
