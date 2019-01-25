import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { ExpoLinksView } from '@expo/samples';
import { Container, Header, View, Button, Icon, Fab } from 'native-base';

export default class MyMusicScreen extends React.Component {
  static navigationOptions = {
    title: 'My Music',
  };

  constructor(props) {
    super(props);

    this.state = {
      active: 'true'
    };
  }

  render() {
    return (
      <Container>
        <ScrollView style={styles.container}>
          {/* Go ahead and delete ExpoLinksView and replace it with your
            * content, we just wanted to provide you with some helpful links */}
          
          <ExpoLinksView />
        </ScrollView>
        <Fab
            containerStyle={{ }}
            style={{ backgroundColor: '#5067FF' }}
            position="bottomRight"
            onPress={() => {this.onUpload()}}>
            <Icon name="cloud-upload" />
          </Fab>
      </Container>
    );
  }

  onUpload() {
    alert("Test");
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: '#fff',
  },
});
