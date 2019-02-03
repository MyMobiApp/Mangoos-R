import React from 'react';
import { ScrollView, StyleSheet, List, FlatList } from 'react-native';
import { Container, View } from 'native-base';

import { ExpoLinksView } from '@expo/samples';
import { UploadFAB } from '../components/UploadFAB';
import { UploadProgress } from '../components/UploadProgress';
import { AppHeader } from '../components/AppHeader';
import FirebaseDBService from '../singleton/FirestoreDB';
import DataService from '../singleton/Data';
import { PlaylistItem } from '../components/MusicPlayer';
import FirebaseStorage from '../singleton/FirebaseStorage';

export default class MyMusicScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);

    this.state = {
      bUploading: false,
      uploadProgress: 0,
      uploadFileName: "pallo latke.mp3",
      downloadURL: "",
      musicList: Array(),
      fetchOffset: null,
      fetchLimit: 20,
      bFetching: true,
    };

    this._loadMyMusic.bind(this);
    this._onUploadDone.bind(this);
    this._onUploadError.bind(this);
    this._onUploadInit.bind(this);
    this._onUploadProgress.bind(this);
  }
  
  render() {
   //this._loadMyMusic();

    if(this.state.bUploading) {
      return (
        <Container>
          <AppHeader title='Uploading ...'/>
          <View style={styles.container}>
            <UploadProgress progress={this.state.uploadProgress} fileName={this.state.uploadFileName} onIgnore={this._onIgnorePost}></UploadProgress>
          </View>
        </Container>
      );
    }
    else {
      return (
        <Container>
          <AppHeader title='MGooS'/>
          <ScrollView style={styles.container}>
            <View>
              <FlatList
                data={this.state.musicList}
                renderItem={({ item }) => (
                  <ListItem
                    roundAvatar
                    title={item.title}
                    subtitle={item.album}
                    avatar={{ uri: item.coverImage }}
                    keyExtractor={item => item.id}
                  />
                )}
              />
            </View>
          </ScrollView>
          <UploadFAB onInit={this._onUploadInit} onProgress={this._onUploadProgress} onDone={this._onUploadDone} onError={this._onUploadError}/>
        </Container>
      );
    }
  }

  _loadMyMusic = () => {
    let handle = DataService.getProfileData().handle;
    
    FirebaseDBService.getMusicMetaInfoList(handle, 'default', this.state.fetchOffset, this.state.fetchLimit)
    .then(list => {
      console.log(list);
      if(list.length > 0) {
        const listLength = this.state.musicList ? this.state.musicList.length : 0;

        this.state.fetchOffset = list[listLength - 1].createdAt;
        //this.musicList = this.musicList ? this.musicList.concat(list) : list;

        //_me_.mp3List.sort(_me_.compare);
        console.log(this.state.musicList);

        list.forEach(async item => {
          const id    = item.id;
          const title = item.data.hasOwnProperty('metaData') ? item.data.metaData.common.title : item.data.customName;
          const album = item.data.hasOwnProperty('metaData') ? item.data.metaData.common.ablum : item.data.albumName;
          const uri   = await FirebaseStorage.getDownloadURL(item.fullPath);
          let coverImage = null;
          const duration    = item.data.hasOwnProperty('metaData') ? item.data.metaData.format.duration : null;
          let date = new Date(this.item.data.createdAtISO);
          const createdAt = date.toLocaleDateString();

          if(item.data.hasOwnProperty('metaData') && 
            item.data.metaData.common.hasOwnProperty('picture') && 
            item.data.metaData.common.picture[0].hasOwnProperty('data')) {
              const imgPath = item.data.metaData.common.picture[0].data;
             
              coverImage  = await FirebaseStorage.getDownloadURL(imgPath);
              
              //console.log(this.state.musicList[listLength + + parseInt(key)].thumbnail);
          }
          let plObj = new PlaylistItem(id, title, album, uri, coverImage, duration, createdAt);
          this.state.musicList.push(plObj);
        });
        /*for(let key in list) {
          const id    = list[key].id;
          const title = list[key].data.hasOwnProperty('metaData') ? list[key].data.metaData.common.title : list[key].data.customName;
          const album = list[key].data.hasOwnProperty('metaData') ? list[key].data.metaData.common.ablum : list[key].data.albumName;
          const uri   = await FirebaseStorage.getDownloadURL(list[key].fullPath);
          let coverImage = null;
          const duration    = list[key].data.hasOwnProperty('metaData') ? list[key].data.metaData.format.duration : null;
          let date = new Date(this.list[key].data.createdAtISO);
          const createdAt = date.toLocaleDateString();

          if(list[key].data.hasOwnProperty('metaData') && 
            list[key].data.metaData.common.hasOwnProperty('picture') && 
            list[key].data.metaData.common.picture[0].hasOwnProperty('data')) {
              const imgPath = list[key].data.metaData.common.picture[0].data;
             
              coverImage  = await FirebaseStorage.getDownloadURL(imgPath);
              
              //console.log(this.state.musicList[listLength + + parseInt(key)].thumbnail);
          }
          let plObj = new PlaylistItem(id, title, album, uri, coverImage, duration, createdAt);
          this.state.musicList.push(plObj);
          
        }*/
        console.log(this.state.musicList);
      }
    }).catch(error => {
      console.log("Error getMusicMetaInfoList");
      console.log(error);
    });
    //return ();
  }

  _onUploadInit = (fileName) => {
    this.setState({bUploading: true, uploadFileName: fileName});
  }
  
  _onUploadProgress = (progress) => {
    let normProgress = Math.round(progress) / 100;
    console.log("MyMusicScreen: ", normProgress);
    this.setState({uploadProgress: normProgress});
  }

  _onUploadDone = (dloadURL) => {
    this.setState({downloadURL: dloadURL});
  }

  _onUploadError = (error) => {
    this.setState({bUploading: false, uploadFileName: "", downloadURL: ""});
    alert("Uh, oh. Something went wrong with upload : " + error);
  }

  _onIgnorePost = () => {
    this.setState({bUploading: false});
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: '#fff',
  },
});
