let imageMap = [];
imageMap["AppIcon"] = require('../assets/icons/app-icon.png');

function getImage(icon) {
    return imageMap[icon];
}

export { getImage };