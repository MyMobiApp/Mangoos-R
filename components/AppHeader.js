import React from 'react';
import { Text } from 'react-native';
import {  Header, Left, Body, Right, Button, Icon, Title } from 'native-base';

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
        <Left>
          <Button transparent onPress={this._onMenuPress}>
            <Icon name='menu' />
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

  _onMenuPress = () => {

  }

  _onSharePress = () => {
    
  }
}
