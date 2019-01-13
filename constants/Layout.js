import { Dimensions } from 'react-native';

let width = Dimensions.get('window').width;
let height = Dimensions.get('window').height;

export default {
  window: {
    width,
    height,
    set(w, h) {
      console.log(`New Layout window ${w}x${h}`);
      width = w;
      height = h;
    }
  },
  isSmallDevice: width < 375,
};
