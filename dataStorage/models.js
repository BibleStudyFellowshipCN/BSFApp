
export const CachePolicy = {
  None: 0,
  Memory: 1,
  AsyncStorage: 2,
};

export const Models = {
  Book: {
    key: "BOOK",
    restUri: "http://cbsf.southcentralus.cloudapp.azure.com:3000/lessons",
    cachePolicy: CachePolicy.AsyncStorage,
    useLanguage: true
  },
  Lesson: {
    key: "LESSON",
    restUri: "http://cbsf.southcentralus.cloudapp.azure.com:3000/lessons",
    cachePolicy: CachePolicy.AsyncStorage,
    useLanguage: true
  },
  Passage: {
    key: "PASSAGE",
    restUri: "http://cbsf.southcentralus.cloudapp.azure.com:3000/verse",
    cachePolicy: CachePolicy.AsyncStorage,
    useLanguage: true
  },
  Logon: {
    key: "LOGON",
    restUri: "http://cbsf.southcentralus.cloudapp.azure.com:3000/logon",
    cachePolicy: CachePolicy.AsyncStorage,
    userKey: '@BsfApp:user'
  },
  Feedback: {
    key: "Feedback",
    restUri: "http://cbsf.southcentralus.cloudapp.azure.com:3000/feedback"
  },
  Answer: {
    key: "ANSWER",
    restUri: "",
    cachePolicy: CachePolicy.AsyncStorage,
  },
  DefaultLanguage: "chs",
  Languages: [
    { DisplayName: "简体中文", Value: "chs" },
    { DisplayName: "繁體中文", Value: "cht" },
    { DisplayName: "English", Value: "eng" }
  ],
  DefaultBibleVersion: "rcuvss",
  BibleVersions: [
    { DisplayName: "和合本修订版(简体)", Value: "rcuvss" },
    { DisplayName: "和合本修訂版(繁體)", Value: "rcuvts" },
    { DisplayName: "New International Version 2011", Value: "niv2011" }
  ]
}
