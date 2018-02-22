import { AsyncStorage, Alert, Platform } from 'react-native';
import { Models } from '../dataStorage/models';
import { callWebServiceAsync, showWebServiceCallErrorsAsync } from '../dataStorage/storage';
import Expo, { LegacyAsyncStorage, Constants, FileSystem } from 'expo';
import { getI18nText } from '../store/I18n';

let currentUser;

function getCurrentUser() {
  if (!currentUser) {
    console.log("new User");
    currentUser = new User();
  }

  return currentUser;
}

async function loadUser() {
  try {
    const value = await AsyncStorage.getItem(Models.Logon.userKey);
    if (value) {
      console.log("loadUser: " + value);
      return JSON.parse(value);
    }
    console.log("loadUser: no user to load");
  } catch (error) {
    alert(error);
    console.log(error);
  }

  return null;
}

async function saveUserAsync(user) {
  try {
    if (user) {
      console.log("saveUserAsync: " + JSON.stringify(user));
      await AsyncStorage.setItem(Models.Logon.userKey, JSON.stringify(user));
    } else {
      console.log("deleteUser");
      await AsyncStorage.removeItem(Models.Logon.userKey);
    }
  } catch (error) {
    alert(error);
    console.log(error);
  }
}

export default class User {
  cellphone = '';
  loggedOn = false;
  offlineMode = false;
  language = Models.DefaultLanguage;
  bibleVersion = Models.DefaultBibleVersion;
  audioBook = 1 * 1000 + 1;
  fontSize = Models.DefaultFontSize;

  async loadExistingUserAsync() {
    let existingUser = await loadUser();
    if (existingUser) {
      this.cellphone = existingUser.cellphone;
      if (Models.ValidLanguages.indexOf(existingUser.language) != -1) {
        this.language = existingUser.language;
      }
      if (Models.ValidBibleVersionsLanguages.indexOf(existingUser.bibleVersion) != -1) {
        this.bibleVersion = existingUser.bibleVersion;
      }
      if (existingUser.offlineMode) {
        this.offlineMode = true;
      }
      if (existingUser.audioBook) {
        this.audioBook = existingUser.audioBook;
        if (this.audioBook < 1 * 1000 || this.audioBook > 66 * 1000) {
          this.audioBook = 1 * 1000 + 1;
        }
      }
      if (existingUser.fontSize) {
        this.fontSize = existingUser.fontSize;
        if (this.fontSize < 1 || this.fontSize > 3) {
          this.fontSize = 2;
        }
      }
      this.loggedOn = true;
      console.log("loadExistingUser: " + JSON.stringify(this.getUserInfo()));
    }
  }

  isLoggedOn() {
    return this.loggedOn;
  }

  getCellphone() {
    if (!this.isLoggedOn()) {
      return '';
    }
    return this.cellphone;
  }

  getLanguage() {
    if (!this.isLoggedOn()) {
      return Models.DefaultLanguage;
    }
    return this.language;
  }

  getLanguageDisplayName() {
    const language = this.getLanguage();
    for (var i in Models.Languages) {
      if (language == Models.Languages[i].Value) {
        return Models.Languages[i].DisplayName;
      }
    }
    return null;
  }

  getIsOfflineMode() {
    if (!this.isLoggedOn()) {
      return false;
    }

    return this.offlineMode;
  }

  getAudioBibleBook() {
    if (!this.isLoggedOn()) {
      return 1 * 1000 + 1;
    }

    return this.audioBook;
  }

  async setCellphoneAsync(celphone) {
    if (!this.isLoggedOn()) {
      return;
    }

    this.cellphone = celphone;
    await saveUserAsync(this.getUserInfo());
    this.logUserInfo();
  }

  async setAudioBibleBook(id) {
    if (!this.isLoggedOn()) {
      return;
    }

    this.audioBook = id;
    await saveUserAsync(this.getUserInfo());
    this.logUserInfo();
  }

  async setIsOfflineModeAsync(value) {
    if (!this.isLoggedOn()) {
      return;
    }
    this.offlineMode = value;
    await saveUserAsync(this.getUserInfo());
    this.logUserInfo();
  }

  async setLanguageAsync(language) {
    if (!this.isLoggedOn()) {
      return;
    }
    console.log('setLanguageAsync:', language);
    this.language = language;
    await saveUserAsync(this.getUserInfo());
    this.logUserInfo();
  }

  async setFontSizeAsync(size) {
    if (!this.isLoggedOn()) {
      return;
    }

    this.fontSize = size;
    await saveUserAsync(this.getUserInfo());
    this.logUserInfo();
  }

  getFontSize() {
    if (!this.isLoggedOn()) {
      return Models.DefaultFontSize;
    }
    return this.fontSize;
  }

  getHomeTitleFontSize() {
    return 14 + this.getFontSize() * 3;
  }

  getHomeFontSize() {
    return 12 + this.getFontSize() * 3;
  }

  getBibleFontSize() {
    return 12 + this.getFontSize() * 3;
  }

  getLessonFontSize() {
    return 12 + this.getFontSize() * 3;
  }

  getSettingFontSize() {
    return 9 + this.getFontSize() * 3;
  }

  getBibleVersion() {
    if (!this.isLoggedOn()) {
      return Models.DefaultBibleVersion;
    }
    return this.bibleVersion;
  }

  async setBibleVersionAsync(version) {
    if (!this.isLoggedOn()) {
      return;
    }
    this.bibleVersion = version;
    await saveUserAsync(this.getUserInfo());
    this.logUserInfo();
  }

  getBibleVersionDisplayName() {
    const verion = this.getBibleVersion();
    for (var i in Models.BibleVersions) {
      if (verion == Models.BibleVersions[i].Value) {
        return Models.BibleVersions[i].DisplayName;
      }
    }
    return null;
  }

  async logoutAsync() {
    if (this.loggedOn) {
      this.loggedOn = false;
      this.cellphone = null;
      await saveUserAsync(null);
    }
  }

  async loginAsync(cellphone, language) {
    /* TODO: [Wei] disable logon
    const result = await loadAsync(Models.Logon, '?cellphone=' + cellphone, true);
    if (!result || !result.logon) {
      return false;
    }*/

    this.cellphone = cellphone;
    this.language = language;
    this.loggedOn = true;
    await saveUserAsync(this.getUserInfo());
    this.logUserInfo();
    return true;
  }

  getVersionNumber(version) {
    // version is "a.b.c.d"
    let versionNumbers = version.split(".");
    let value = 0;
    for (let i in versionNumbers) {
      value = value * 1000 + parseInt(versionNumbers[i]);
    }
    return value;
  }

  async checkForUpdate(onlyShowUpdateUI) {
    const { manifest } = Constants;
    const result = await callWebServiceAsync('https://expo.io/@turbozv/CBSFApp/index.exp?sdkVersion=' + manifest.sdkVersion, '', 'GET');
    let succeed;
    if (onlyShowUpdateUI) {
      succeed = result && result.status == 200;
    } else {
      succeed = await showWebServiceCallErrorsAsync(result, 200);
    }
    if (succeed) {
      const clientVersion = this.getVersionNumber(manifest.version);
      const serverVersion = this.getVersionNumber(result.body.version);
      console.log('checkForUpdate:' + clientVersion + '-' + serverVersion);
      if (clientVersion < serverVersion) {
        if (Platform.OS === 'ios') {
          Alert.alert(getI18nText('发现更新') + ': ' + result.body.version, getI18nText("\n请强制关闭程序：\n\n1. 双击Home按钮\n\n2.向上划CBSF的预览界面关闭程序"));
        } else {
          Alert.alert(getI18nText('发现更新') + ': ' + result.body.version, getI18nText('程序将重新启动'), [
            { text: 'OK', onPress: () => Expo.Util.reload() },
          ]);
        }
      } else if (!onlyShowUpdateUI) {
        Alert.alert(getI18nText('您已经在使用最新版本'), getI18nText('版本') + ': ' + manifest.version + ' (SDK' + manifest.sdkVersion + ')', [
          { text: 'OK', onPress: () => { } },
        ]);
      }
    }
  }

  logUserInfo() {
    console.log(JSON.stringify({ isLoggedOn: this.isLoggedOn(), ...this.getUserInfo() }));
  }

  getUserInfo() {
    return {
      cellphone: this.cellphone,
      language: this.language,
      bibleVersion: this.bibleVersion,
      offlineMode: this.offlineMode,
      audioBook: this.audioBook,
      fontSize: this.fontSize
    };
  }

  async getLocalDataVersion() {
    try {
      const localUri = FileSystem.documentDirectory + 'version.json';
      const data = await FileSystem.readAsStringAsync(localUri);
      const version = JSON.parse(data);
      return getCurrentUser().getVersionNumber(version.version);
    } catch (e) {
      console.log(e);
      return 0;
    }
  }

  async getRemoteDataVersion() {
    try {
      const remoteUri = Models.DownloadUrl;
      const localUri = FileSystem.documentDirectory + 'serverVersion.json';
      console.log(`Downlad ${remoteUri} to ${localUri}...`);

      const downloadResumable = FileSystem.createDownloadResumable(remoteUri, localUri, {}, (downloadProgress) => { });
      const { uri } = await downloadResumable.downloadAsync();

      const data = await FileSystem.readAsStringAsync(localUri);
      const version = JSON.parse(data);
      return getCurrentUser().getVersionNumber(version.version);
    } catch (e) {
      console.log(e);
      Alert.alert('Network error', 'Please try again later');
      return 0;
    }
  }

  async migrateAsync() {
    const key = 'ANSWER';
    await LegacyAsyncStorage.migrateItems([key]);

    LegacyAsyncStorage.getItem(key, (err, oldData) => {
      if (err || !oldData) {
        oldData = "{}";
      }
      let oldAnswer = JSON.parse(oldData);
      if (!oldAnswer.rawData) {
        Alert.alert("No need to recover", "We don't find any data from previous version");
        return;
      }
      console.log(JSON.stringify(oldAnswer));

      AsyncStorage.getItem(key, (err, newData) => {
        if (err || !newData) {
          newData = "{}";
        }

        let newAnswer = JSON.parse(newData);
        if (!newAnswer.rawData) {
          newAnswer.rawData = {
            answers: {}
          };
        }
        console.log(JSON.stringify(newAnswer));

        let mergeData = JSON.parse(JSON.stringify(newAnswer));
        for (var item in oldAnswer.rawData.answers) {
          let currentItem = oldAnswer.rawData.answers[item];
          let targetItem = mergeData.rawData.answers[item];
          if (!targetItem) {
            mergeData.rawData.answers[item] = currentItem;
          } else {
            if (targetItem.answerText.indexOf(currentItem.answerText) == -1) {
              mergeData.rawData.answers[item].answerText = currentItem.answerText + "\n" + mergeData.rawData.answers[item].answerText;
            }
          }
        }

        console.log(JSON.stringify(mergeData));
        AsyncStorage.setItem(key, JSON.stringify(mergeData), () => {
          Alert.alert("Completed!", "App will restart to show the recovered answers", [
            { text: 'OK', onPress: () => Expo.Util.reload() },
          ]);
        });
      });

    });
  }
}

export { getCurrentUser };