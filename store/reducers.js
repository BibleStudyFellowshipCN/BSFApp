import { combineReducers } from 'redux'
import booksReducer from './books.js'

export const makeRootReducer = (asyncReducers) => {
  return combineReducers({
    books: booksReducer,
    ...asyncReducers
  })
}

export const injectReducer = (store, { key, reducer }) => {
  if (Object.hasOwnProperty.call(store.asyncReducers, key)) return

  store.asyncReducers[key] = reducer
  store.replaceReducer(makeRootReducer(store.asyncReducers))
}

export default makeRootReducer
