import React from 'react';
import { Container, View } from 'native-base';

import { MusicPlayer, PlaylistItem } from '../components/MusicPlayer';
import { AppHeader } from '../components/AppHeader';


const PLAYLIST = [
	new PlaylistItem(
    	'Comfort Fit - “Sorry”',
    	'Default',
		'https://s3.amazonaws.com/exp-us-standard/audio/playlist-example/Comfort_Fit_-_03_-_Sorry.mp3',
		'https://pngimage.net/wp-content/uploads/2018/06/main-menu-png-5.png'
	),
	new PlaylistItem(
    	'Mildred Bailey – “All Of Me”',
    	'Default',
		'https://ia800304.us.archive.org/34/items/PaulWhitemanwithMildredBailey/PaulWhitemanwithMildredBailey-AllofMe.mp3',
		'https://pngimage.net/wp-content/uploads/2018/06/main-menu-png-5.png'
	),
	new PlaylistItem(
    	'Podington Bear - “Rubber Robot”',
    	'Default',
		'https://s3.amazonaws.com/exp-us-standard/audio/playlist-example/Podington_Bear_-_Rubber_Robot.mp3',
		'https://pngimage.net/wp-content/uploads/2018/06/main-menu-png-5.png'
	),
];

export default class PlaylistScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);

    this.state = {
      playlist: PLAYLIST,
      curIndex: 0
    }
  }

  render() {
	return (
		<Container>
			<AppHeader title='MGooS' />
			<MusicPlayer playlist={this.state.playlist} onPlay={this._onPlay}/>
		</Container>
		);
  }

  _onPlay = (index) => {
	this.setState({curIndex: index});
  }

}

