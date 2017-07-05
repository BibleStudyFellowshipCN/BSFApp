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

async function saveUser(user) {
  try {
    if (user) {
      console.log("saveUser: " + JSON.stringify(user));
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
  language = Models.DefaultLanguage;
  bibleVersion = Models.DefaultBibleVersion;

  async loadExistingUser() {
    existingUser = await loadUser();
    if (existingUser) {
      this.cellphone = existingUser.cellphone;
      if (['chs', 'cht', 'eng'].indexOf(existingUser.language) != -1) {
        this.language = existingUser.language;
      }
      if (['rcuvss', 'rcuvts', 'niv2011'].indexOf(existingUser.bibleVersion) != -1) {
        this.bibleVersion = existingUser.bibleVersion;
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

  async setLanguage(language) {
    if (!this.isLoggedOn()) {
      return null;
    }
    this.language = language;
    await saveUser(this.getUserInfo());
  }

  getBibleVersion() {
    if (!this.isLoggedOn()) {
      return Models.DefaultBibleVersion;
    }
    return this.bibleVersion;
  }

  async setBibleVersion(version) {
    if (!this.isLoggedOn()) {
      return null;
    }
    this.bibleVersion = version;
    await saveUser(this.getUserInfo());
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

  async logout() {
    if (this.loggedOn) {
      this.loggedOn = false;
      this.cellphone = null;
      await saveUser(null);
    }
  }

  async login(cellphone, language) {
    const result = await loadAsync(Models.Logon, '?cellphone=' + cellphone, true);
    if (!result || !result.logon) {
      return false;
    }

    this.cellphone = cellphone;
    this.language = language;
    this.loggedOn = true;
    await saveUser(this.getUserInfo());
    this.logUserInfo();
    return true;
  }

  logUserInfo() {
    console.log(JSON.stringify({ isLoggedOn: this.isLoggedOn(), ...this.getUserInfo() }));
  }

  getUserInfo() {
    return { cellphone: this.cellphone, language: this.language, bibleVersion: this.bibleVersion };
  }
}

export { getCurrentUser };