import React from 'react';
import { Alert, TouchableOpacity } from 'react-native';
import { View, Header, Left, Body, Right, Button, Title } from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';

import showPopupMenu from 'react-native-popup-menu-android';

const firebase = require('firebase');
// Required for side-effects
require('firebase/firestore');

export var TabID = {
  FEED: 1,
  MYMUSIC: 2,
  PLAYLIST: 3
};

export class AppHeader extends React.Component {

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
          <Button transparent onPress={this._onDeletePress} >
            <MaterialIcons name='delete' size={24} color='white'/>
          </Button>
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

  _onMenuPress = () => {
    this.props.navigation.toggleDrawer();
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
    alert('Pressed: ' + item.label)
  }

  _onSharePress = () => {
    
  }
}
