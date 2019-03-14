import React from 'react';
import { debounce } from 'lodash';
import { connect } from 'react-redux';
import { StyleSheet, View, Dimensions, KeyboardAvoidingView, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { getI18nText } from '../utils/I18n';
import { callWebServiceAsync, showWebServiceCallErrorsAsync } from '../dataStorage/storage';
import { Models } from '../dataStorage/models';
import { getCurrentUser } from '../utils/user';
import { EventRegister } from 'react-native-event-listeners';
import { Button, Input, Overlay } from 'react-native-elements';
import Colors from '../constants/Colors';
import { loadAsync } from '../dataStorage/storage';
import { updateAnswer, clearAnswers } from '../store/answers';
import { showMessage } from "react-native-flash-message";

class UserHomeScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: getI18nText('我的账号'),
      headerLeft: (
        <View style={{ marginLeft: 10 }}>
          <TouchableOpacity onPress={() => navigateBack()}>
            <Image
              style={{ width: 34, height: 34 }}
              source={require('../assets/images/GoBack.png')} />
          </TouchableOpacity>
        </View>)
    };
  };

  constructor(props) {
    super(props);

    const userLoggedIn = this.getUserLoggedIn();
    this.state = {
      mode: userLoggedIn ? 'userProfile' : 'userLogin',
      email: getCurrentUser().getEmail(),
      cellphone: getCurrentUser().getCellphone(),
      nickname: getCurrentUser().getNickName(),
      password: '',
      password2: '',
      busy: false,
      windowWidth: Dimensions.get('window').width,
      localAnswerCount: 'N/A',
      remoteAnswerCount: 'N/A'
    }
  }

  getUserLoggedIn() {
    const accessToken = getCurrentUser().getAccessToken();
    return accessToken && accessToken.length > 0;
  }

  componentWillMount() {
    navigateBack = () => this.props.navigation.pop();
    onSubmit = () => this.onSubmit();

    this.listener = EventRegister.addEventListener('screenDimensionChanged', (window) => {
      this.setState({ windowWidth: window.width, windowHeight: window.height });
    });
  }

  componentDidMount() {
    if (this.state.mode === 'userProfile') {
      this.getUserProfile();
    }
  }

  componentWillUnmount() {
    EventRegister.removeEventListener(this.listener);
  }

  async getUserProfile() {
    try {
      this.setState({ busy: true, cellphone: '', nickname: '' });

      const body = {
        accessToken: getCurrentUser().getAccessToken()
      };
      const result = await callWebServiceAsync(`${Models.HostHttpsServer}/api.php?c=getUserProfile`, '', 'POST', [], body);
      const succeed = await showWebServiceCallErrorsAsync(result);
      if (succeed) {
        if (result.status === 200) {
          const userInfo = { nickname: result.body.nickname, cellphone: result.body.cellphone, email: result.body.email };
          await getCurrentUser().setUserInfoAsync(userInfo);
          this.setState(userInfo);
          return;
        }

        this.handleError(result);
      }
    }
    finally {
      this.setState({ busy: false });
    }
  }

  async refreshLocalAnswerCount() {
    const answerContent = await loadAsync(Models.Answer, null, false);
    let localAnswerCount = 0;
    if (answerContent && answerContent.answers) {
      localAnswerCount = Object.keys(answerContent.answers).length;
    }
    this.setState({ localAnswerCount: localAnswerCount });
  }

  async getAnswerCount() {
    try {
      this.setState({ busy: true, localAnswerCount: 'N/A', remoteAnswerCount: 'N/A' });

      this.refreshLocalAnswerCount();
      debounce(() => this.refreshLocalAnswerCount(), wait = 1000)();

      const body = {
        accessToken: getCurrentUser().getAccessToken()
      };
      const result = await callWebServiceAsync(`${Models.HostHttpsServer}/api.php?c=getAnswers`, '', 'POST', [], body);
      const succeed = await showWebServiceCallErrorsAsync(result);
      if (succeed) {
        if (result.status === 200) {
          this.setState({ remoteAnswerCount: result.body.answerCount });
          return;
        }

        this.handleError(result);
      }
    }
    finally {
      this.setState({ busy: false });
    }
  }

  gotoPage(mode) {
    this.setState({
      mode: mode,
      email: getCurrentUser().getEmail(),
      password: '',
      password2: '',
    });

    if (mode === 'userProfile') {
      this.getUserProfile();
    } else if (mode === 'answerManagement') {
      this.getAnswerCount();
    }
  }

  handleError(result) {
    if (result && result.status === 401) {
      // Wrong access token
      showMessage({
        message: getI18nText('错误') + result.status,
        duration: 10000,
        description: getI18nText('登录过期，请重新登录'),
        type: "danger",
      });
      this.logout();
      return;
    }

    showMessage({
      message: getI18nText('错误') + result.status,
      duration: 10000,
      description: getI18nText('未知错误，请稍后再试'),
      type: "danger",
    });
  }

  async loginUser() {
    if (!this.state.email || this.state.email.length < 6) {
      this.emailInput.shake();
      this.emailInput.focus();
      return;
    }
    if (!this.state.password || this.state.password.length < 6) {
      this.passwordInput.shake();
      this.passwordInput.focus();
      return;
    }

    try {
      this.setState({ busy: true });
      const body = {
        email: this.state.email,
        pass: this.state.password
      };
      const result = await callWebServiceAsync(`${Models.HostHttpsServer}/api.php?c=loginUser`, '', 'POST', [], body);
      const succeed = await showWebServiceCallErrorsAsync(result);
      if (succeed) {
        if (result.status === 200 && result.body.accessToken) {
          await getCurrentUser().setUserInfoAsync({ accessToken: result.body.accessToken });
          if (result.body.ResetPassword) {
            this.gotoPage('updatePassword');
          } else {
            this.gotoPage('userProfile');
          }
          return;
        }

        this.handleError(result);
      }
    }
    finally {
      this.setState({ busy: false });
    }
  }

  async createUser() {
    if (!this.state.email || this.state.email.length < 6) {
      this.emailInput.shake();
      this.emailInput.focus();
      return;
    }
    if (!this.state.password || this.state.password.length < 6) {
      this.passwordInput.shake();
      this.passwordInput.focus();
      return;
    }
    if (this.state.password !== this.state.password2) {
      this.password2Input.shake();
      this.password2Input.focus();
      return;
    }

    try {
      this.setState({ busy: true });
      const body = {
        email: this.state.email,
        pass: this.state.password
      };
      const result = await callWebServiceAsync(`${Models.HostHttpsServer}/api.php?c=createUser`, '', 'POST', [], body);
      const succeed = await showWebServiceCallErrorsAsync(result);
      if (succeed) {
        if (result.status === 201 && result.body.accessToken) {
          await getCurrentUser().setUserInfoAsync({ accessToken: result.body.accessToken });
          this.gotoPage('userProfile');
          return;
        }

        if (result.status === 409) {
          Alert.alert(getI18nText('错误'), getI18nText('Email已经注册，请点击"找回密码"'), [
            { text: getI18nText('找回密码'), onPress: () => { this.gotoPage('forgetPassword') } },
            { text: getI18nText('取消'), onPress: () => { } }
          ]);
          return;
        }

        this.handleError(result);
      }
    }
    finally {
      this.setState({ busy: false });
    }
  }

  async forgetPassword() {
    if (!this.state.email || this.state.email.length < 6) {
      this.emailInput.shake();
      this.emailInput.focus();
      return;
    }

    try {
      this.setState({ busy: true });
      const result = await callWebServiceAsync(`${Models.HostServer}/resetPassword/${this.state.email}`, '', 'GET');
      const succeed = await showWebServiceCallErrorsAsync(result);
      if (succeed) {
        if (result.status === 201) {
          showMessage({
            message: getI18nText('成功'),
            duration: 10000,
            description: getI18nText('临时密码已经通过电子邮件发送给您，请在1小时内用临时密码登录并修改密码!'),
            type: "success"
          });
          this.gotoPage('userLogin');
          return;
        }

        this.handleError(result);
      }
    }
    finally {
      this.setState({ busy: false });
    }
  }

  async updatePassword() {
    if (!this.state.password || this.state.password.length < 6) {
      this.passwordInput.shake();
      this.passwordInput.focus();
      return;
    }
    if (this.state.password !== this.state.password2) {
      this.password2Input.shake();
      this.password2Input.focus();
      return;
    }

    try {
      this.setState({ busy: true });
      const body = {
        email: this.state.email,
        accessToken: getCurrentUser().getAccessToken(),
        pass: this.state.password,
      };
      const result = await callWebServiceAsync(`${Models.HostHttpsServer}/api.php?c=changePassword`, '', 'POST', [], body);
      const succeed = await showWebServiceCallErrorsAsync(result);
      if (succeed) {
        if (result.status === 201 && result.body.accessToken) {
          await getCurrentUser().setUserInfoAsync({ accessToken: result.body.accessToken });
          this.gotoPage('userProfile');
          return;
        }

        this.handleError(result);
      }
    }
    finally {
      this.setState({ busy: false });
    }
  }

  async logout() {
    await getCurrentUser().setUserInfoAsync({ email: '', accessToken: '' });
    this.gotoPage('userLogin');
  }

  async syncAnswers() {
    try {
      this.setState({ busy: true });
      let body = {
        accessToken: getCurrentUser().getAccessToken()
      };

      // Download answers
      let result = await callWebServiceAsync(`${Models.HostHttpsServer}/api.php?c=downloadAnswers`, '', 'POST', [], body);
      let succeed = await showWebServiceCallErrorsAsync(result);
      if (!succeed || !result.status || result.status !== 200) {
        this.handleError(result);
        return;
      }

      // Merge answers
      let downloadAnswers = result.body.answer ? (result.body.answer === '[]' ? {} : JSON.parse(result.body.answer)) : {};

      const answerContent = await loadAsync(Models.Answer, null, false);
      let localAnswers = {};
      if (answerContent && answerContent.answers) {
        for (let i in answerContent.answers) {
          const item = answerContent.answers[i];
          localAnswers[item.questionId] = item.answerText;
        }
      }

      // console.log({ localAnswers, downloadAnswers });
      let useRemote = 0;
      let useMerged = 0;
      let mergedAnswers = JSON.parse(JSON.stringify(localAnswers));
      for (let i in downloadAnswers) {
        const remote = downloadAnswers[i];
        const local = localAnswers[i];
        let merged;
        if (local === undefined || local === null) {
          merged = remote;
          useRemote++;
          this.props.updateAnswer(i, merged);
          // console.log(`${i}: ${local} | ${remote} => ${merged} - No local, use remote`);
        } else if (local === remote) {
          merged = local;
          // console.log(`${i}: ${local} | ${remote} => ${merged} - Same, use local`);
        } else if (local.indexOf(remote) !== -1) {
          merged = local;
          // console.log(`${i}: ${local} | ${remote} => ${merged} - local contains remote, use local`);
        } else if (remote.indexOf(local) !== -1) {
          merged = remote;
          useRemote++;
          this.props.updateAnswer(i, merged);
          // console.log(`${i}: ${local} | ${remote} => ${merged} - remote contains local, use remote`);
        } else {
          merged = local + '\n---\n' + remote;
          useMerged++;
          this.props.updateAnswer(i, merged);
          // console.log(`${i}: ${local} | ${remote} => ${merged} - Use both`);
        }
        mergedAnswers[i] = merged;
      }
      // console.log({ mergedAnswers });
      const useLocal = Object.keys(mergedAnswers).length - useRemote - useMerged;

      // Upload answers
      body = {
        accessToken: getCurrentUser().getAccessToken(),
        answers: mergedAnswers
      };
      result = await callWebServiceAsync(`${Models.HostHttpsServer}/api.php?c=uploadAnswers`, '', 'POST', [], body);
      succeed = await showWebServiceCallErrorsAsync(result);
      if (succeed) {
        if (result.status === 201) {
          showMessage({
            message: getI18nText('合并成功'),
            duration: 10000,
            description: getI18nText('使用远程答案: ') + useRemote + '\n' +
              getI18nText('使用本地答案: ') + useLocal + '\n' +
              getI18nText('使用合并答案: ') + useMerged,
            type: "success"
          });
          this.getAnswerCount();
          return;
        }

        this.handleError(result);
      }
    }
    finally {
      this.setState({ busy: false });
    }
  }

  async uploadAnswers() {
    try {
      this.setState({ busy: true });
      let body = {
        accessToken: getCurrentUser().getAccessToken()
      };

      const answerContent = await loadAsync(Models.Answer, null, false);
      let localAnswers = {};
      if (answerContent && answerContent.answers) {
        for (let i in answerContent.answers) {
          const item = answerContent.answers[i];
          localAnswers[item.questionId] = item.answerText;
        }
      }

      body = {
        accessToken: getCurrentUser().getAccessToken(),
        answers: localAnswers
      };
      result = await callWebServiceAsync(`${Models.HostHttpsServer}/api.php?c=uploadAnswers`, '', 'POST', [], body);
      succeed = await showWebServiceCallErrorsAsync(result);
      if (succeed) {
        if (result.status === 201) {
          showMessage({
            message: getI18nText('上传成功'),
            duration: 3000,
            type: "success"
          });
          this.getAnswerCount();
          return;
        }

        this.handleError(result);
      }
    }
    finally {
      this.setState({ busy: false });
    }
  }

  async downloadAnswers() {
    try {
      this.setState({ busy: true });
      let body = {
        accessToken: getCurrentUser().getAccessToken()
      };

      // Download answers
      let result = await callWebServiceAsync(`${Models.HostHttpsServer}/api.php?c=downloadAnswers`, '', 'POST', [], body);
      let succeed = await showWebServiceCallErrorsAsync(result);
      if (!succeed || !result.status || result.status !== 200) {
        showMessage({
          message: getI18nText('错误') + result.status,
          duration: 10000,
          description: getI18nText('未知错误，请稍后再试'),
          type: "danger",
        });
        return;
      }

      let downloadAnswers = result.body.answer ? (result.body.answer === '[]' ? {} : JSON.parse(result.body.answer)) : {};
      for (let i in downloadAnswers) {
        this.props.updateAnswer(i, downloadAnswers[i]);
      }

      showMessage({
        message: getI18nText('下载成功'),
        duration: 3000,
        type: "success",
      });
      this.getAnswerCount();
    }
    finally {
      this.setState({ busy: false });
    }
  }

  async updateUserProfile() {
    try {
      this.setState({ busy: true });
      const body = {
        accessToken: getCurrentUser().getAccessToken(),
        cellphone: this.state.cellphone,
        nickname: this.state.nickname
      };
      const result = await callWebServiceAsync(`${Models.HostHttpsServer}/api.php?c=updateUserProfile`, '', 'POST', [], body);
      const succeed = await showWebServiceCallErrorsAsync(result);
      if (succeed) {
        if (result.status === 200) {
          showMessage({
            message: getI18nText('更新成功'),
            duration: 3000,
            type: "success",
          });
          getCurrentUser().setUserInfoAsync({ cellphone: this.state.cellphone, nickname: this.state.nickname });
          return;
        }

        this.handleError(result);
      }
    }
    finally {
      this.setState({ busy: false });
    }
  }

  async removeLocalAnswers() {
    this.props.clearAnswers();
    this.refreshLocalAnswerCount();
    showMessage({
      message: getI18nText('删除成功'),
      duration: 3000,
      type: "success",
    });
  }

  render() {
    const userLoggedIn = !!this.getUserLoggedIn();
    return (
      <KeyboardAvoidingView style={styles.container} behavior='padding' keyboardVerticalOffset={0} >
        <ScrollView style={{ flex: 1, backgroundColor: 'white', width: this.state.windowWidth }}>
          {
            this.state.mode === 'userProfile' &&
            <View style={{ flex: 1, backgroundColor: 'white', alignItems: 'center', width: this.state.windowWidth }}>
              <View style={{
                margin: 10,
                width: this.state.windowWidth - 20,
                borderColor: '#FFE8A1',
                backgroundColor: '#FFF2CC',
                borderWidth: 1,
                borderRadius: 10,
                alignItems: 'center'
              }}>
                <Text style={{ fontSize: 20 }}>{getI18nText('修改用户资料')}</Text>
                <Input
                  containerStyle={{ marginTop: 20 }}
                  label={getI18nText('邮箱(只读)')}
                  defaultValue={getCurrentUser().getEmail()}
                  editable={false}
                />
                <Input
                  containerStyle={{ marginTop: 20 }}
                  ref={(input) => this.cellphoneInput = input}
                  label={getI18nText('手机号码')}
                  defaultValue={this.state.cellphone}
                  errorStyle={{ color: 'red' }}
                  onChangeText={(text) => { this.setState({ cellphone: text }); }}
                />
                <Input
                  containerStyle={{ marginTop: 20 }}
                  ref={(input) => this.nicknameInput = input}
                  label={getI18nText('用户昵称')}
                  defaultValue={this.state.nickname}
                  errorStyle={{ color: 'red' }}
                  onChangeText={(text) => { this.setState({ nickname: text }); }}
                />
                <Button
                  containerStyle={{ width: 170 }}
                  icon={{ name: "send", size: 20, color: "white" }}
                  title={getI18nText('提交')}
                  buttonStyle={{ backgroundColor: Colors.yellow, margin: 10, borderRadius: 30, paddingLeft: 10, paddingRight: 20 }}
                  onPress={() => this.updateUserProfile()}
                />
              </View>
            </View>
          }

          {
            this.state.mode === 'answerManagement' &&
            <View style={{ flex: 1, backgroundColor: 'white', alignItems: 'center', width: this.state.windowWidth }}>
              <View style={{
                margin: 10,
                width: this.state.windowWidth - 20,
                borderColor: '#FFE8A1',
                backgroundColor: '#FFF2CC',
                borderWidth: 1,
                borderRadius: 10,
                alignItems: 'center'
              }}>
                <Text style={{ fontSize: 20, margin: 3 }}>{getI18nText('答案管理')}</Text>
                <View style={{
                  marign: 10,
                  width: this.state.windowWidth - 40,
                  borderColor: '#FFE8A1',
                  backgroundColor: '#F5F5F5',
                  borderWidth: 1,
                  borderRadius: 10,
                  alignItems: 'center'
                }}>
                  <Text style={{ fontSize: 16 }}>{getI18nText('本地答案: ') + this.state.localAnswerCount}    {getI18nText('远程答案: ') + this.state.remoteAnswerCount}</Text>
                </View>
                <View style={{
                  margin: 10,
                  width: this.state.windowWidth - 40,
                  borderColor: '#FFE8A1',
                  backgroundColor: '#F5F5F5',
                  borderWidth: 1,
                  borderRadius: 10,
                  alignItems: 'center'
                }}>
                  <Text style={{ fontSize: 16, margin: 8 }}>{getI18nText('下载远程答案，和本地答案合并，然后上传合并后的答案到远程')}</Text>
                  <Button
                    containerStyle={{ width: 170 }}
                    icon={{ name: "send", size: 20, color: "white" }}
                    title={getI18nText('合并答案')}
                    buttonStyle={{ backgroundColor: Colors.yellow, margin: 10, borderRadius: 30, paddingLeft: 10, paddingRight: 20 }}
                    onPress={() => this.syncAnswers()}
                  />
                </View>
                <View style={{
                  margin: 10,
                  width: this.state.windowWidth - 40,
                  borderColor: '#FFE8A1',
                  backgroundColor: '#F5F5F5',
                  borderWidth: 1,
                  borderRadius: 10,
                  alignItems: 'center'
                }}>
                  <Text style={{ fontSize: 16, margin: 8 }}>{getI18nText('上传本地答案，并覆盖远程答案')}</Text>
                  <Button
                    containerStyle={{ width: 170 }}
                    icon={{ name: "send", size: 20, color: "white" }}
                    title={getI18nText('上传答案')}
                    buttonStyle={{ backgroundColor: Colors.yellow, margin: 10, borderRadius: 30, paddingLeft: 10, paddingRight: 20 }}
                    onPress={() => {
                      Alert.alert(getI18nText('确认'), getI18nText('请确认是否上传本地答案，并覆盖远程的答案（所有远程的答案将会丢失）？'), [
                        { text: getI18nText('确认'), onPress: () => { this.uploadAnswers() } },
                        { text: getI18nText('取消'), onPress: () => { } },
                      ]);
                    }}
                  />
                </View>
                <View style={{
                  margin: 10,
                  width: this.state.windowWidth - 40,
                  borderColor: '#FFE8A1',
                  backgroundColor: '#F5F5F5',
                  borderWidth: 1,
                  borderRadius: 10,
                  alignItems: 'center'
                }}>
                  <Text style={{ fontSize: 16, margin: 8 }}>{getI18nText('下载远程答案，并覆盖本地答案')}</Text>
                  <Button
                    containerStyle={{ width: 170 }}
                    icon={{ name: "send", size: 20, color: "white" }}
                    title={getI18nText('下载答案')}
                    buttonStyle={{ backgroundColor: Colors.yellow, margin: 10, borderRadius: 30, paddingLeft: 10, paddingRight: 20 }}
                    onPress={() => {
                      Alert.alert(getI18nText('确认'), getI18nText('请确认是否下载远程答案，并覆盖本地答案（所有本地修改的答案将会丢失）？'), [
                        { text: getI18nText('确认'), onPress: () => { this.downloadAnswers() } },
                        { text: getI18nText('取消'), onPress: () => { } },
                      ]);
                    }}
                  />
                </View>
                <View style={{
                  margin: 10,
                  width: this.state.windowWidth - 40,
                  borderColor: '#FFE8A1',
                  backgroundColor: '#F5F5F5',
                  borderWidth: 1,
                  borderRadius: 10,
                  alignItems: 'center'
                }}>
                  <Text style={{ fontSize: 16, margin: 8 }}>{getI18nText('删除所有本地答案')}</Text>
                  <Button
                    containerStyle={{ width: 170 }}
                    icon={{ name: "send", size: 20, color: "white" }}
                    title={getI18nText('删除')}
                    buttonStyle={{ backgroundColor: Colors.yellow, margin: 10, borderRadius: 30, paddingLeft: 10, paddingRight: 20 }}
                    onPress={() => {
                      Alert.alert(getI18nText('确认'), getI18nText('请确认是否删除所有本地答案（所有本地答案将会丢失，无法恢复）？'), [
                        { text: getI18nText('确认'), onPress: () => { this.removeLocalAnswers() } },
                        { text: getI18nText('取消'), onPress: () => { } },
                      ]);
                    }}
                  />
                </View>
              </View>
            </View>
          }

          {
            this.state.mode === 'updatePassword' &&
            <View style={{ flex: 1, backgroundColor: 'white', alignItems: 'center', width: this.state.windowWidth }}>
              <View style={{
                margin: 10,
                width: this.state.windowWidth - 20,
                borderColor: '#FFE8A1',
                backgroundColor: '#FFF2CC',
                borderWidth: 1,
                borderRadius: 10,
                alignItems: 'center'
              }}>
                <Text style={{ fontSize: 20 }}>{getI18nText('修改密码')}</Text>
                <Input
                  containerStyle={{ marginTop: 20 }}
                  ref={(input) => this.passwordInput = input}
                  label={getI18nText('新密码(至少6位)')}
                  defaultValue={this.state.password}
                  secureTextEntry={true}
                  errorStyle={{ color: 'red' }}
                  onChangeText={(text) => { this.setState({ password: text }); }}
                />
                <Input
                  containerStyle={{ marginTop: 20 }}
                  ref={(input) => this.password2Input = input}
                  defaultValue={this.state.password2}
                  secureTextEntry={true}
                  label={getI18nText('重复新密码(至少6位)')}
                  errorStyle={{ color: 'red' }}
                  onChangeText={(text) => { this.setState({ password2: text }); }}
                />
                <Button
                  containerStyle={{ width: 170 }}
                  icon={{ name: "send", size: 20, color: "white" }}
                  title={getI18nText('提交')}
                  buttonStyle={{ backgroundColor: Colors.yellow, margin: 10, borderRadius: 30, paddingLeft: 10, paddingRight: 20 }}
                  onPress={() => this.updatePassword()}
                />
              </View>
            </View>
          }

          {
            this.state.mode === 'userLogin' &&
            <View style={{ flex: 1, backgroundColor: 'white', alignItems: 'center', width: this.state.windowWidth }}>
              <View style={{
                margin: 10,
                width: this.state.windowWidth - 20,
                borderColor: '#FFE8A1',
                backgroundColor: '#FFF2CC',
                borderWidth: 1,
                borderRadius: 10,
                alignItems: 'center'
              }}>
                <Text style={{ fontSize: 20 }}>{getI18nText('用户登录')}</Text>
                <Input
                  containerStyle={{ marginTop: 10 }}
                  ref={(input) => this.emailInput = input}
                  label={getI18nText('电子邮件')}
                  defaultValue={this.state.email}
                  errorStyle={{ color: 'red' }}
                  onChangeText={(text) => { this.setState({ email: text }); }}
                />
                <Input
                  containerStyle={{ marginTop: 20 }}
                  ref={(input) => this.passwordInput = input}
                  label={getI18nText('密码(至少6位)')}
                  defaultValue={this.state.password}
                  secureTextEntry={true}
                  errorStyle={{ color: 'red' }}
                  onChangeText={(text) => { this.setState({ password: text }); }}
                />
                <View style={{ flexDirection: 'row' }}>
                  <Button
                    containerStyle={{ width: 170 }}
                    icon={{ name: "send", size: 20, color: "white" }}
                    title={getI18nText('提交')}
                    buttonStyle={{ backgroundColor: Colors.yellow, margin: 10, borderRadius: 30, paddingLeft: 10, paddingRight: 20 }}
                    onPress={() => this.loginUser()}
                  />
                </View>
              </View>
            </View>
          }
          {
            this.state.mode === 'createUser' &&
            <View style={{ flex: 1, backgroundColor: 'white', alignItems: 'center', width: this.state.windowWidth }}>
              <View style={{
                margin: 10,
                width: this.state.windowWidth - 20,
                borderColor: '#FFE8A1',
                backgroundColor: '#FFF2CC',
                borderWidth: 1,
                borderRadius: 10,
                alignItems: 'center'
              }}>
                <Text style={{ fontSize: 20 }}>{getI18nText('创建新用户')}</Text>
                <Input
                  containerStyle={{ marginTop: 10 }}
                  ref={(input) => this.emailInput = input}
                  label={getI18nText('电子邮件')}
                  defaultValue={this.state.email}
                  errorStyle={{ color: 'red' }}
                  onChangeText={(text) => { this.setState({ email: text }); }}
                />
                <Input
                  containerStyle={{ marginTop: 20 }}
                  ref={(input) => this.passwordInput = input}
                  label={getI18nText('密码(至少6位)')}
                  defaultValue={this.state.password}
                  secureTextEntry={true}
                  errorStyle={{ color: 'red' }}
                  onChangeText={(text) => { this.setState({ password: text }); }}
                />
                <Input
                  containerStyle={{ marginTop: 20 }}
                  ref={(input) => this.password2Input = input}
                  defaultValue={this.state.password2}
                  secureTextEntry={true}
                  label={getI18nText('重复密码(至少6位)')}
                  errorStyle={{ color: 'red' }}
                  onChangeText={(text) => { this.setState({ password2: text }); }}
                />
                <Button
                  containerStyle={{ width: 170 }}
                  icon={{ name: "send", size: 20, color: "white" }}
                  title={getI18nText('提交')}
                  buttonStyle={{ backgroundColor: Colors.yellow, margin: 10, borderRadius: 30, paddingLeft: 10, paddingRight: 20 }}
                  onPress={() => this.createUser()}
                />
              </View>
            </View>
          }
          {
            this.state.mode === 'forgetPassword' &&
            <View style={{ flex: 1, backgroundColor: 'white', alignItems: 'center', width: this.state.windowWidth }}>
              <View style={{
                margin: 10,
                width: this.state.windowWidth - 20,
                borderColor: '#FFE8A1',
                backgroundColor: '#FFF2CC',
                borderWidth: 1,
                borderRadius: 10,
                alignItems: 'center'
              }}>
                <Text style={{ fontSize: 20 }}>{getI18nText('找回密码')}</Text>
                <Input
                  containerStyle={{ marginTop: 10 }}
                  ref={(input) => this.emailInput = input}
                  label={getI18nText('电子邮件')}
                  defaultValue={this.state.email}
                  errorStyle={{ color: 'red' }}
                  onChangeText={(text) => { this.setState({ email: text }); }}
                />
                <View style={{ flexDirection: 'row' }}>
                  <Button
                    containerStyle={{ width: 170 }}
                    icon={{ name: "send", size: 20, color: "white" }}
                    title={getI18nText('提交')}
                    buttonStyle={{ backgroundColor: Colors.yellow, margin: 10, borderRadius: 30, paddingLeft: 10, paddingRight: 20 }}
                    onPress={() => this.forgetPassword()}
                  />
                </View>
              </View>
            </View>
          }
          <View style={{ flex: 1, marginTop: 10, backgroundColor: 'white', alignItems: 'center', width: this.state.windowWidth }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {
                !userLoggedIn && this.state.mode !== 'userLogin' &&
                <TouchableOpacity onPress={() => { this.gotoPage('userLogin') }}>
                  <Text style={{ fontSize: 18, textDecorationLine: 'underline', color: '#2980b9' }}>{getI18nText('登录已有账号')}</Text>
                </TouchableOpacity>
              }

              {
                !userLoggedIn && this.state.mode !== 'createUser' &&
                <View style={{ marginLeft: 7 }}>
                  <TouchableOpacity onPress={() => { this.gotoPage('createUser') }}>
                    <Text style={{ fontSize: 18, textDecorationLine: 'underline', color: '#2980b9' }}>{getI18nText('创建新用户')}</Text>
                  </TouchableOpacity>
                </View>
              }

              {
                this.state.mode === 'userLogin' &&
                <View style={{ marginLeft: 7 }}>
                  <TouchableOpacity onPress={() => { this.gotoPage('forgetPassword') }}>
                    <Text style={{ fontSize: 18, textDecorationLine: 'underline', color: '#2980b9' }}>{getI18nText('找回密码')}</Text>
                  </TouchableOpacity>
                </View>
              }

              {
                userLoggedIn && this.state.mode !== 'userProfile' &&
                <View style={{ marginLeft: 7 }}>
                  <TouchableOpacity onPress={() => { this.gotoPage('userProfile') }}>
                    <Text style={{ fontSize: 18, textDecorationLine: 'underline', color: '#2980b9' }}>{getI18nText('修改用户资料')}</Text>
                  </TouchableOpacity>
                </View>
              }

              {
                userLoggedIn && this.state.mode !== 'answerManagement' &&
                <View style={{ marginLeft: 7 }}>
                  <TouchableOpacity onPress={() => { this.gotoPage('answerManagement') }}>
                    <Text style={{ fontSize: 18, textDecorationLine: 'underline', color: '#2980b9' }}>{getI18nText('答案管理')}</Text>
                  </TouchableOpacity>
                </View>
              }

              {
                userLoggedIn && this.state.mode !== 'updatePassword' &&
                <View style={{ marginLeft: 7 }}>
                  <TouchableOpacity onPress={() => { this.gotoPage('updatePassword') }}>
                    <Text style={{ fontSize: 18, textDecorationLine: 'underline', color: '#2980b9' }}>{getI18nText('修改密码')}</Text>
                  </TouchableOpacity>
                </View>
              }

              {
                userLoggedIn &&
                <View style={{ marginLeft: 7 }}>
                  <TouchableOpacity onPress={() => { this.logout() }}>
                    <Text style={{ fontSize: 18, textDecorationLine: 'underline', color: '#2980b9' }}>{getI18nText('登出')}</Text>
                  </TouchableOpacity>
                </View>
              }
            </View>
          </View>
          <View style={{ height: 50 }} />
        </ScrollView>
        {
          this.state.busy &&
          <Overlay isVisible
            windowBackgroundColor="rgba(255, 255, 255, .5)"
            width="auto"
            height="auto">
            <ActivityIndicator
              style={{ justifyContent: 'center', alignItems: 'center' }}
              size='large'
              color={Colors.yellow} />
          </Overlay>
        }
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
});

const mapStateToProps = (state, ownProps) => {
  return {};
}

const mapDispatchToProps = {
  updateAnswer,
  clearAnswers
}

export default connect(mapStateToProps, mapDispatchToProps)(UserHomeScreen)
