import React from 'react';
import TrackPlayer  from 'react-native-track-player';

import { ExpoConfigView } from '@expo/samples';

export default class PlaylistScreen extends React.Component {
  static navigationOptions = {
    title: 'app.json',
  };

  render() {
    /* Go ahead and delete ExpoConfigView and replace it with your
     * content, we just wanted to give you a quick view of your config */
    return <ExpoConfigView />;
  }
}
