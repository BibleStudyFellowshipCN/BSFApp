import { callWebServiceAsync, showWebServiceCallErrorsAsync } from '../dataStorage/storage';
import { Models } from '../dataStorage/models';

const io = require('socket.io-client');

export default class Chat {
  uid = '';
  roomId = null;
  socket = null;
  callback = null;
  defaultUserName = 'B';
  connected = false;

  constructor(id, callback, defaultUserName) {
    this.roomId = id;
    this.callback = callback;

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
        this.callback({
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
      this.callback({
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

  onNewMessage(data) {
    console.log("receiveMessage: " + JSON.stringify(data));

    if (data.room == this.getRoom()) {
      this.callback({
        _id: Math.round(Math.random() * 1000000),
        text: data.message,
        createdAt: new Date(data.createdAt),
        user: {
          _id: data.user,
          name: this.defaultUserName
        }
      });
    }
  }

  sendMessage(message) {
    for (i = 0; i < message.length; i++) {
      console.log("sendMessage: " + JSON.stringify(message[i]));

      this.callback(message[i]);

      this.socket.emit('newMessage', {
        room: this.getRoom(),
        user: message[i].user._id,
        message: message[i].text
      });
    }
  }

  closeChat() {
    this.socket.close();
  }
}
