import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Container } from 'native-base';

import { ExpoLinksView } from '@expo/samples';
import { Upload } from '../components/Upload';

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
        <Upload/>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: '#fff',
  },
});
