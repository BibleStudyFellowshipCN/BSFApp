
import React from 'react';
import { connect } from 'react-redux'
import { ScrollView, StyleSheet, Image, Text, View } from 'react-native';
import { Constants } from 'expo';
import { Models } from '../dataStorage/models';
import RadioButton from 'radio-button-react-native';
import { getCurrentUser } from '../store/user';
import { requestBooks } from "../store/books.js";

const SectionHeader = ({ title }) => {
  return (
    <View style={styles.sectionHeaderContainer}>
      <Text style={styles.sectionHeaderText} selectable={true}>
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
  return (
    <Image
      source={{ uri: iconUrl }}
      style={{ width: 64, height: 64 }}
      resizeMode="cover"
    />
  );
};

class SettingsScreen extends React.Component {
  static route = {
    navigationBar: {
      title: '关于',
    },
  };

  state = {
    language: getCurrentUser().getLanguage()
  };

  _renderTitle() {
    const { manifest } = Constants;

    return (
      <View style={styles.titleContainer}>
        <View style={styles.titleTextContainer}>
          <Text style={styles.nameText} numberOfLines={1} selectable={true}>
            {manifest.name}
          </Text>

          <Text style={styles.slugText} numberOfLines={1} selectable={true}>
            {manifest.slug}
          </Text>

          <Text style={styles.descriptionText} selectable={true}>
            {manifest.description}
          </Text>
        </View>
      </View>
    );
  }

  async onLanguageChange(language) {
    getCurrentUser().setLanguage(language);
    this.props.requestBooks(language);
    this.setState({ language });
  }

  render() {
    const { manifest } = Constants;
    let keyIndex = 0;
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={this.props.route.getContentContainerStyle()}>

        {this._renderTitle()}

        <SectionHeader title="version" />
        <SectionContent>
          <Text style={styles.sectionContentText} selectable={true}>
            {manifest.version}
          </Text>
        </SectionContent>

        <SectionHeader title="language" />
        <SectionContent>
          {
            Models.Languages.map(item => (
              <RadioButton key={keyIndex++} currentValue={this.state.language} value={item.Value} onPress={this.onLanguageChange.bind(this)} >
                <Text style={styles.textContent} key={keyIndex++}>{item.DisplayName}</Text>
              </RadioButton>
            ))
          }
        </SectionContent>
      </ScrollView>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    requestBooks: () => dispatch(requestBooks()),
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(SettingsScreen)

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
  textContent: {
    fontSize: 18,
    height: 30
  }
});
