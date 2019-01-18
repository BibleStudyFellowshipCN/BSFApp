import { Alert } from 'react-native';
import { getI18nText } from "../store/I18n";
import { Updates, Constants } from "expo";
import { callWebServiceAsync, showWebServiceCallErrorsAsync } from '../dataStorage/storage';

function getVersionNumber(version) {
    if (!version) {
        return 0;
    }

    // version is "a.b.c" or "a.b.c.d"
    let versionNumbers = version.split(".");
    let value = 0;
    for (let i in versionNumbers) {
        value = value * 1000 + parseInt(versionNumbers[i]);
    }
    if (versionNumbers.length === 3) {
        value = value * 1000;
    }
    return value;
}

async function checkForAppUpdate(showUI = true) {
    // Check for app update
    /*if (!__DEV__) {
        const { isAvailable } = await Updates.checkForUpdateAsync();
        console.log('checkForUpdateAsync: ' + isAvailable);
        if (isAvailable) {
        const { isNew } = await Updates.fetchUpdateAsyn();
        console.log('fetchUpdateAsyn: ' + isNew);
        }
    }*/

    const { manifest } = Constants;
    const result = await callWebServiceAsync('https://expo.io/@turbozv/CBSFApp/index.exp?sdkVersion=' + manifest.sdkVersion, '', 'GET');
    let succeed;
    if (showUI) {
        succeed = await showWebServiceCallErrorsAsync(result, 200);
    } else {
        succeed = result && result.status == 200;
    }

    if (succeed) {
        const clientVersion = getVersionNumber(manifest.version);
        const serverVersion = getVersionNumber(result.body.version);
        console.log('checkForAppUpdate:' + clientVersion + '-' + serverVersion);
        // TODO: For some reason the partial updated app doesn't have sdkVersion, so we need to reload
        if (clientVersion < serverVersion || manifest.sdkVersion.length < 6) {
            Alert.alert(getI18nText('发现更新') + ': ' + result.body.version, getI18nText('程序将重新启动'), [
                { text: 'OK', onPress: () => Updates.reload() },
                { text: 'Later', onPress: () => { } },
            ]);
        } else if (showUI) {
            Alert.alert(getI18nText('您已经在使用最新版本'), getI18nText('版本') + ': ' + manifest.version + ' (SDK' + manifest.sdkVersion + ')', [
                { text: 'Reload', onPress: () => { Updates.reload() } },
                { text: 'OK', onPress: () => { } },
            ]);
        }
    }
}


let lastPokeDay = 0;
let lastSessionId = '';

async function checkAppUpdateInBackground() {
    // Don't poke from non-device
    /*if (!Expo.Constants.isDevice) {
        return;
    }*/

    // Check is done daily or sessionId is changed
    const dayOfToday = (new Date()).getDate();
    const sessionId = Constants['sessionId'];
    console.log(`[Session: ${sessionId}] LastCheckForContentUpdateDate: ${lastPokeDay} DayOfToday: ${dayOfToday}`);
    if (dayOfToday != lastPokeDay || lastSessionId != sessionId) {
        try {
            const update = await Updates.checkForUpdateAsync();
            if (update.isAvailable) {
                await Updates.fetchUpdateAsync();
                Alert.alert(getI18nText('发现更新'), getI18nText('程序将重新启动'), [
                    { text: 'OK', onPress: () => Updates.reloadFromCache() },
                    { text: 'Later', onPress: () => { } },
                ]);
            }
        } catch (e) {
            console.log(e);
        };

        lastPokeDay = dayOfToday;
        lastSessionId = Constants['sessionId'];
    }
}

export { checkForAppUpdate, checkAppUpdateInBackground };
