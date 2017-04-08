// ------------------------------------
// Constants
// ------------------------------------
export const REQUEST_PASSAGE = 'REQUEST_PASSAGE'
export const RECEIVE_PASSAGE = 'RECEIVE_PASSAGE'
export const FAILURE_PASSAGE = 'FAILURE_PASSAGE'

// ------------------------------------
// Actions
// ------------------------------------
export function requestPassage (book, verse, navigator) {
  return (dispatch) => {
    dispatch({
      type: REQUEST_PASSAGE,
      payload: { book, verse }
    })

    navigator.push('bible', { book })
  }
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  paragraphs: [{
    verses: [{
      verse: '6:30',
      text: '你們這小信的人哪、野地裡 的草、今天還在、明天就丟在爐 裡、 神還給他這樣的妝飾、何 況你們呢。',
      bold: false,
    }, {
      verse: '6:31',
      text: '所以不要憂慮、 說、喫甚麼、喝甚麼、穿甚麼。',
      bold: true,
    }, {
      verse: '6:32',
      text: '這都是外邦人所求的．你們 需用的這一切東西、你們的天父 是知道的。',
      bold: true,
    }, {
      verse: '6:33',
      text: '	你們要先求他的 國、和他的義這些東西都要加給 你們了。',
      bold: true,
    }, {
      verse: '6:34',
      text: '所以不要為明天憂 慮．因為明天自有明天的憂慮． 一天的難處一天當就夠了。',
      bold: false,
    }]
  }, {
    verses: [

    ]
  }]
}

const ACTION_HANDLERS = {
  [REQUEST_PASSAGE]: (state, action) => state,
  [RECEIVE_PASSAGE]: (state, action) => state,
  [FAILURE_PASSAGE]: (state, action) => state,
}

export default function passageReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
