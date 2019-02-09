import React from 'react';
import { ToastAndroid, ScrollView, StyleSheet, FlatList } from 'react-native';
import { Container, ListItem, View, Text, Body, Spinner } from 'native-base';

import { UploadFAB } from '../components/UploadFAB';
import { UploadProgress } from '../components/UploadProgress';
import { AppHeader, TabID } from '../components/AppHeader';
import FirebaseDBService from '../singleton/FirestoreDB';
import DataService from '../singleton/Data';
import { PlaylistItem } from '../components/MusicPlayer';
import FirebaseStorage from '../singleton/FirebaseStorage';
import { MyMusicItem } from '../components/MyMusicItem';

export default class MyMusicScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);

    this.state = {
      bUploading: false,
      bLoaded: false,
      uploadProgress: 0,
      uploadFileName: "pallo latke.mp3",
      downloadURL: "",
      musicList: Array(),
      fetchOffset: null,
      fetchLimit: 20,
      bFetching: true,
      nSelectCount: 0,
      selected: new Map(),
      refreshing: false
    };

    this._loadMyMusic.bind(this);
    this._onUploadDone.bind(this);
    this._onUploadError.bind(this);
    this._onUploadInit.bind(this);
    this._onUploadProgress.bind(this);
  }

  componentDidMount() {
    this._loadMyMusic();
  }

  _renderItem = (item) => {
    return (
      <MyMusicItem 
        item={item}
        onItemPress={this._onThumbnailPress}
        onAddToPlaylist={this._onAddToPlaylist}
        selected={!!this.state.selected.get(item.id)} />
    );
  }
  
  render() {

    if(this.state.bUploading) {
      return (
        <Container>
          <AppHeader id={TabID.MYMUSIC} title='Uploading ...'/>
          <View style={styles.container}>
            <UploadProgress progress={this.state.uploadProgress} fileName={this.state.uploadFileName} onIgnore={this._onIgnorePost}></UploadProgress>
          </View>
        </Container>
      );
    }
    else if(!this.state.bLoaded) {
      return (
        <Container>
          <AppHeader id={TabID.MYMUSIC} title='MGooS'/>
          <Spinner color='blue'/>
        </Container>
      );
    }
    else {
      //console.log(this.state.musicList);
      return (
        <Container>
          <AppHeader id={TabID.MYMUSIC} title='MGooS' selectCount={this.state.nSelectCount} selected={this.state.selected}/>
            <View style={styles.container}>
              <FlatList
                data={this.state.musicList}
                keyExtractor={item => item.id}
                onRefresh={this._onRefreshList}
                refreshing={this.state.refreshing}
                onEndReached={this._onEndReached}
                onEndReachedThreshold={0.5}
                renderItem={({ item }) => this._renderItem(item)}
              />
              <ListItem noBorder>
                <Body><Text></Text></Body>
              </ListItem>
              <ListItem noBorder>
                <Body><Text></Text></Body>
              </ListItem>
              <ListItem noBorder>
                <Body><Text></Text></Body>
              </ListItem>
            </View>
          <UploadFAB onInit={this._onUploadInit} onProgress={this._onUploadProgress} onDone={this._onUploadDone} onError={this._onUploadError}/>
        </Container>
      );
    }
  }

  _onOpenDialog = () => {
    return;
  }

  _onEndReached = () => {

  }

  _onRefreshList = () => {
    this.setState({refreshing: true});
    this._loadMyMusic();
  }

  _onAddToPlaylist = (item) => {
    DataService.AddToPlaylist(item);

    ToastAndroid.showWithGravity(`${item.title} added to playlist!`, 
      ToastAndroid.SHORT, ToastAndroid.CENTER);
  }

  _onThumbnailPress = (id) => {
    //console.log(item);
    
    this.setState((state) => {
      // copy the map rather than modifying state.
      const selected = new Map(state.selected);
      const val = !selected.get(id);
      selected.set(id, val); // toggle

      nSelectCount = val ? (state.nSelectCount + 1) : (state.nSelectCount - 1);

      return {selected, nSelectCount};
    });
  }

  _loadMyMusic = () => {
    let handle = DataService.getProfileData().handle;
    let musicList = Array();
    
    FirebaseDBService.getMusicFileList(handle, 'default')//, this.state.fetchOffset, this.state.fetchLimit)
    .then(list => {
      //console.log(list);
      if(list.length > 0) {
        const listLength = list.length;
        //const listLength = this.state.musicList ? this.state.musicList.length : 0;

        this.state.fetchOffset = list[listLength - 1].data.createdAt;
        //musicList = this.state.musicList.concat(list);

        //_me_.mp3List.sort(_me_.compare);
        //console.log(this.state.musicList);

        list.forEach(async (item, index, ary) => {
          const id    = item.id;
          const title = (item.data.hasOwnProperty('metaData') && 
                         item.data.metaData.hasOwnProperty('common') && 
                         item.data.metaData.common.hasOwnProperty('title')) ? item.data.metaData.common.title : item.data.customName;
          const album = (item.data.hasOwnProperty('metaData') && 
                         item.data.metaData.hasOwnProperty('common') && 
                         item.data.metaData.common.hasOwnProperty('album')) ? item.data.metaData.common.album : item.data.albumName;
          let uri = null;
          try {
            uri = await FirebaseStorage.getDownloadURL(item.data.fullPath);
          }
          catch (error) {
            console.log("URI For -> ");
            console.log(error);
            console.log(item);
          }
          let coverImage = (item.data.hasOwnProperty('metaData') && 
                            item.data.metaData.hasOwnProperty('common') &&
                            item.data.metaData.common.hasOwnProperty('picture')) ? item.data.metaData.common.picture[0].data : null;
          const duration = item.data.hasOwnProperty('metaData') ? item.data.metaData.format.duration : null;
          let date       = new Date(item.data.createdAtISO);
          const createdAt = date.toLocaleDateString();
          try {
            coverImage  = coverImage ? await FirebaseStorage.getDownloadURL(coverImage) : null;
          }
          catch(error) {
            console.log("coverImage For -> ");
            console.log(error);
            console.log(item);
          }

          let plObj = new PlaylistItem(id, title, album, uri, coverImage, duration, createdAt, `mp3Collection/${handle}/default/${id}`);

          musicList.push(plObj.toJSON());

          //console.log("CoverImg: " + coverImage);
          //console.log("MP3 URL: " + uri);

          if(index == (listLength - 1)) {
            this.setState({refreshing: false, bLoaded: true, musicList: musicList});
            //console.log(musicList);
          }
        });
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
  }
});
