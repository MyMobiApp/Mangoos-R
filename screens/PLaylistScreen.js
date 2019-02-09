import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { Container, View } from 'native-base';

import { MusicPlayer, PlaylistItem } from '../components/MusicPlayer';
import { AppHeader, TabID } from '../components/AppHeader';
import { PlaylistSortableItem } from '../components/PlaylistSortableItem'

import SortableList from 'react-native-sortable-list';
import DataService from '../singleton/Data';
import { ScrollView } from 'react-native-gesture-handler';
import NativeStorage from '../singleton/NativeStorage';

export default class PlaylistScreen extends React.Component {
  static navigationOptions = {
    header: null,
	};
	
	nextOrder = null;
	
  constructor(props) {
    super(props);

		this.bMoving = false;

    this.state = {
      playlist: Array(),
			curIndex: 0,
			bPlayCurrent: false,
			idItemPlaying: null,
			bottomMargin: 0
		}
	}
	
	async componentWillMount() {
		const plItems = DataService.getPlaylistItem();
		let nsPlaylist = Array();

		// Fetch playlist items from native storage
		try{
			const plist = await NativeStorage.getPlaylist();
			nsPlaylist = JSON.parse(plist);

			nsPlaylist = (nsPlaylist && nsPlaylist.length > 0) ? nsPlaylist.concat(plItems) : plItems;
		}
		catch(error) {
			nsPlaylist.concat(plItems);

			console.log("Error fetching playlist from native storage: " + error);
		}

		this.state.playlist = nsPlaylist;

		this._persistList();
	}

	_persistList = () => {
		if(this.state.playlist.length > 0) {
			NativeStorage.persistPlaylist(this.state.playlist);
		}
	}

	componentDidMount() {
		DataService.playlistObservable.subscribe(item => {
			//console.log(item);
			this._onAddItemToPlaylist(item);
		});
	}

	_renderRow = ({key, index, data, active}) => {
		//console.log(data);
		//console.log("Index: " + index + " - Key: " + key + " - curIndex: " + this.state.curIndex);

		let bLoaded = (index == this.state.curIndex && !this.bMoving) ? true : false;
		if(data && !this.bMoving) {
			return (
				<PlaylistSortableItem bLoaded={bLoaded} item={data} active={active} 
					idItemPlaying={this.state.idItemPlaying}
					onRemove={this._onRemove}
					onPlay={this._onPlayPlaylist}
					bPlayCurrent={this.state.bPlayCurrent} />
			);
		}
		else {
			return (
				<View />
			);
		}
	}
	
  render() {
		
		return (
			<Container>
				<AppHeader id={TabID.PLAYLIST} title='MGooS' />
				<SortableList
					style={{flex: 1, marginBottom: this.state.bottomMargin}}
					showsVerticalScrollIndicator={true}
					contentContainerStyle={styles.contentContainer}
					data={this.state.playlist}
					renderRow={this._renderRow} 
					onChangeOrder={this._onChangeOrder} 
					onReleaseRow={this._onReleaseRow}
					onActivateRow={this._onActivateRow} />
				<MusicPlayer curIndex={this.state.curIndex} 
					playlist={this.state.playlist} 
					onPlay={this._onPlayPlayer} 
					onPause={this._onPausePlayer}
					bPlayCurrent={this.state.bPlayCurrent}
					onLayout={this._onMusicPlayerLayout} />
			</Container>
			);
	}

	_onMusicPlayerLayout = (layout) => {
		//console.log(layout);
		
		this.setState({bottomMargin: (layout.height + 10)});
	}

	_onAddItemToPlaylist = (plItem) => {
		this.setState({playlist: [...this.state.playlist, plItem]}, () => {
			this._persistList();
		});
	}
	
	_onPlayPlaylist = (id) => {
		let index = this.state.playlist.findIndex( o => o.id === id);
		let pc = (this.state.curIndex == index) ? !this.state.bPlayCurrent : true;
		
		this.setState({curIndex: index, bPlayCurrent: pc, idItemPlaying: id});
	}

  _onPlayPlayer = (index) => {
		this.setState({curIndex: index, bPlayCurrent: true, idItemPlaying: this.state.playlist[index].id});
	}

	_onPausePlayer = (index) => {
		this.setState({bPlayCurrent: false});
	}

	_onRemove = (id) => {
		let pl = this.state.playlist;
		let index = pl.findIndex( o => o.id === id);

		pl.splice(index, 1);

		console.log(pl);

		this.setState({playlist: pl}, this._persistList);
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
		flex: 1
	},
});

/*const PLAYLIST = [
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
];*/