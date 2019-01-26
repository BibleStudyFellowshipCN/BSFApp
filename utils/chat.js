import { callWebServiceAsync, showWebServiceCallErrorsAsync } from '../dataStorage/storage';
import { Models } from '../dataStorage/models';

const io = require('socket.io-client');

export default class Chat {
  uid = '';
  roomId = null;
  socket = null;
  newMessageCallback = null;
  deleteMessageCallback = null;
  defaultUserName = 'B';
  connected = false;

  constructor(id, newMessageCallback, deleteMessageCallback, defaultUserName) {
    this.roomId = id;
    this.newMessageCallback = newMessageCallback;
    this.deleteMessageCallback = deleteMessageCallback;

    if (defaultUserName) {
      this.defaultUserName = defaultUserName;
    }

    this.socket = io(Models.HostServer);

    this.socket.on('connect', function () {
      console.log('connected!');
      this.connected = true;
    });

    this.socket.on('disconnect', function () {
      console.log('disconnect!');
      this.connected = false;
    });

    this.socket.on('event', function (data) {
      console.log(data);
    });

    this.socket.on('newMessage', (data) => {
      console.log('newMessage: ' + JSON.stringify(data))
      this.onNewMessage(data);
    });

    this.socket.on('deleteMessage', (data) => {
      console.log('deleteMessage: ' + JSON.stringify(data))
      this.onDeleteMessage(data);
    });
  }

  setUid(value) {
    this.uid = value;
  }

  getUid() {
    return this.uid;
  }

  getRoom() {
    if (this.roomId) {
      return this.roomId;
    } else {
      return 'chat';
    }
  }

  async loadMessages() {
    const result = await callWebServiceAsync(Models.HostServer + '/messages/', this.getRoom(), 'GET');
    succeed = await showWebServiceCallErrorsAsync(result, 200);
    if (succeed) {
      for (var i in result.body) {
        const data = result.body[i];
        this.newMessageCallback({
          _id: i,
          text: data.message,
          createdAt: new Date(data.createdAt),
          user: {
            _id: data.user,
            name: this.defaultUserName
          }
        });
      }
    } else {
      this.newMessageCallback({
        _id: 0,
        text: 'Failed to load messages, please try again later',
        createdAt: new Date(),
        user: {
          _id: 0,
          name: 'System'
        }
      });
    }
  }

  uuid() {
    let dt = new Date().getTime();
    let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (dt + Math.random() * 16) % 16 | 0;
      dt = Math.floor(dt / 16);
      return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
  }

  onNewMessage(data) {
    if (data.room == this.getRoom()) {
      this.newMessageCallback({
        _id: this.uuid(),
        text: data.message,
        createdAt: new Date(data.createdAt),
        user: {
          _id: data.user,
          name: this.defaultUserName
        }
      });
    }
  }

  onDeleteMessage(data) {
    if (this.deleteMessageCallback) {
      this.deleteMessageCallback(data);
    }
  }

  sendMessage(message) {
    for (i = 0; i < message.length; i++) {
      console.log("sendMessage: " + JSON.stringify(message[i]));

      this.socket.emit('newMessage', {
        room: this.getRoom(),
        user: message[i].user._id,
        message: message[i].text,
        token: message[i].token
      });
    }
  }

  closeChat() {
    this.socket.close();
  }
}
