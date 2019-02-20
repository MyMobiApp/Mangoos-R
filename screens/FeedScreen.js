import React from 'react';
import {
  NetInfo,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  FlatList,
  RefreshControl,
  ToastAndroid
} from 'react-native';
import { WebBrowser } from 'expo';
import { Spinner } from 'native-base';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { 
    updateFeed,
    addToPlaylist,
    netConnected,
    netDisconnected
} from '../redux/actions';

import AppHeader, { TabID } from '../components/AppHeader';
import { FeedItem } from '../components/FeedItem';
import FirebaseDBService from '../singleton/FirestoreDB';
import ImageService from '../singleton/ImageService';
import DataService from '../singleton/Data';


class FeedScreen extends React.Component {
  static navigationOptions = {
    header: null
  };

  constructor(props) {
    super(props);

    this.timerHandle  = null;
    this.fetchOffset  = null;
    this.fetchLimit   = 5;

    this.state = {
      feedList: Array(),
      bShowSpinner: true,
      bLoaded: false,
      refreshing: false,
      endReached: false
    }
  }

  componentWillMount() {
    if(NetInfo.isConnected) {
      this.props.netConnected();
    }
    else {
      this.props.netDisconnected();
    }

    NetInfo.addEventListener('connectionChange', this._handleConnectivityChange);

    this._loadFeed();
  }

  shouldComponentUpdate(newProps) {
    if(newProps.reducer.updateScreenStore.bUpdateFeed) {
      //this._onListRefresh();
      this.props.updateFeed(false);
    }

    return true;
  }

  _handleConnectivityChange = (connectionInfo) => {
    if(connectionInfo.type === 'wifi' || connectionInfo.type === 'cellular') {
      this.props.netConnected();
    }
    else {
      this.props.netDisconnected();
    }
  }

  _renderItem = (item) => {
    //console.log(item);
    return (
      <FeedItem
        key = {item.id}
        id = {item.id} 
        profileHandle={item.data.profile_handle} 
        fullName={item.data.full_name} 
        profileImg={item.data.profileImg} 
        feedMsg={item.data.message} 
        musicURL={item.data.musicURL} 
        musicCover={item.data.musicCover} 
        musicTitle={item.data.musicTitle} 
        musicAlbum={item.data.musicAlbum} 
        musicDuration={item.data.musicDuration}
        postDateTime={item.data.post_datetime} 
        likes={item.data.likes}
        onAddToPlaylist={this._onAddToPlaylist}
      />
    )
  }

  _renderFlatList = () => {
    if(!this.state.bShowSpinner) {
      return (
        <FlatList
          data={this.state.feedList}
          keyExtractor={item => item.id}
          onEndReachedThreshold={0.5}
          onEndReached={this._onListEndReached}
          /*onRefresh={this._onListRefresh}
          refreshing={this.state.refreshing}*/
          progressViewOffset={20}
          renderItem={({ item }) => this._renderItem(item)}
        />
      );
    }
    else {
      return (
        <Spinner color='blue'/>
      );
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <AppHeader id={TabID.FEED} title='MGooS'/>
        <ScrollView refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={this._onListRefresh} />}
          style={styles.container} contentContainerStyle={styles.contentContainer}>
          <View>
            {
              this._renderFlatList()
            }
          </View>
        </ScrollView>
      </View>
    );
  }

  _loadFeed = (event) => {
    let feedList = this.state.feedList;

    FirebaseDBService.getPublicFeedItemWithOffset(this.fetchOffset, this.fetchLimit)
        .then(feedItemAry => {
      if(feedItemAry.length > 0) {
        const listLength = feedList.length;
      
        feedList = this.state.feedList.concat(feedItemAry);
        this.fetchOffset = feedItemAry[feedItemAry.length - 1].data.post_dateobj;
        
        if(feedItemAry) {
          var options = { weekday: "long", year: "numeric", month: "long",   
              day: "numeric" };
          feedItemAry.forEach(async (item, index, ary) => {
            var dateObj = new Date(item.data.post_dateobj);
            feedList[listLength+index].data.post_datetime = dateObj.toLocaleDateString("en-US", options);

            feedList[listLength+index].data.profileImg = await ImageService.getProfileImage( feedList[listLength+index].data.profile_handle);
            
            FirebaseDBService.getMusicData(feedList[listLength+index].data.db_path).then(obj => {
              feedList[listLength+index].data.musicAlbum    = obj.album;
              feedList[listLength+index].data.musicTitle    = obj.title;
              feedList[listLength+index].data.musicDuration = obj.duration;

              feedList[listLength+index].data.musicCover    = obj.pictureURL? DataService.getFirebaseStorageReadURL(obj.pictureURL) : null;
              //await FirebaseStorage.getDownloadURL(obj.pictureURL);
              feedList[listLength+index].data.musicURL      = DataService.getFirebaseStorageReadURL(obj.storagePath);
              //await FirebaseStorage.getDownloadURL(obj.storagePath);
              
              if(index == (feedItemAry.length - 1)) {
                this.setState({bLoaded: true, bShowSpinner: false, refreshing: false, feedList: feedList});
    
                //console.log("Complete Array");
                //console.log(feedList);
              }
            }).catch(error => {
              console.log("getMusicData Error: ");
              console.log(error);
            });
          })
        }
      } 
      else {
        this.setState({endReached: true});
      }
    });
  }

  _onAddToPlaylist = (item) => {
    //DataService.AddToPlaylist(item);
    this.props.addToPlaylist(item);
    
    ToastAndroid.showWithGravity(`${item.title} added to playlist!`, 
      ToastAndroid.SHORT, ToastAndroid.CENTER);
  }

  _onListEndReached = (distanceFromEnd) => {
    this.timerHandle = setInterval(() => {
      if(this.state.bLoaded && !this.state.endReached) {
        this.setState({bLoaded: false});
        this._loadFeed(null);

        clearInterval(this.timerHandle);
      }
      else if(this.state.endReached) {
        clearInterval(this.timerHandle);
      }
    }, 1000);

    //console.log(distanceFromEnd);
  }

  _onListRefresh = () => {
    if(this.timerHandle) {
      clearInterval(this.timerHandle);

      this.timerHandle  = null;
    }
    else {
      this.fetchOffset  = null;

      this.setState({feedList: Array(), refreshing: true, endReached: false}, () => {
        this._loadFeed(null);
      });
    }
  }

  _maybeRenderDevelopmentModeWarning() {
    if (__DEV__) {
      const learnMoreButton = (
        <Text onPress={this._handleLearnMorePress} style={styles.helpLinkText}>
          Learn more
        </Text>
      );

      return (
        <Text style={styles.developmentModeText}>
          Development mode is enabled, your app will be slower but you can use useful development
          tools. {learnMoreButton}
        </Text>
      );
    } else {
      return (
        <Text style={styles.developmentModeText}>
          You are not in development mode, your app will run at full speed.
        </Text>
      );
    }
  }

  _handleLearnMorePress = () => {
    WebBrowser.openBrowserAsync('https://docs.expo.io/versions/latest/guides/development-mode');
  };

  _handleHelpPress = () => {
    WebBrowser.openBrowserAsync(
      'https://docs.expo.io/versions/latest/guides/up-and-running.html#can-t-see-your-changes'
    );
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  developmentModeText: {
    marginBottom: 20,
    color: 'rgba(0,0,0,0.4)',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
  },
  contentContainer: {
    paddingTop: 30,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: 'contain',
    marginTop: 3,
    marginLeft: -10,
  },
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50,
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightText: {
    color: 'rgba(96,100,109, 0.8)',
  },
  codeHighlightContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 24,
    textAlign: 'center',
  },
  tabBarInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 20,
      },
    }),
    alignItems: 'center',
    backgroundColor: '#fbfbfb',
    paddingVertical: 20,
  },
  tabBarInfoText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    textAlign: 'center',
  },
  navigationFilename: {
    marginTop: 5,
  },
  helpContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
});

const mapStateToProps = (state) => {
  return {reducer: Object.assign({}, state)};
};

const mapDispatchToProps = dispatch => (
  bindActionCreators({
    updateFeed,
    addToPlaylist,
    netConnected,
    netDisconnected
  }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(FeedScreen);