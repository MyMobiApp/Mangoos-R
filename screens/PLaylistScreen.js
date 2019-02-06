import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { Container, View } from 'native-base';

import { MusicPlayer, PlaylistItem } from '../components/MusicPlayer';
import { AppHeader, TabID } from '../components/AppHeader';
import { PlaylistSortableItem } from '../components/PlaylistSortableItem'

import SortableList from 'react-native-sortable-list';

const PLAYLIST = [
	new PlaylistItem(
		'1',
    	'Comfort Fit - “Sorry”',
    	'Default',
		'https://s3.amazonaws.com/exp-us-standard/audio/playlist-example/Comfort_Fit_-_03_-_Sorry.mp3',
		'https://pngimage.net/wp-content/uploads/2018/06/main-menu-png-5.png'
	),
	new PlaylistItem(
		'2',
    	'Mildred Bailey – “All Of Me”',
    	'Default',
		'https://ia800304.us.archive.org/34/items/PaulWhitemanwithMildredBailey/PaulWhitemanwithMildredBailey-AllofMe.mp3',
		'https://pngimage.net/wp-content/uploads/2018/06/main-menu-png-5.png'
	),
	new PlaylistItem(
		'3',
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
	
	nextOrder = null;

  constructor(props) {
    super(props);

		this.bMoving = false;

    this.state = {
      playlist: PLAYLIST,
      curIndex: 0
    }
  }

	_renderRow = ({key, index, data, active}) => {
		//console.log(this.state.playlist);
		console.log("Index: " + index + " - Key: " + key + " - curIndex: " + this.state.curIndex);

		let bLoaded = (index == this.state.curIndex && !this.bMoving) ? true : false;
		
    return (
			<PlaylistSortableItem bLoaded={bLoaded} item={data} active={active} />
		);
	}
	
  render() {
		return (
			<Container>
				<AppHeader id={TabID.PLAYLIST} title='MGooS' />
				<SortableList
						style={styles.list}
						contentContainerStyle={styles.contentContainer}
						data={this.state.playlist}
						renderRow={this._renderRow} 
						onChangeOrder={this._onChangeOrder} 
						onReleaseRow={this._onReleaseRow}
						onActivateRow={this._onActivateRow} />
				<MusicPlayer curIndex={this.state.curIndex} playlist={this.state.playlist} onPlay={this._onPlay}/>
			</Container>
			);
  }

  _onPlay = (index) => {
		this.setState({curIndex: index});
	}

	_onActivateRow = (key) => {
		this.bMoving = true;
	}
	
	_onReleaseRow = (key) => {
		let ary = Array();
		let newCurIndex = 0;
		
		if(this.nextOrder) {
			this.nextOrder.forEach((e, i, a) => {
				ary.push(this.state.playlist[e]);
				if(e == this.state.curIndex) {
					newCurIndex = i;
				}
			});
			console.log(ary);
			this.bMoving = false;
			this.setState({curIndex: newCurIndex, playlist: ary});
		}
	}
  
	_onChangeOrder = (nextOrder) => {
		console.log(nextOrder);
		this.nextOrder = nextOrder;
	}

	_adjustPlaylist = (from, to) => {
		this.setState(state => {
			let playlist = state.playlist;
			playlist.splice(to, 0, playlist.splice(from, 1)[0]);

			console.log(playlist);

			return {playlist};
		});
	}
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',

    ...Platform.select({
    ios: {
        paddingTop: 20,
    },
    }),
  },
  list: {
    flex: 1,
	},
});
