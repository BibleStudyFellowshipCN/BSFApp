<B>Instructions to get Expo working on PC</B>

1) Install Expo on your phone:
Android: https://play.google.com/store/apps/details?id=host.exp.exponent
iOS: https://itunes.com/apps/exponent
2) Install NodeJS: https://nodejs.org/dist/v7.8.0/node-v7.8.0-x64.msi
3) Git clone https://github.com/BibleStudyFellowshipCN/BSFApp
4) Run "npm install" in BSFApp folder
5) Install Expo XDE: https://xde-updates.exponentjs.com/download/win32
6) Run Expo XDE, Projects -> Open Projects -> Select "BSFApp" folder
7) Click "Send Link" to your email, open that email on your phone (Expo will launch BSFApp)
8) Now you can edit the source files on your PC, once you save it, the device will automatically update


<B>Build a standalone app</B>

https://docs.expo.io/versions/v15.0.0/guides/building-standalone-apps.html
https://expo-developers.slack.com/messages

<B>JSON schema</B>

1. Booklist on homepage

const initialState = {
  booklist: [{
    title: '约翰福音2016-2017',
    lessons: [{
      id: '2016_25',
      name: '第25课 约翰福音18:28-19:17 (04/17/2017)'
    }, {
      id: '2016_26',
      name: '第26课 约翰福音19:18-30 (04/24/2017)'
    }, {
      id: '2016_27',
      name: '第27课 约翰福音19:31-42 (05/01/2017)'
    }, {
      id: '2016_28',
      name: '第28课 约翰福音20 (05/08/2017)'
    }, {
      id: '2016_29',
      name: '第29课 约翰福音21 (05/15/2017)'
    }]
  }, {
    title: '罗马书2017-2018',
    lessons: [{
      id: '2017_1',
      name: '第1课'
    }, {
      id: '2017_2',
      name: '第2课'
    }, {
      id: '2017_3',
      name: '第3课'
    }]
  }]
}

2. QuestionList from homework

const initialState = {
  id: 0,
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
        id: 3,
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

3. BibleVerse from homework

const initialState = {
  paragraphs: [{
    id: 0,
    title: '',
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
    id: 1,
    title: '音7章',
    verses: [{
      verse: '7:1',
      text: '你們不要論斷人、免得你們被 論斷。',
      bold: false,
    }, {
      verse: '7:2',
      text: '因為你們怎樣論斷人、 也必怎樣被論斷。你們用甚麼量 器量給人、也必用甚麼量器量給 你們。',
      bold: false,
    }, {
      verse: '7:3',
      text: '為甚麼看見你弟兄眼中 有刺、卻不想自己眼中有梁木呢。',
      bold: false,
    }]
  }]
}
