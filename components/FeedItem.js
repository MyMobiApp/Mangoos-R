import React from 'react';
import { Image, Dimensions, StyleSheet } from 'react-native';
import { View, Grid, Col, Card, CardItem, Thumbnail, Text, Button, Icon, Left, Right, Body } from 'native-base';
import { Entypo } from '@expo/vector-icons';
import { PlaylistItem } from './MusicPlayer';
//import { Image } from "react-native-expo-image-cache";

export class StorageFeedItem {
  constructor(id, profileHandle, fullName, profileImg, feedMsg, musicURL, 
    musicCover, musicTitle, musicAlbum, musicDuration, postDateTime, likes) {
    this.id             = id;
    this.profileHandle  = profileHandle;
    this.profileName    = fullName;
    this.profileImg     = profileImg;
    this.feedMsg        = feedMsg;
    this.musicURL       = musicURL;
    this.musicCover     = musicCover;
    this.musicTitle     = musicTitle;
    this.musicAlbum     = musicAlbum;
    this.musicDuration  = musicDuration;
    this.postDateTime   = postDateTime;
    this.likes          = likes;
  }

  toJSON() {
    return {
      id:             this.id,
      profileHandle:  this.profileHandle,
      profileName:    this.fullName,
      profileImg:     this.profileImg,
      feedMsg:        this.feedMsg,
      musicURL:       this.musicURL,
      musicCover:     this.musicCover,
      musicTitle:     this.musicTitle,
      musicAlbum:     this.musicAlbum,
      musicDuration:  this.musicDuration,
      postDateTime:   this.postDateTime,
      likes:          this.likes,
    }
  }
}

export class FeedItem extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      id:             props.id,
      profileHandle:  props.profileHandle,
      profileName:    props.fullName,
      profileImg:     props.profileImg,
      feedMsg:        props.feedMsg,
      musicURL:       props.musicURL,
      musicCover:     props.musicCover,
      musicTitle:     props.musicTitle,
      musicAlbum:     props.musicAlbum,
      musicDuration:  props.musicDuration,
      postDateTime:   props.postDateTime,
      likes:          props.likes,
    }
  }

  componentWillReceiveProps(newProps) {
    if (this.state.id !== newProps.profileImg) {
      this.setState({profileImg: newProps.profileImg});
    }

    if (this.state.musicURL !== newProps.musicURL) {
      this.setState({musicURL: newProps.musicURL});
    }

    if (this.state.musicCover !== newProps.musicCover) {
      this.setState({musicCover: newProps.musicCover});
    }

    if (this.state.musicTitle !== newProps.musicTitle) {
      this.setState({musicTitle: newProps.musicTitle});
    }

    if (this.state.musicAlbum !== newProps.musicAlbum) {
      this.setState({musicAlbum: newProps.musicAlbum});
    }
  }

  shouldComponentUpdate(nextProps) {
    return (this.state.profileImg !== nextProps.profileImg || 
            this.state.musicURL !== nextProps.musicURL || 
            this.state.musicCover !== nextProps.musicCover ||
            this.state.musicTitle !== nextProps.musicTitle ||
            this.state.musicAlbum !== nextProps.musicAlbum);
  }

  render() {
    return (
      <Card style={styles.card}>
        <CardItem bordered>
          <Left>
            <Thumbnail source={{uri: this.state.profileImg}} />
            <Body>
              <Text>{this.state.profileName}</Text>
              <Text note>{this.state.postDateTime}</Text>
            </Body>
          </Left>
        </CardItem>
        <CardItem bordered>
          <Body>
            {/* {...{uri: this.state.musicCover}} */}
            <Image source={this.state.musicCover ? {uri: this.state.musicCover} : require('../assets/images/default_cover.jpg')} 
              style={{resizeMode: 'contain', height: 200, width: (Dimensions.get('window').width - 50), flex: 1}}/>
            <View style={{marginTop: 5, alignItems: 'center', width:'100%'}}>
              <Text>{this.state.musicTitle}</Text>
              <Text note>{this.state.musicAlbum}</Text>
            </View>
            <View style={{marginTop: 10, alignItems: 'flex-start', width:'100%', borderTopWidth:1, borderColor:'silver'}}>
              <Text style={{margin: 15}}>{this.state.feedMsg}</Text>
            </View>
          </Body>
        </CardItem>
        <CardItem>
          <Grid>
            <Col>
              <Left>

              </Left>
            </Col>
            <Col>
            <Right>
              <Button small transparent onPress={this._onAddToPlaylist} textStyle={styles.textStyle}>
                <Text>Add to Playlist</Text>
                <Entypo name="add-to-list" size={20} color={'blue'}/>
              </Button>
            </Right>
            </Col>
          </Grid>
        </CardItem>
      </Card>
    );
  }

  _onAddToPlaylist = () => {
    const item = this._getPlaylistItemObject();

    //console.log(item);
    this.props.onAddToPlaylist(item);
  }

  _getPlaylistItemObject = () => {
    let playlistItem = new PlaylistItem(this.state.id, 
        this.state.musicTitle, 
        this.state.musicAlbum, 
        this.state.musicURL, 
        this.state.musicCover, 
        this.state.musicDuration,
        this.state.postDateTime);

    return playlistItem.toJSON();
  }
}

const styles = StyleSheet.create({
  card: {
    margin: 5,
    flex: 0
  },
  textStyle:{
    color: '#87838B', 
    borderWidth: 1, 
    borderColor: 'silver'
  }
});