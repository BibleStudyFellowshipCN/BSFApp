import { AsyncStorage } from 'react-native';
import { loadAsync } from '../dataStorage/storage';
import { Models } from '../dataStorage/models';

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
  cellphone = null;
  loggedOn = false;
  offlineMode = false;
  language = Models.DefaultLanguage;
  bibleVersion = Models.DefaultBibleVersion;
  audioBook = 1 * 1000 + 1;

  async loadExistingUserAsync() {
    existingUser = await loadUser();
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
      this.loggedOn = true;
      console.log("loadExistingUser: " + JSON.stringify(this.getUserInfo()));
    }
  }

  isLoggedOn() {
    return this.loggedOn;
  }

  getCellphone() {
    if (!this.isLoggedOn()) {
      return null;
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
    this.offlineMode = value
    await saveUserAsync(this.getUserInfo());
    this.logUserInfo();
  }

  async setLanguageAsync(language) {
    if (!this.isLoggedOn()) {
      return;
    }
    this.language = language;
    await saveUserAsync(this.getUserInfo());
    this.logUserInfo();
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

  logUserInfo() {
    console.log(JSON.stringify({ isLoggedOn: this.isLoggedOn(), ...this.getUserInfo() }));
  }

  getUserInfo() {
    return { cellphone: this.cellphone, language: this.language, bibleVersion: this.bibleVersion, offlineMode: this.offlineMode, audioBook: this.audioBook };
  }
}

export { getCurrentUser };