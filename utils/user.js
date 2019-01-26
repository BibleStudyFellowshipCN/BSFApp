import { AsyncStorage } from 'react-native';
import { Models } from '../dataStorage/models';
import { setUserInternal, callWebServiceAsync, showWebServiceCallErrorsAsync } from '../dataStorage/storage';
import { FileSystem } from 'expo';

let currentUser;

function getCurrentUser() {
  if (!currentUser) {
    console.log("new User");
    currentUser = new User();
    setUserInternal(currentUser);
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
  bibleVersion2 = Models.DefaultBibleVersion2;
  audioBook = 1 * 1000 + 1;
  fontSize = Models.DefaultFontSize;
  permissions = {};
  validBibles = null;

  isBibleVersionValid(version) {
    if (!this.validBibles) {
      this.validBibles = [];
      for (let lang in Models.BibleVersions) {
        const items = Models.BibleVersions[lang];
        for (let i in items) {
          this.validBibles.push(items[i].id);
        }
      }
    }

    return this.validBibles.indexOf(version) !== -1;
  }

  async loadExistingUserAsync() {
    let existingUser = await loadUser();
    if (existingUser) {
      this.cellphone = existingUser.cellphone;
      if (Models.ValidLanguages.indexOf(existingUser.language) != -1) {
        this.language = existingUser.language;
      }
      if (this.isBibleVersionValid(existingUser.bibleVersion)) {
        this.bibleVersion = existingUser.bibleVersion;
      }
      if (this.isBibleVersionValid(existingUser.bibleVersion2)) {
        // we don't use the same version
        this.bibleVersion2 = existingUser.bibleVersion2 === existingUser.bibleVersion ? null : existingUser.bibleVersion2;
      }
      if (existingUser.offlineMode) {
        this.offlineMode = true;
      }
      if (existingUser.audioBook) {
        this.audioBook = existingUser.audioBook;
        if (this.audioBook % 1000 < 1 || this.audioBook / 1000 % 1000 > 66) {
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

      await this.loadUserPermissionsAsync(this.cellphone);
      console.log("loadExistingUserPermission: " + JSON.stringify(this.permissions));
    }
  }

  async loadUserPermissionsAsync(cellphone, showUI) {
    const result = await callWebServiceAsync(Models.User.restUri, '/' + cellphone, 'GET');
    const succeed = await showWebServiceCallErrorsAsync(result, null, showUI);
    if (succeed && result.status == 200) {
      this.permissions = result.body;
    }
    else {
      this.permissions = {};
    }
  }

  async reloadPermissionAsync() {
    await this.loadUserPermissionsAsync(this.cellphone, showUI);
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

    await this.loadUserPermissionsAsync(this.cellphone);
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

  getBibleVersion2() {
    if (!this.isLoggedOn()) {
      return Models.DefaultBibleVersion2;
    }
    return this.bibleVersion2;
  }

  async setBibleVersion2Async(version) {
    if (!this.isLoggedOn()) {
      return;
    }
    this.bibleVersion2 = version;
    await saveUserAsync(this.getUserInfo());
    this.logUserInfo();
  }

  getBibleVersionDisplayName() {
    const verion = this.getBibleVersion();
    for (var lang in Models.BibleVersions) {
      const data = Models.BibleVersions[lang];
      for (var i in data) {
        if (verion == data[i].id) {
          console.log(data[i].name);
          return data[i].name;
        }
      }
    }
    return null;
  }

  getBibleVersion2DisplayName() {
    const verion = this.getBibleVersion2();
    for (var lang in Models.BibleVersions) {
      const data = Models.BibleVersions[lang];
      for (var i in data) {
        if (verion == data[i].id) {
          console.log(data[i].name);
          return data[i].name;
        }
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
      fontSize: this.fontSize,
      bibleVersion2: this.bibleVersion2
    };
  }

  async getLocalDataVersion() {
    try {
      const localUri = FileSystem.documentDirectory + 'version.json';
      const data = await FileSystem.readAsStringAsync(localUri);
      version = JSON.parse(data);
      console.log('Local downloaded version: ' + JSON.stringify(version));
      return version.version;
    } catch (e) {
      console.log(e);
      return 0;
    }
  }

  async getRemoteDataVersion(showUI) {
    try {
      const result = await callWebServiceAsync(Models.DownloadUrl + 'version.json', '', 'GET');
      const succeed = await showWebServiceCallErrorsAsync(result, 200, showUI);
      if (succeed) {
        console.log('RemoteVersion: ' + result.body.version);
        return result.body.version;
      }
    } catch (e) {
      console.log(e);
    }
    return '';
  }

  async getContentVersions(showUI) {
    const remoteVersionString = await this.getRemoteDataVersion(showUI);
    if (remoteVersion == '') {
      return;
    }
    const localVersionString = await this.getLocalDataVersion();
    const localVersion = this.getVersionNumber(localVersionString);
    const remoteVersion = this.getVersionNumber(remoteVersionString);
    console.log("Check lesson content versions " + localVersion + ' ' + remoteVersion + ' showUI=' + showUI);
    return { localVersion, remoteVersion, localVersionString, remoteVersionString };
  }

  getUserPermissions() {
    if (!this.isLoggedOn()) {
      return {};
    }

    return this.permissions;
  }
}

export { getCurrentUser };