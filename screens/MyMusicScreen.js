import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Container } from 'native-base';

import { ExpoLinksView } from '@expo/samples';
import { UploadFAB } from '../components/UploadFAB';
import { UploadProgress } from '../components/UploadProgress';
import { AppHeader } from '../components/AppHeader';

export default class MyMusicScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);

    this.state = {
      bUploading: true,
      uploadProgress: 0.5,
      uploadFileName: "pallo latke.mp3",
      downloadURL: ""
    };
  }

  render() {
    if(this.state.bUploading) {
      return (
        <Container>
          <AppHeader title='Uploading ...'/>
          <ScrollView style={styles.container}>
            <UploadProgress progress={this.state.uploadProgress} fileName={this.state.uploadFileName}></UploadProgress>
          </ScrollView>
        </Container>
      );
    }
    else {
      return (
        <Container>
          <AppHeader title='MGooS'/>
          <ScrollView style={styles.container}>
            {/* Go ahead and delete ExpoLinksView and replace it with your
              * content, we just wanted to provide you with some helpful links */}
            
            <ExpoLinksView />
          </ScrollView>
          <UploadFAB onInit={this._onUploadInit} onProgress={this._onUploadProgress} onDone={this._onUploadDone} onError={this._onUploadError}/>
        </Container>
      );
    }
  }

  _onUploadInit = (fileName) => {
    this.setState({bUploading: true, uploadFileName: fileName});
  }
  
  _onUploadProgress = (progress) => {
    let normProgress = Math.round(progress *100) / 100;
    this.setState({uploadProgress: normProgress});
  }

  _onUploadDone = (dloadURL) => {
    this.setState({bUploading: false, downloadURL: dloadURL});
  }

  _onUploadError = (error) => {
    this.setState({bUploading: false, uploadFileName: "", downloadURL: ""});
    alert("Uh, oh. Something went wrong with upload : " + error);
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: '#fff',
  },
});
