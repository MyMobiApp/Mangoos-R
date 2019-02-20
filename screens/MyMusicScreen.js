import React from 'react';
import { 
  RefreshControl,
  ToastAndroid, 
  ScrollView, 
  StyleSheet, 
  FlatList 
} from 'react-native';
import { Container, ListItem, View, Text, Body, Spinner } from 'native-base';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
    updateFeed ,
    addToPlaylist,
    removeFromPlaylist
} from '../redux/actions';

import { UploadFAB } from '../components/UploadFAB';
import { UploadProgress } from '../components/UploadProgress';
import AppHeader, { TabID } from '../components/AppHeader';
import FirebaseDBService from '../singleton/FirestoreDB';
import DataService from '../singleton/Data';
import { PlaylistItem } from '../components/MusicPlayer';
import { MyMusicItem } from '../components/MyMusicItem';
import NativeStorage from '../singleton/NativeStorage';

class MyMusicScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);

    this.fetchOffset  = null;
    this.fetchLimit   = 10;
    this.timerHandle  = null;
    this.bListLoadedFromLocal = true;

    this.state = {
      bUploading: false,
      bLoaded: false,
      endReached: false,
      bShowSpinner: true,
      uploadProgress: 0,
      uploadFileName: "",
      downloadURL: "",
      musicList: Array(),
      bFetching: true,
      nSelectCount: 0,
      selected: new Map(),
      selectedItemAry: Array(),
      feedMap: new Map(),
      refreshing: false
    };
  }

  _readMusicListFromStorage = () => {
    NativeStorage.getMyMusic().then((sList) => {
      const mList = JSON.parse(sList);
      this.setState({bShowSpinner: false, musicList: Array().concat(mList)});
    }).catch(error => {
      console.log("_readMusicListFromStorage: ", error);
      this.bListLoadedFromLocal = false;
      this._loadMyMusic();
    });
    
  }

  componentDidMount() {
    // Fetch playlist items from native storage
    //this._readMusicListFromStorage();
    this.bListLoadedFromLocal = false;
    this._loadMyMusic();
  }

  _renderItem = (item) => {
    //console.log("Rendering: ", !!this.state.feedMap.get(item.id), item);

    return (
      <MyMusicItem 
        item={item}
        onItemPress={this._onThumbnailPress}
        onAddToPlaylist={this._onAddToPlaylist}
        onRemoveItem={this._onRemoveItemFromMusicList}
        onUpdateFeedAndMyMusic={this._onUpdateFeedAndMyMusic}
        bInFeed={this.state.feedMap.get(item.id)}
        selected={!!this.state.selected.get(item.id)} />
    );
  }
  
  render() {
    
    if(this.state.bUploading) {
      return (
        <Container>
          <AppHeader id={TabID.MYMUSIC} title='Uploading ...'/>
          <UploadProgress 
            progress={this.state.uploadProgress} 
            fileName={this.state.uploadFileName} 
            onIgnore={this._onIgnorePost}
            onPostFeed={this._onPostFeed} />
        </Container>
      );
    }
    else if(this.state.bShowSpinner) {
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
          <AppHeader id={TabID.MYMUSIC} title='MGooS' 
            selectCount={this.state.nSelectCount} 
            selected={this.state.selectedItemAry} 
            clearSelectionCallback={this._clearSelection} />
          <ScrollView refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={this._onRefreshList}/>} >
            <View style={styles.container}>
              <FlatList
                data={this.state.musicList}
                keyExtractor={item => item.id}
                /*onRefresh={this._onRefreshList}
                refreshing={this.state.refreshing}*/
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
          </ScrollView>
          <UploadFAB onInit={this._onUploadInit} onProgress={this._onUploadProgress} onDone={this._onUploadDone} onError={this._onUploadError}/>
        </Container>
      );
    }
  }

  _loadMyMusic = () => {
    let handle = DataService.getProfileData().handle;
    let musicList = Array();
    
    FirebaseDBService.getMusicFileList(handle, 'default', this.fetchOffset, this.fetchLimit)
    .then(list => {
      //console.log(list);
      if(list.length > 0) {
        const listLength = list.length;
        this.fetchOffset = list[listLength - 1].data.createdAt;
        
        let tempMap = new Map();
        list.forEach((item, index, ary) => {
          const id    = item.id;
          const title = (item.data.hasOwnProperty('metaData') && 
                         item.data.metaData.hasOwnProperty('common') && 
                         item.data.metaData.common.hasOwnProperty('title')) ? item.data.metaData.common.title : item.data.customName;
          const album = (item.data.hasOwnProperty('metaData') && 
                         item.data.metaData.hasOwnProperty('common') && 
                         item.data.metaData.common.hasOwnProperty('album')) ? item.data.metaData.common.album : item.data.albumName;
          let uri = DataService.getFirebaseStorageReadURL(item.data.fullPath);
          //await FirebaseStorage.getDownloadURL(item.data.fullPath);
          
          let coverImage = (item.data.hasOwnProperty('metaData') && 
                            item.data.metaData.hasOwnProperty('common') &&
                            item.data.metaData.common.hasOwnProperty('picture')) ? item.data.metaData.common.picture[0].data : null;
          const duration = item.data.hasOwnProperty('metaData') ? item.data.metaData.format.duration : null;
          let date       = new Date(item.data.createdAtISO);
          const createdAt = date.toLocaleDateString();
          
          coverImage  = DataService.getFirebaseStorageReadURL(coverImage);
          //coverImage ? await FirebaseStorage.getDownloadURL(coverImage) : null;
          
          let plObj = new PlaylistItem(id, title, album, uri, coverImage, duration, createdAt, `mp3Collection/${handle}/default/${id}`);

          musicList.push(plObj.toJSON());

          // Check for feedID
          if(item.data.feedID) {
            this.state.feedMap.set(id, true);
          }
          else {
            this.state.feedMap.set(id, false);
          }
          
          if(index == (listLength - 1)) {
            const finalList = this.state.musicList.concat(musicList);

            this.setState({refreshing: false, bShowSpinner: false, 
              bLoaded: true, musicList: finalList}, () => {
              NativeStorage.persistMyMusic(this.state.musicList);
            });

            //console.log("FeedMap: ", this.state.feedMap);
          }
        });
      }
      else {
        this.setState({endReached: true, refreshing: false, bShowSpinner: false});
      }
    }).catch(error => {
      console.log("Error getMusicFileList");
      console.log(error);
      this.setState({endReached: true, refreshing: false, bShowSpinner: false});
    });
    //return ();
  }

  _onEndReached = (info) => {
    if(!this.bListLoadedFromLocal) {
      this.timerHandle = setInterval(() => {
        if(this.state.bLoaded && !this.state.endReached) {
          this.setState({bLoaded: false});
          this._loadMyMusic();

          clearInterval(this.timerHandle);
        }
        else if(this.state.endReached) {
          clearInterval(this.timerHandle);
        }
      }, 1000); 
    }

    //console.log(info);
  }

  _onRefreshList = () => {
    this.timerHandle  = null;
    this.fetchOffset  = null;
    this.bListLoadedFromLocal = false;

    this.setState({musicList: Array(), refreshing: true, endReached: false}, () => {
      this._loadMyMusic();
    });
  }

  _onAddToPlaylist = (item) => {
    //DataService.AddToPlaylist(item);
    this.props.addToPlaylist(item);
    
    ToastAndroid.showWithGravity(`${item.title} added to playlist!`, 
      ToastAndroid.SHORT, ToastAndroid.CENTER);
  }

  _onRemoveItemFromMusicList = (id) => {
    this.props.removeFromPlaylist(id);
    
    const newList = this.state.musicList.filter(o => o.id !== id);
    //console.log(newList);
    
    this.setState({musicList: Array().concat(newList)});
  }

  _onUpdateFeedAndMyMusic = () => {
    this.props.updateFeed(true);
  }

  _clearSelection = () => {
    
    this.setState((state) => {
      // copy the map rather than modifying state.
      const selected = new Map(state.selected);
      selected.clear();
      console.log("_clearSelection:", selected);
      const selectedItemAry = Array();
      const nSelectCount = 0;

      return {selected, selectedItemAry, nSelectCount};
    });
  }

  _onThumbnailPress = (id) => {
    //console.log(item);
    
    this.setState((state) => {
      // copy the map rather than modifying state.
      const selected = new Map(state.selected);
      const val = !!!selected.get(id);
      selected.set(id, val); // toggle: val is boolean (true, false)

      const selectedItem = state.musicList.find(o => o.id === id);
      const selectedItemAry = state.selectedItemAry.concat(selectedItem);

      nSelectCount = val ? (state.nSelectCount + 1) : (state.nSelectCount - 1);

      return {selected, selectedItemAry, nSelectCount};
    });
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
    this._onRefreshList();
    this.setState({downloadURL: dloadURL});
  }

  _onUploadError = (error) => {
    this.setState({bUploading: false, uploadFileName: "", downloadURL: ""});
    alert("Uh, oh. Something went wrong with upload : " + error);
  }

  _onIgnorePost = () => {
    this.setState({bUploading: false});
  }

  _onPostFeed = () => {
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

const mapStateToProps = (state) => {
  return {reducer: Object.assign({}, state)};
};

const mapDispatchToProps = dispatch => (
  bindActionCreators({
    updateFeed,
    addToPlaylist,
    removeFromPlaylist
  }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(MyMusicScreen);