
export const CachePolicy = {
  None: 0,
  Memory: 1,
  AsyncStorage: 2,
};

export const Models = {
  Book: {
    key: "BOOK",
    restUri: "http://cbsf.azurewebsites.net/",
    cachePolicy: CachePolicy.AsyncStorage,
  },
  Lesson: {
    key: "LESSON",
    restUri: "http://cbsf.azurewebsites.net/",
    cachePolicy: CachePolicy.AsyncStorage,
  },
  Passage: {
    key: "PASSAGE",
    restUri: "http://cbsf.southcentralus.cloudapp.azure.com:3000/verse/",
    cachePolicy: CachePolicy.AsyncStorage,
  },
  Answer: {
    key: "ANSWER",
    restUri: "",
    cachePolicy: CachePolicy.AsyncStorage,
  },
  Languages: [
    { DisplayName: "简体中文", Value: "CHS"},
    { DisplayName: "繁體中文", Value: "CHT"},
    { DisplayName: "English", Value: "ENG"},
  ]
}
