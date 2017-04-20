import { AsyncStorage } from 'react-native'

export async function cacheFetch(url) {
  const content = await AsyncStorage.getItem(url)
  if (content != null) {
      console.log("[Cache]Hit:" + url)
      return eval("(" + content + ")")
  }
  console.log("[Cache]Miss:" + url)

  // fetch bible verse from web service
  const response = await fetch(url)
  // FIXME: [Wei] "response.json()" triggers error on Android, so I have to use "eval"
  const responseJson = eval("(" + response._bodyText + ")")

  console.log(url + " => " + JSON.stringify(responseJson))
  if (responseJson.error != undefined) {
    alert(responseJson.error)
    console.warn(responseJson.error)
    return null
  }

  AsyncStorage.setItem(url, JSON.stringify(responseJson))
  console.log("[Cache]Set:" + url)
  return responseJson
}
