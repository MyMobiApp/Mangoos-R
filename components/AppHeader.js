import React from 'react';
import { Text, Alert } from 'react-native';
import { Header, Left, Body, Right, Button, Icon, Title } from 'native-base';

const firebase = require('firebase');
// Required for side-effects
require('firebase/firestore');

export class AppHeader extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      title: props.title,
    }
  }

  render(title) {
    return (
      <Header>
        {/* 
        <Left>
          <Button transparent onPress={this._onMenuPress}>
            <Icon name='menu' />
          </Button>
        </Left>
        */}
        <Left>
          <Button transparent onPress={this._onSignOut}>
            <Icon name='md-power' />
          </Button>
        </Left>
        <Body>
          <Title>{this.state.title}</Title>
        </Body>
        <Right>
          <Button transparent onPress={this._onSharePress}>
            <Icon name='share' />
          </Button>
        </Right>
      </Header>
    );
  }

  _onSignOut() {
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

  _onSharePress = () => {
    
  }
}
