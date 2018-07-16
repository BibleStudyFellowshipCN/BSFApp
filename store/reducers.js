import { combineReducers } from 'redux'
import booksReducer from './books'
import lessonsReducer from './lessons'
import passageReducer from './passage'

export const makeRootReducer = (asyncReducers) => {
  return combineReducers({
    books: booksReducer,
    passages: passageReducer,
    lessons: lessonsReducer,
    ...asyncReducers
  })
}

export const injectReducer = (store, { key, reducer }) => {
  if (Object.hasOwnProperty.call(store.asyncReducers, key)) return

  store.asyncReducers[key] = reducer
  store.replaceReducer(makeRootReducer(store.asyncReducers))
}

export default makeRootReducer
