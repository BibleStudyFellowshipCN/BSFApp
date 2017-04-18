// ------------------------------------
// Constants
// ------------------------------------
export const REQUEST_CLASS = 'REQUEST_CLASS'
export const RECEIVE_CLASS = 'RECEIVE_CLASS'
export const FAILURE_CLASS = 'FAILURE_CLASS'

// ------------------------------------
// Actions
// ------------------------------------
export function loadClass (lesson, navigator) {
  const { id, name } = lesson
  return async(dispatch) => {

    // First dispatch an action that says that we are requesting a class
    dispatch({
      type: 'REQUEST_CLASS',
      payload: lesson,
    })

    try {
      // Then make the http request for the class (a placeholder url below)
      // we use the await syntax.
      const response = await fetch('https://facebook.github.io/react-native/movies.json');
      const responseJson = await response.json();

      console.log('Received the following json', responseJson)

      // Now that we received the json, we dispatch an action saying we received it
      dispatch({
        type: 'RECEIVE_CLASS',
        payload: responseJson,
      })

      // TODO: write a the action handler to update the state with the received data.

      // Finally, we push on a new route
      navigator.push('class', { lesson })
    } catch(error) {

      // We handle errors here, and dispatch the failure action in case of an error
      console.log(error)
      dispatch({
        type: 'FAILURE_CLASS',
        payload: error,
      })
    }
  }
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  id: '2016_25',
  name: '约翰福音 第25课',
  memoryVerse: '背诵经文：耶稣就对彼得说：“收刀入鞘吧，我父所给我的那杯，我岂可不喝呢？” - 约翰福音18:11',
  dayQuestions:  {
    one: {
      title: '第一天：阅读经文释义及参考经文',
      questions: [{
        id: '2016_25_1',
        questionText: '1. 講課中哪些內容對你特別有意義？',
        answer: '',
        quotes: [],
      }, {
        id: '2016_25_2',
        questionText: '2. 經文釋義對你有什麼幫助？',
        answer: '',
        quotes: [],
      }],
    },
    two: {
      title: '第二天：阅读约翰福音18:28-32',
      readVerse: [{
          book: '約翰福音',
          verse: '18:28-32',
        }],
      questions: [{
        id: '2016_25_3',
        questionText: '3. 猶太領袖為什麼不肯踏進彼拉多的官邸？他們去找彼拉多的理由顯出他們存心怎樣？',
        answer: '',
        quotes: [{
          book: '馬可福音',
          verse: '7:15',
        }],
      }, {
        id: 4,
        questionText: '4. 猶太領袖為什麼要彼拉多來審判耶穌？彼拉多怎樣企圖推脫這責任？羅馬人的審訊和判刑怎樣影響了耶穌受死的方式？',
        answer: '',
        quotes: [{
          book: '馬太福音',
          verse: '20:18-19',
        }, {
          book: '約翰福音',
          verse: '3:14-16',
        }],
      }, {
        id: 5,
        questionText: '5. 請分享你在什麼處境中想過利用屬靈或宗教用語來掩飾自己的不良動機，或想過推脫責任不做應該做的事。',
        answer: '',
        quotes: [],
      }],
    },
    three: {
      title: '第三天：阅读约翰福音18:33-18:38.',
      readVerse: [{
          book: '約翰福音',
          verse: '18:33-38',
        }],
      questions: [{
        id: 6,
        questionText: '6. 請把彼拉多向耶穌提出的問題和耶穌的回答列出。',
        answer: '',
        quotes: [{
          book: '約翰福音',
          verse: '19:9-11',
        }],
      }, {
        id: 7,
        questionText: '7. 假若彼拉多不是關閉自己的思想和心靈，其實他可以從耶穌的每一個回答對祂有什麼認識？',
        answer: '',
        quotes: [],
      }, {
        id: 8,
        questionText: '8. 耶穌的這些回答讓你對祂有了什麼認識？這些認識對你的生命有什麼影響？耶穌的回答給了你怎樣的希望和把握？',
        answer: '',
        quotes: [],
      }],
    },
    four: {
      title: '第四天：阅读约翰福音18:38-19:17.',
      readVerse: [{
          book: '約翰福音',
          verse: '18:38-19:17',
        }],
      questions: [{
        id: 9,
        questionText: '9. 上帝給了彼拉多好幾次機會去相信耶穌，請列出來。彼拉多為什麼選擇轉離耶穌和真理？',
        answer: '',
        quotes: [],
      }, {
        id: 10,
        questionText: '10. 請列出彼拉多抗拒真理、行事不公的表現。他向要求把耶穌釘十字架的群眾屈服，可能因為什麼？',
        answer: '',
        quotes: [{
          book: '馬太福音',
          verse: '27:11-26',
        }, {
          book: '路加福音',
          verse: '23:1-25',
        }],
      }, {
        id: 11,
        questionText: '11. 上帝給了你哪些機會去相信耶穌？對於上帝向你揭示的真理，你有何回應？',
        answer: '',
        quotes: [],
      }],
    },
    five: {
      title: '第五天：阅读约翰福音19:13-17.',      
      readVerse: [{
          book: '約翰福音',
          verse: '19:13-17',
        }],
      questions: [{
        id: 12,
        questionText: '12. 儘管坐在審判官席位上的是彼拉多，上帝才是真正的審判官。試說說彼拉多對耶穌的審判與上帝對彼拉多的審判二者之間有什麼差異。',
        answer: '',
        quotes: [],
      }, {
        id: 13,
        questionText: '13. 請描述逾越節時發生的事情（參閱出埃及記12: 1-14；申命記16:1-7)。耶穌在逾越節被釘十字架，有何特別意義？（參閱約翰福音1:29。）',
        answer: '',
        quotes: [{
          book: '出埃及記',
          verse: '12:1-14',
        }, {
          book: '申命記',
          verse: '16:1-7',
        }, {
          book: '約翰福音',
          verse: '1:29',
        }],
      },{
        id: 14,
        questionText: '14. 當你思想這段經文中耶穌所經歷和忍受的痛苦時，你對祂有何回應？',
        answer: '',
        quotes: [],
      }],
    },
    six: {
      title: '第六天：复习约翰福音18:28-19:17.',
      readVerse: [{
        book: '約翰福音',
        verse: '18:28-19:17',
      }],
      questions: [{
        id: 15,
        questionText: '15. 這個星期的研習，讓你對上帝有了什麼認識？你希望其他組員怎樣為你檮告，好讓你能活學活用這個真理？',
        answer: '',
        quotes: [],
      }, {
        id: 16,
        questionText: '16. 組長及班務同工的講道培訓：約翰福音18:28一19:17的經文分析練習。',
        answer: '',
        quotes: [],
      }],
    }
  }
}

const ACTION_HANDLERS = {
  [REQUEST_CLASS]: (state, action) => Object.assign({}, state, {
    id: action.id,
    name: action.name,
  }),
  [RECEIVE_CLASS]: (state, action) => state, // TODO:
  [FAILURE_CLASS]: (state, action) => state, // TODO:
}

export default function booksReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
