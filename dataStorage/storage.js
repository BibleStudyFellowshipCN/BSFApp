import { AsyncStorage } from 'react-native';
import { debounce } from 'lodash';
import Storage from 'react-native-storage';

import { Models } from './models';

if (!global.storage) {
    global.storage = new Storage({
        size: 10000,
        storageBackend: AsyncStorage,
        enableCache: true,
        defaultExpires: null,
    });
}

const storage = global.storage;

function encode(idOrKey) {
    // key and id can never contains "_"
    return idOrKey.replace(/_/g, '##-##');
}

async function loadAsync(model, id, update) {
    if (!model) {
        throw "key is not defined";
    }

    console.log("start load");

    // try to load from offline storage first
    let data = await loadFromOffilneStorageAsync(model.key, id);
    if (!data || data.length == 0) {
        // TODO need to sync from server;
        data = await loadFromCloudAsync(model, id, /*silentLoad*/ false);
        if(data) {
            saveToOffilneStorageAsync(data, model.key, id);
        }
    } else if (update) {
        // update the offline storage silently
        const updateData = await loadFromCloudAsync(model, id, /*silentLoad*/ true);
        if (updateData) {
            saveToOffilneStorageAsync(updateData, model.key, id);
        }
    }

    return data;
}

async function loadFromOffilneStorageAsync(key, id) {
    try {
        const data = !!id ?
            await storage.load({ key: encode(key), id: encode(id) }) :
            await storage.load({ key: encode(key) });
        return data;
    } catch (err) {
        console.log("failed to load: " + JSON.stringify(err));
        return null;
    }
}

async function loadFromCloudAsync(model, id, silentLoad) {
    if (!model.restUri) {
        // The model deosn't support online fetch
        return null;
    }
    const url = !!id ? (model.restUri + id) : model.restUri;
    let responseJson;
    let responseString;
    try {
        // fetch data from service
        const response = await fetch(url);

        try {
            // FIXME: [Wei] "response.json()" triggers error on Android, so I have to use "eval"
            // responseJson = eval("(" + response._bodyText + ")")
            responseString = await response.text();
            responseJson = JSON.parse(responseString);
        } catch (err) {
            console.warn(err);
            // FIXME: [Wei] "response.json()" triggers error on Android, so I have to use "eval"
            // Fallback to eval workaround if JSON.parse() doesn't work
            responseJson = eval("(" + responseString + ")");
        }

        if (responseJson.error != undefined) {
            alert(responseJson.error);
            console.log(responseJson.error);
            return null;
        }

        console.log(url + " => " + JSON.stringify(responseJson));
    } catch (err) {
        if (!silentLoad) {
            alert("Failed to get data from network, check your network connection.");
        }
    }

    return responseJson;
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
    return !!id ?
        await storage.save({ key: encode(key), id: encode(id), rawData: payload }) :
        await storage.save({ key: encode(key), rawData: payload })
}

function saveToCloud(data, model, id) {
    // TODO
}


async function clearStorageAsync(key) {
    if (key) {
        await storage.clearMapForKey(key);
    }
    else {
        await storage.clearMap();
    }
}

export { loadAsync, saveAsync, clearStorageAsync };