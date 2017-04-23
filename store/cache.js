import { AsyncStorage } from 'react-native'

// ------------------------------------
// Constants
// ------------------------------------
export const CACHE_POLICY = {
    NONE: 0,
    MEMORY: 1,
    ASYNCSTORAGE: 2,
};

// TODO: [Wei] Add them to settings' page
if (!global.webserviceUrl) {
  global.webserviceUrl = 'http://turbozv.com/bsf/api/'
}

if (!global.cachePolicy) {
  global.cachePolicy = CACHE_POLICY.ASYNCSTORAGE
}

if (!global.memoryCache) {
  global.memoryCache = []
}

export async function cacheFetch(url) {
  const key = "CACHE-" + url
  if (global.cachePolicy == CACHE_POLICY.MEMORY) {
    const content = global.memoryCache[key]
    if (content != null) {
        console.log("[Cache]Hit:" + key)
        return content
    }
  } else if (global.cachePolicy == CACHE_POLICY.ASYNCSTORAGE) {
      const content = await AsyncStorage.getItem(key)
      if (content != null) {
          console.log("[Cache]Hit:" + key)
          return eval("(" + content + ")")
      }
  }
  console.log("[Cache]Miss:" + key)

  // fetch bible verse from web service
  const response = await fetch(global.webserviceUrl + url)
  // FIXME: [Wei] "response.json()" triggers error on Android, so I have to use "eval"
  const responseJson = eval("(" + response._bodyText + ")")

  console.log(url + " => " + JSON.stringify(responseJson))
  if (responseJson.error != undefined) {
    alert(responseJson.error)
    console.log(responseJson.error)
    return null
  }

  if (global.cachePolicy == CACHE_POLICY.MEMORY) {
    global.memoryCache[key] = responseJson
  } else if (global.cachePolicy == CACHE_POLICY.ASYNCSTORAGE) {
    AsyncStorage.setItem(key, JSON.stringify(responseJson))
  }
  console.log("[Cache]Set:" + key)

  return responseJson
}
