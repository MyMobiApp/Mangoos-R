import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Button
} from 'react-native';
import { WebBrowser } from 'expo';
import { Spinner } from 'native-base';

import { AppHeader, TabID } from '../components/AppHeader';
import { FeedItem } from '../components/FeedItem';
import FirebaseDBService from '../singleton/FirestoreDB';
import ImageService from '../singleton/ImageService';
import FirebaseStorage from '../singleton/FirebaseStorage';
import DataService from '../singleton/Data';


export default class FeedScreen extends React.Component {
  static navigationOptions = {
    header: null
  };

  constructor(props) {
    super(props);

    this.state = {
      feedList: Array(),
      fetchOffet: null,
      fetchLimit: 20,
      bLoaded: false
    }

    DataService.InitAddToPlaylistEvent();
  }

  componentDidMount() {
    this._loadFeed();
  }

  _renderFeed = () => {
    
    return this.state.feedList.map((obj, index, ary) => {
      //console.log(obj);

      return (
        <FeedItem
          key = {obj.id}
          id = {obj.id} 
          profileHandle={obj.data.profile_handle} 
          fullName={obj.data.full_name} 
          profileImg={obj.data.profileImg} 
          FeedMsg={obj.data.message} 
          musicURL={obj.data.musicURL} 
          musicCover={obj.data.musicCover} 
          musicTitle={obj.data.musicTitle} 
          musicAlbum={obj.data.musicAlbum} 
          postDateTime={obj.data.post_datetime} 
          likes={obj.data.likes} 
        />
      )
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <AppHeader id={TabID.FEED} title='MGooS'/>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          <View>
            {
              this.state.bLoaded ? this._renderFeed() : <Spinner color='blue'/>
            }
          </View>
        </ScrollView>
      </View>
    );
  }

  _loadFeed = (event) => {
    let feedList = this.state.feedList;

    FirebaseDBService.getPublicFeedItemWithOffset(this.state.fetchOffset, this.state.fetchLimit)
        .then(feedItemAry => {
      const listLength = feedList.length;
      
      feedList = this.state.feedList.concat(feedItemAry);
      this.setState({fetchOffset: feedItemAry[feedItemAry.length - 1].post_dateobj});
      
      if(feedItemAry) {
        var options = { weekday: "long", year: "numeric", month: "long",   
            day: "numeric" };
        feedItemAry.forEach(async (item, index, ary) => {
          var dateObj = new Date(item.data.post_dateobj);
          feedList[listLength+index].data.post_datetime = dateObj.toLocaleDateString("en-US", options);

          feedList[listLength+index].data.profileImg = await ImageService.getProfileImage( feedList[listLength+index].data.profile_handle);
          
          FirebaseDBService.getMusicData(feedList[listLength+index].data.db_path).then(async obj => {
            feedList[listLength+index].data.musicAlbum = obj.album;
            feedList[listLength+index].data.musicTitle = obj.title;
            feedList[listLength+index].data.musicCover = await FirebaseStorage.getDownloadURL(obj.pictureURL);
            feedList[listLength+index].data.musicURL   = await FirebaseStorage.getDownloadURL(obj.storagePath);

            if(index == (feedItemAry.length - 1)) {
              this.setState({bLoaded: true, feedList: feedList});
  
              //console.log("Complete Array");
              //console.log(feedList);
            }
          }).catch(error => {
            console.log("getMusicData Error: " + error);
          });
        })
        
      }
      
      //console.log("Fetched Array");
      //console.log(feedItemAry);
      //console.log("Complete Array");
      //console.log(this.state.feedList);

      if(event) {
        event.target.complete();
        if(feedItemAry.length == 0) {
          event.target.disabled = true;
        }
      }
    });
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
