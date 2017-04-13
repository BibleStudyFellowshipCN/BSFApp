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
  var verseStart = verse.indexOf(':')
  var chapter = verse.substring(0, verseStart)
  verse = verse.substring(verseStart + 1)
  var url = "http://www.turbozv.com/bsf/api/" + bookId + "/" + chapter + "/" + verse
  console.log(" GET " + url)
  return url
}

// Parse the JSON content to state
function parseBibleVerse(content) {
    var state = {"paragraphs": [{"id":0,"title":"","verses":[]}]}
    for (var i in content.Verses) {
        state.paragraphs[0].verses.push({"verse": content.Chapter + ":" + i, "text": content.Verses[i], "bold": true})
    }    
    return state
}

// ------------------------------------
// Actions
// ------------------------------------
export function requestPassage (book, verse, navigator) {
  return (dispatch) => {
    dispatch({
      type: REQUEST_PASSAGE,
      payload: { book, verse }
    })

    // fetch bible verse from web service
    fetch(getUrl(book, verse))
    .then((response) => response.json())
      .then((responseJson) => {
          console.log("WebService returns: " + JSON.stringify(responseJson))
          if (responseJson.error != undefined)
          {
            alert(responseJson.error)    
            console.warn(responseJson.error)
            return
          }

          dispatch({
            type: RECEIVE_PASSAGE,
            payload: { navigator, book, verse, content: responseJson.content }
          })
      })
      .catch((error) => {
        alert(error)
        console.warn(error)
      });
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
  [RECEIVE_PASSAGE]: (state, action) => {
    console.log("RECEIVE_PASSAGE:")
    let navigator = action.payload.navigator
    let book = action.payload.book
    let verse = action.payload.verse
    let content = action.payload.content
    let newState = parseBibleVerse(content)

    // navigate to bible screen
    navigator.push('bible', { book, verse, content })
    return newState
  },
  [FAILURE_PASSAGE]: (state, action) => state,
}

export default function passageReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
