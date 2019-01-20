import { Alert } from 'react-native';
import { getI18nText } from "../utils/I18n";
import { Updates, Constants } from "expo";

let lastPokeDay = 0;
let lastSessionId = '';

async function checkAppUpdateInBackground(force = false) {
    // Don't poke from non-device
    /*if (!Expo.Constants.isDevice) {
        return;
    }*/

    // Check is done daily or sessionId is changed
    const dayOfToday = (new Date()).getDate();
    const sessionId = Constants['sessionId'];
    console.log(`[Session: ${sessionId}] LastCheckForContentUpdateDate: ${lastPokeDay} DayOfToday: ${dayOfToday}`);
    if (force || dayOfToday != lastPokeDay || lastSessionId != sessionId) {
        try {
            const { isAvailable } = await Updates.checkForUpdateAsync();
            console.log('checkForUpdateAsync: ' + isAvailable);
            if (isAvailable) {
                const { isNew } = await Updates.fetchUpdateAsyn();
                console.log('fetchUpdateAsyn: ' + isNew);
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

export { checkAppUpdateInBackground };
