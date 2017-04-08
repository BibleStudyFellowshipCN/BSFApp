import { combineReducers } from 'redux'
import booksReducer from './books'
import classReducer from './class'
import passageReducer from './passage'
import answersReducer from './answers'

export const makeRootReducer = (asyncReducers) => {
  return combineReducers({
    books: booksReducer,
    passage: passageReducer,
    answers: answersReducer,
    class: classReducer,
    ...asyncReducers
  })
}

export const injectReducer = (store, { key, reducer }) => {
  if (Object.hasOwnProperty.call(store.asyncReducers, key)) return

  store.asyncReducers[key] = reducer
  store.replaceReducer(makeRootReducer(store.asyncReducers))
}

export default makeRootReducer
