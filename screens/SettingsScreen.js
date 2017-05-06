
import React, { PropTypes } from 'react';
import { ScrollView, StyleSheet, Image, Text, View } from 'react-native';
import { Constants } from 'expo';
import { Models } from '../dataStorage/models';

const SectionHeader = ({ title }) => {
  return (
    <View style={styles.sectionHeaderContainer}>
      <Text style={styles.sectionHeaderText}>
        {title}
      </Text>
    </View>
  );
};

const SectionContent = props => {
  return (
    <View style={styles.sectionContentContainer}>
      {props.children}
    </View>
  );
};

const AppIconPreview = ({ iconUrl }) => {
  if (!iconUrl) {
    iconUrl = 'https://s3.amazonaws.com/exp-brand-assets/ExponentEmptyManifest_192.png';
  }

  return (
    <Image
      source={{ uri: iconUrl }}
      style={{ width: 64, height: 64 }}
      resizeMode="cover"
    />
  );
};

export default class SettingsScreen extends React.Component {
  static route = {
    navigationBar: {
      title: '关于',
    },
  };

  _renderTitle() {
    const { manifest } = Constants;

    return (
      <View style={styles.titleContainer}>
        <View style={styles.titleIconContainer}>
          <AppIconPreview iconUrl={manifest.iconUrl} />
        </View>

        <View style={styles.titleTextContainer}>
          <Text style={styles.nameText} numberOfLines={1}>
            {manifest.name}
          </Text>

          <Text style={styles.slugText} numberOfLines={1}>
            {manifest.slug}
          </Text>

          <Text style={styles.descriptionText}>
            {manifest.description}
          </Text>
        </View>
      </View>
    );
  }
  
  render() {
    const { manifest } = Constants;
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={this.props.route.getContentContainerStyle()}>

        {this._renderTitle()}

        <SectionHeader title="version" />
        <SectionContent>
          <Text style={styles.sectionContentText}>
            {manifest.version}
          </Text>
        </SectionContent>

        {/* <SectionHeader title="servers" /> */}
        {/* <SectionContent > */}
        {/*   <Text style={styles.sectionContentText}> */}
        {/*     book: {Models.Book.restUri} */}
        {/*   </Text> */}
        {/*   <Text style={styles.sectionContentText}> */}
        {/*     lesson: {Models.Book.restUri} */}
        {/*   </Text> */}
        {/*   <Text style={styles.sectionContentText}> */}
        {/*     bible verse: {Models.Book.restUri} */}
        {/*   </Text> */}
        {/* </SectionContent> */}
      </ScrollView>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleContainer: {
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 15,
    flexDirection: 'row',
  },
  titleIconContainer: {
    marginRight: 15,
    paddingTop: 2,
  },
  sectionHeaderContainer: {
    backgroundColor: '#fbfbfb',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ededed',
  },
  sectionHeaderText: {
    fontSize: 14,
  },
  sectionContentContainer: {
    paddingTop: 8,
    paddingBottom: 12,
    paddingHorizontal: 15,
  },
  sectionContentText: {
    color: '#808080',
    fontSize: 14,
  },
  nameText: {
    fontWeight: '600',
    fontSize: 20,
  },
  slugText: {
    color: '#a39f9f',
    fontSize: 14,
    marginTop: -1,
    backgroundColor: 'transparent',
  },
  descriptionText: {
    fontSize: 14,
    marginTop: 6,
    color: '#4d4d4d',
  },
  colorContainer: {
    flexDirection: 'row',
  },
  colorPreview: {
    width: 17,
    height: 17,
    borderRadius: 2,
    marginRight: 6,
  },
  colorTextContainer: {
    flex: 1,
  },
});
