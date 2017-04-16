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
function navigateToBibleScreen (dispatch, navigator, book, verse, state) {
  dispatch({
    type: RECEIVE_PASSAGE,
    payload: { state }
  })

  navigator.push('bible', { book, verse })
}

export function requestPassage (book, verse, navigator) {
  return (dispatch) => {
    dispatch({
      type: REQUEST_PASSAGE,
      payload: { book, verse }
    })

    let key = book + ':' + verse
    AsyncStorage.getItem(key).then((value) => {
      if (value != null) {
        console.log("[Cache]Hit:" + book + ':' + verse)
        navigateToBibleScreen(dispatch, navigator, book, verse, eval("(" + value + ")"))
      } else {
        console.log("[Cache]Miss:"+key)
        // fetch bible verse from web service
        fetch(getUrl(book, verse))
          .then((response) => {
            // FIXME: [Wei] "response.json()" triggers error on Android, so I have to use "eval"
            return eval("(" + response._bodyText + ")")
          })
          .then((responseJson) => {
            console.log("WebService returns: " + JSON.stringify(responseJson))
            if (responseJson.error != undefined) {
              alert(responseJson.error)    
              console.warn(responseJson.error)
            } else {
              AsyncStorage.setItem(key, JSON.stringify(responseJson))
              console.log("[Cache]Set:" + key)
              navigateToBibleScreen(dispatch, navigator, book, verse, responseJson)
            }
          })
          .catch((error) => {
            alert(error)
            console.warn(error)
          });
      }
    }).done();
  }
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  paragraphs: [{
    id: 0,
    title: '',
    verses: []
  }]
}

const ACTION_HANDLERS = {
  [REQUEST_PASSAGE]: (state, action) => state,
  [RECEIVE_PASSAGE]: (state, action) => action.payload.state,
  [FAILURE_PASSAGE]: (state, action) => state,
}

export default function passageReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
