import { Alert, AsyncStorage, Platform } from 'react-native';
import { debounce } from 'lodash';
import Storage from 'react-native-storage';
import { Constants, FileSystem } from 'expo';
import { Models, CachePolicy } from './models';
import { getCurrentUser } from '../store/user';

if (!global.storage) {
    global.storage = new Storage({
        size: 100000,
        storageBackend: AsyncStorage,
        enableCache: true,
        defaultExpires: null,
    });
}

const storage = global.storage;

if (!global.deviceInfo) {
    global.deviceInfo = {
        deviceId: Constants['deviceId'],
        sessionId: Constants['sessionId'],
        deviceYearClass: Constants['deviceYearClass'],
        platformOS: Platform.OS,
        version: Constants.manifest.version,
        sdkVersion: 'SDK' + Constants.manifest.sdkVersion
    };
}

function getLanguage() {
    let lang = getCurrentUser().getLanguage();
    if (!lang) {
        lang = Models.DefaultLanguage;
    }
    return lang;
}

function encode(idOrKey) {
    // key and id can never contains "_"
    return idOrKey.replace(/_/g, '##-##');
}

global_cache = [];

function resetGlobalCache(name) {
    console.log("resetGlobalCache: " + name);
    delete global_cache[name];
}

async function reloadGlobalCache(name) {
    console.log("reloadGlobalCache: " + name);
    try {
        const localUri = FileSystem.documentDirectory + name + '.json';
        var data = await FileSystem.readAsStringAsync(localUri);
        global_cache[name] = JSON.parse(data);
    } catch (e) {
        global_cache[name] = [];
    }
}

async function getCacheData(name, key) {
    console.log(`getCacheData(${name}, ${key})`);

    if (!global_cache[name]) {
        await reloadGlobalCache(name);
    }
    if (global_cache[name]) {
        const data = global_cache[name][key];
        if (data) {
            console.log("Load from global cache:" + name + ':' + key);
            return data;
        }
    }

    // If fails to get from downloaded cache, return the default ones
    let cache;
    switch (name) {
        case 'books':
            cache = require("../assets/json/books.json");
            break;
        case 'homeDiscussion':
            cache = require("../assets/json/homeDiscussion.json");
            break;
        case 'homeTraining':
            cache = require("../assets/json/homeTraining.json");
            break;
    }
    if (cache) {
        const data = cache[key];
        if (data) {
            console.log("Load from local cache:" + name + ':' + key);
            return data;
        }
    }

    return null;
}

async function getFromCache(key, keyString) {
    // Load from book cache
    if (key == Models.Book.key) {
        const data = await getCacheData('books', getCurrentUser().getLanguage());
        if (data) {
            return data;
        }
    }

    // Load from lesson cache
    if (key == Models.Lesson.key) {
        const data = await getCacheData(getCurrentUser().getLanguage(), keyString);
        if (data) {
            return data;
        }
    }

    // Load from passage cache
    if (key == Models.Passage.key) {
        const index = keyString.indexOf('?bibleVersion=');
        if (index !== -1) {
            version = keyString.substring(index + '?bibleVersion='.length);
        } else {
            version = getCurrentUser().getBibleVersion();
        }

        const data = await getCacheData(version, keyString);
        if (data) {
            return data;
        }
    }

    return null;
}

function getHttpHeaders() {
    return {
        'pragma': 'no-cache',
        'cache-control': 'no-cache',
        'deviceId': global.deviceInfo.deviceId,
        'sessionId': global.deviceInfo.sessionId,
        'deviceYearClass': global.deviceInfo.deviceYearClass,
        'platformOS': global.deviceInfo.platformOS,
        'version': global.deviceInfo.version + ' ' + global.deviceInfo.sdkVersion,
        'lang': getCurrentUser().getLanguage(),
        'bibleVersion': getCurrentUser().getBibleVersion(),
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    };
}

let lastPokeDay = 0;
let lastSessionId = '';

async function pokeServer(model, id) {
    // Don't poke from non-device
    /*if (!Expo.Constants.isDevice) {
        return;
    }*/

    // Check is done daily or sessionId is changed
    const dayOfToday = (new Date()).getDate();
    console.log('LastCheckForPokeDate: ' + lastPokeDay + ' DayOfToday: ' + dayOfToday);
    if (dayOfToday != lastPokeDay || lastSessionId != Constants['sessionId']) {
        getCurrentUser().checkForUpdate(true);
        lastPokeDay = dayOfToday;
        lastSessionId = Constants['sessionId'];
    }
}

async function loadAsync(model, id, update) {
    if (!model) {
        throw "key is not defined";
    }

    if (model.useLanguage) {
        if (id.indexOf('?') == -1) {
            id = id + '?lang=' + getLanguage();
        } else {
            id = id + '&lang=' + getLanguage();
        }
    }

    let keyString = (id == null) ? model.key : model.key + '/' + id;

    // load from cache first
    if (model.restUri) {
        let data = await getFromCache(model.key, keyString);
        if (data) {
            console.log(`loadAsync(${id}) [cache]`);
            return data;
        }
    }

    // try to load from local first
    if (model.cachePolicy == CachePolicy.AsyncStorage) {
        data = await loadFromOffilneStorageAsync(model.key, id);
        if (data) {
            console.log(`loadAsync(${id}) [local]`);
            return data;
        }
    }

    // load from network first
    let data = await loadFromCloudAsync(model, id, /*silentLoad*/ true);

    // store to cache
    if (data) {
        if (model.cachePolicy == CachePolicy.AsyncStorage) {
            saveToOffilneStorageAsync(data, model.key, id);
        }
        console.log(`loadAsync(${id}) [network]`);
    }

    return data;
}

async function loadFromOffilneStorageAsync(key, id) {
    console.log("load from storage: " + JSON.stringify({ key, id }));
    try {
        const data = !!id ?
            await storage.load({ key: encode(key), id: encode(id) }) :
            await storage.load({ key: encode(key) });
        return data;
    } catch (err) {
        console.log("failed to load from storage: " + JSON.stringify({ key, id }));
        return null;
    }
}

async function loadFromCloudAsync(model, id, silentLoad) {
    if (!model.restUri) {
        // The model deosn't support online fetch
        return null;
    }
    //console.log("load from cloud: " + JSON.stringify({ model, id, silentLoad, deviceInfo: global.deviceInfo }));
    const url = !!id ? (model.restUri + '/' + id) : model.restUri;
    let responseJson;
    try {
        // fetch data from service
        const response = await fetch(url, { method: 'GET', headers: getHttpHeaders() });

        try {
            // FIXME: [Wei] "response.json()" triggers error on Android
            let responseString = await response.text();
            responseJson = JSON.parse(responseString);
        } catch (err) {
            // Fallback to eval workaround if JSON.parse() doesn't work
            responseJson = eval("(" + response._bodyText + ")")
        }

        if (responseJson == undefined) {
            alert("Invalid server response");
            return null;
        }

        if (responseJson.error != undefined) {
            console.log(responseJson.error);
            alert(responseJson.error);
            return null;
        }

        console.log(url);
    } catch (err) {
        console.log(err);
        if (!silentLoad) {
            alert(err, "Failed to get data from network, check your network connection.");
        }
    }

    return responseJson;
}

async function loadFromCacheAsync(file, id) {
    return await getCacheData(file, getLanguage() + '/' + id);
}

const debouncedSaveToCloud = debounce(saveToCloud, wait = 500)

async function saveAsync(data, model, id) {
    if (!model) {
        throw "model is not defined";
    }

    await saveToOffilneStorageAsync(data, model.key, id);
    debouncedSaveToCloud(data, model, id);
}

async function saveToOffilneStorageAsync(payload, key, id) {
    console.log("save to storage: " + JSON.stringify({ key, id }));
    return !!id ?
        await storage.save({ key: encode(key), id: encode(id), rawData: payload }) :
        await storage.save({ key: encode(key), rawData: payload })
}

function saveToCloud(data, model, id) {
    // TODO
}


async function clearStorageAsync(key) {
    key = encode(key);
    console.log("clearStorageAsync: " + key);
    await storage.clearMapForKey(key);
}

async function callWebServiceAsync(url, api, method, headersUnused, body) {
    let responseStatus;
    let responseHeader;
    let responseJson;
    let serverUrl = url + api;
    const headers = getHttpHeaders();
    try {
        let payload;
        if (body) {
            payload = { method, headers, body: JSON.stringify(body) };
        } else {
            payload = { method, headers };
        }

        const response = await fetch(serverUrl, payload);

        responseStatus = response.status;
        responseHeader = response.headers.map;

        try {
            let responseString = await response.text();
            responseJson = JSON.parse(responseString);
        } catch (err) {
            if (response._bodyText) {
                responseJson = eval("(" + response._bodyText + ")")
            }
        }

        if (!responseJson) {
            responseJson = '';
        }

    } catch (err) {
        console.log('callWebServiceAsync Error:' + JSON.stringify(err));
    }

    const result = { headers: responseHeader, body: responseJson, status: responseStatus };
    console.log(method + ' ' + serverUrl + " >>> " + JSON.stringify({ headers, body }));
    console.log(method + ' ' + serverUrl + " <<< " + JSON.stringify(result));
    return result;
}

async function showWebServiceCallErrorsAsync(result, acceptStatus, showUI = true) {
    if (!result || !result.status) {
        if (showUI) {
            await Alert.alert('Error', 'Please check your network connection');
        }
    }
    else if (acceptStatus) {
        if (result.status == acceptStatus) {
            return true;
        } else {
            let message = 'HTTP status ' + result.status;
            if (result.body) {
                if (result.body.Message) {
                    message = message + "\n\n" + result.body.Message;
                }
                if (result.body.ExceptionMessage) {
                    message = message + "\n\n" + result.body.ExceptionMessage;
                }
                if (result.body.ExceptionType) {
                    message = message + "\n\n" + result.body.ExceptionType;
                }
            }
            if (showUI) {
                await Alert.alert('Error', message);
            }
        }
        return false;
    }

    return true;
}

let global_bible_cache = [];

async function getPassageAsync(version, passage) {
    let result = [];

    try {
        // parse book "<book>/..."
        const index = passage.indexOf('/');
        if (index === -1) {
            alert('wrong passage format');
            return result;
        }
        const book = parseInt(passage.substring(0, index));

        let bible = {};

        if (global_bible_cache[version]) {
            console.log('Load bible from global_bible_cache[]');
            bible = global_bible_cache[version];
        } else {
            const localUri = FileSystem.documentDirectory + 'book-' + version + '.json';
            var info = await FileSystem.getInfoAsync(localUri);
            if (info && info.exists) {
                const content = await FileSystem.readAsStringAsync(localUri);
                bible = JSON.parse(content);
                console.log('Load bible from ' + localUri + ' ' + content.length);
                global_bible_cache[version] = bible;
            } else {
                // Get from network/cache
                const content = await loadAsync(Models.Passage, `${passage}?bibleVersion=${version}`, true);
                if (!content || !content.paragraphs) {
                    alert('no network or server error');
                    return result;
                }

                for (let i in content.paragraphs) {
                    const paragraph = content.paragraphs[i];
                    for (let j in paragraph.verses) {
                        const verse = paragraph.verses[j];
                        const strs = verse.verse.split(':');
                        const id = book * 1000000 + parseInt(strs[0]) * 1000 + parseInt(strs[1]);
                        bible[id] = verse.text;
                    }
                }
            }
        }

        if (!bible) {
            alert('no bible content');
            return result;
        }

        const strs = passage.substring(index + 1).split(/(:|-)/g);
        if (strs.length === 1) {
            // parse chapter: 1
            chapterFrom = parseInt(strs[0]);
            verseFrom = 1;
            chapterTo = chapterFrom;
            verseTo = 999;
        } else if (strs.length === 3 && strs[1] === '-') {
            // parse chapter: 1-2
            chapterFrom = parseInt(strs[0]);
            verseFrom = 1;
            chapterTo = parseInt(strs[2]);
            verseTo = 999;
        } else if (strs.length === 3 && strs[1] === ':') {
            // parse chapter: 1:33
            chapterFrom = parseInt(strs[0]);
            verseFrom = parseInt(strs[2]);
            chapterTo = chapterFrom;
            verseTo = verseFrom;
        } else if (strs.length === 5 && strs[1] === ':' && strs[3] === '-') {
            // parse chapter: 1:1-3
            chapterFrom = parseInt(strs[0]);
            verseFrom = parseInt(strs[2]);
            chapterTo = chapterFrom;
            verseTo = parseInt(strs[4]);
        } else if (strs.length === 7 && strs[1] === ':' && strs[3] === '-' && strs[5] === ':') {
            // parse chapter: 1:1-2:10
            chapterFrom = parseInt(strs[0]);
            verseFrom = parseInt(strs[2]);
            chapterTo = parseInt(strs[4]);
            verseTo = parseInt(strs[6]);
        } else {
            alert('Error format: ' + passage);
            return result;
        }

        console.log(`getPassageAsync(${version}, ${passage}) => ${chapterFrom}:${verseFrom}-${chapterTo}:${verseTo}`);
        let chapter = chapterFrom;
        let verse = verseFrom;
        while (chapter * 1000 + verse <= chapterTo * 1000 + verseTo) {
            const id = book * 1000000 + chapter * 1000 + verse;
            const text = bible[id] ? bible[id] : '';
            // Chinese bible has some empty verse
            if (!bible[id] && !bible[id + 1]) {
                chapter++;
                verse = 1;
            } else {
                result.push({ verse: `${chapter}:${verse}`, text });
                verse++;
            }
        }
    } catch (e) {
        console.log(e);
    }

    return result;
}

async function downloadBibleAsync(bible, downloadCallback) {
    console.log('downloadBibleAsync:' + bible);
    try {
        const remoteUri = Models.DownloadBibleUrl + bible + '.json';
        const localUri = FileSystem.documentDirectory + 'temp.json';
        console.log(`Downlad ${remoteUri} to ${localUri}...`);

        const downloadResumable = FileSystem.createDownloadResumable(remoteUri, localUri, {}, downloadCallback);
        const { uri } = await downloadResumable.downloadAsync();

        const finalUri = FileSystem.documentDirectory + 'book-' + bible + '.json';
        console.log(`Move ${localUri} to ${finalUri}...`);
        await Expo.FileSystem.moveAsync({ from: localUri, to: finalUri });
    } catch (e) {
        console.log(e);
    }
}

export {
    loadAsync, saveAsync, clearStorageAsync, callWebServiceAsync, showWebServiceCallErrorsAsync, pokeServer, resetGlobalCache, reloadGlobalCache, loadFromCacheAsync, getPassageAsync,
    downloadBibleAsync
};