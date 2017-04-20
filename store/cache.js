import { AsyncStorage } from 'react-native'

if (!global.webserviceUrl) {
  global.webserviceUrl = 'http://turbozv.com/bsf/api/'
}

export async function cacheFetch(url) {
  const key = "[Cache]" + url
  const content = await AsyncStorage.getItem(key)
  if (content != null) {
      console.log("[Cache]Hit:" + key)
      return eval("(" + content + ")")
  }
  console.log("[Cache]Miss:" + key)

  // fetch bible verse from web service
  const response = await fetch(global.webserviceUrl + url)
  // FIXME: [Wei] "response.json()" triggers error on Android, so I have to use "eval"
  const responseJson = eval("(" + response._bodyText + ")")

  console.log(url + " => " + JSON.stringify(responseJson))
  if (responseJson.error != undefined) {
    alert(responseJson.error)
    console.warn(responseJson.error)
    return null
  }

  AsyncStorage.setItem(key, JSON.stringify(responseJson))
  console.log("[Cache]Set:" + key)
  return responseJson
}
