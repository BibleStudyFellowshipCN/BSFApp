import { AsyncStorage } from 'react-native'

// ------------------------------------
// Constants
// ------------------------------------
export const REQUEST_PASSAGE = 'REQUEST_PASSAGE'
export const RECEIVE_PASSAGE = 'RECEIVE_PASSAGE'
export const FAILURE_PASSAGE = 'FAILURE_PASSAGE'

// Build the web service url
function getUrl(book, verse) {
  // Parse the book name to id
  var bookId = 1
  var bookid = require('../books/bookid.json')
  for (var i in bookid) {
    if (bookid[i].name == book) {
      bookId = bookid[i].id
      break
    }
  }
  var url = "http://www.turbozv.com/bsf/api2/" + bookId + "/" + verse
  console.log(" GET " + url)
  return url
}

// ------------------------------------
// Actions
// ------------------------------------
async function getBibleVerse(book, verse) {
  const key = book + ':' + verse
  const cache = await AsyncStorage.getItem(key)
  if (cache != null) {
    console.log("[Cache]Hit:" + book + ':' + verse)
    return eval("(" + cache + ")")
  }

  console.log("[Cache]Miss:" + key)

  // fetch bible verse from web service
  const response = await fetch(getUrl(book, verse))  
  // FIXME: [Wei] "response.json()" triggers error on Android, so I have to use "eval"
  const responseJson = eval("(" + response._bodyText + ")")

  console.log("WebService returns: " + JSON.stringify(responseJson))
  if (responseJson.error != undefined) {
    alert(responseJson.error)
    console.warn(responseJson.error)
    return null
  }

  AsyncStorage.setItem(key, JSON.stringify(responseJson))
  console.log("[Cache]Set:" + key)
  return responseJson
}

export function requestPassage (book, verse, navigator) {
  return async(dispatch) => {
    dispatch({
      type: REQUEST_PASSAGE,
      payload: { book, verse }
    })

    try {
      const content = await getBibleVerse(book, verse)
      if (content != null) {
        dispatch({
          type: RECEIVE_PASSAGE,
          payload: { content }
        })

        navigator.push('bible', { book, verse })
      }
    } catch(error) {
      console.log(error)
      alert(error)
      dispatch({
        type: FAILURE_PASSAGE,
        payload: error,
      })
    }
  }
}

// ------------------------------------
// Reducer
// ------------------------------------
const ACTION_HANDLERS = {
  [REQUEST_PASSAGE]: (state, action) => state,
  [RECEIVE_PASSAGE]: (state, action) => action.payload.content,
  [FAILURE_PASSAGE]: (state, action) => state,
}

export default function passageReducer (state = 0, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
