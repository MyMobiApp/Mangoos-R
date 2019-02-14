import React from 'react';
import { Share, Alert, ToastAndroid } from 'react-native';
import { Header, Left, Body, Right, Button, Title } from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
import showPopupMenu from 'react-native-popup-menu-android';
const firebase = require('firebase');
// Required for side-effects
require('firebase/firestore');

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { 
    addManyToPlaylist,
    removeManyFromPlaylist
} from '../redux/actions';

export var TabID = {
  FEED: 1,
  MYMUSIC: 2,
  PLAYLIST: 3
};

class AppHeader extends React.Component {

  moreButton = null;
  refMoreButton = el => this.moreButton = el;

  constructor(props) {
    super(props);

    this.state = {
      title: props.title,
      id: props.id,
    }
  }

  shouldComponentUpdate(nextProps) {
    return (this.state.selectCount !== nextProps.selectCount);
  }

  _renderButtons = () => {
    if(this.props.selectCount) {
      return (
        <Right>
          {/* 
          <Button transparent onPress={this._onDeletePress} >
            <MaterialIcons name='delete' size={24} color='white'/>
          </Button>
          */}
          <Button transparent onPress={this._onAddToPlaylistPress}>
            <MaterialIcons name='playlist-add' size={24} color='white'/>
          </Button>
          <Button transparent onPress={this._onMorePress} ref={this.refMoreButton}>
            <MaterialIcons name='more-vert' size={24} color='white'/>
          </Button>
        </Right>
      );
    }
    else {
      return (
        <Right>
          <Button transparent onPress={this._onMorePress} ref={this.refMoreButton}>
            <MaterialIcons name='more-vert' size={24} color='white'/>
          </Button>
        </Right>
      );
    }
    
  }

  render(title) {
    return (
      <Header>
        <Left>
          <Button transparent onPress={this._onSignOut}>
            <MaterialIcons name='power-settings-new' size={24} color='white'/>
          </Button>
        </Left>
        <Body>
          <Title>{this.state.title}</Title>
        </Body>
        {this._renderButtons()}
      </Header>
    );
  }

  _onTitlePress = () => {
    alert("Title tapped");
  }

  _onSignOut = () => {
    Alert.alert(
      'Signout',
      'Are you sure to sign-out?',
      [
        {
          text: 'No',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'Yes', 
          onPress: () => firebase.auth().signOut()
        },
      ],
      {cancelable: false},
    );
  }

  _onDeletePress = () => {
    this.props.removeManyFromPlaylist(this.props.selected);
  }

  _onAddToPlaylistPress = () => {
    console.log("AppHeader Props: ", this.props);
    
    this.props.addManyToPlaylist(this.props.selected);

    ToastAndroid.showWithGravity(`${this.props.selected.length} items added to playlist!`, 
      ToastAndroid.SHORT, ToastAndroid.CENTER);

    this.props.clearSelectionCallback();
  }

  _onMorePress = () => {
    showPopupMenu(
      [
        { id:'share', label:"Share App" }
      ],
      this.handleMoreItemSelect,
      this.moreButton
    );
  }

  handleMoreItemSelect = (item) => {
    if(item.id === 'share') {
      this._onSharePress();
    }
  }

  _onSharePress = () => {
    const message = "Hey, I am enjoying *MGooS Social Music Sharing* App. Install it, you will love it.";
    const subject = "MGoos Social Music Sharing App";
    const url     = "https://play.google.com/store/apps/details?id=com.mgoos.app&hl=en";

    Share.share({
      message: `${message} ${url}`, title: subject
    }).then(() => {
      console.log("Shared");
    }).catch(error => {
      console.log("Error in sharing: " + error);
    })
  }
}

const mapStateToProps = (state) => {
  return {reducer: Object.assign({}, state)};
};

const mapDispatchToProps = dispatch => (
  bindActionCreators({
    addManyToPlaylist,
    removeManyFromPlaylist
  }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(AppHeader);