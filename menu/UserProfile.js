import React from 'react';
import { Text } from 'react-native';

export class UserProfile extends React.Component {
  static navigationOptions = {
    drawerLabel: 'My Profile'
  };

  render() {
    return <Text style={[this.props.style, { fontFamily: 'space-mono' }]}>Hi</Text>;
  }
}
