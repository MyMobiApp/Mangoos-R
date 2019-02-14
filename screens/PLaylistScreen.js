import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { Container, View, Spinner } from 'native-base';
import SortableList from 'react-native-sortable-list';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { 
	addToPlaylist,
	addManyToPlaylist,
	changePlaylist,
	removeFromPlaylist,
	adjustIndexPlaylist,
	setIndexPlaylist,
	playerStatusPlaylist 
} from '../redux/actions';

import MusicPlayer from '../components/MusicPlayer';
import AppHeader, { TabID } from '../components/AppHeader';
import PlaylistSortableItem from '../components/PlaylistSortableItem'

import DataService from '../singleton/Data';
import NativeStorage from '../singleton/NativeStorage';

class PlaylistScreen extends React.Component {
  static navigationOptions = {
    header: null,
	};
	
	nextOrder = null;
	
  constructor(props) {
    super(props);

		this.bMoving = false;

    this.state = {
			bDisablePlay: false,
      bShowSpinner: true,
			bottomMargin: 0
		}
	}
	
	componentDidMount() {
		let nsPlaylist = Array();

		// Fetch playlist items from native storage
		NativeStorage.getPlaylist().then(plist => {
			nsPlaylist = JSON.parse(plist);
			if(nsPlaylist.length > 0) {
				this.props.addManyToPlaylist(nsPlaylist);
				
				this._persistList();
			}
			this.setState({bShowSpinner: false});
		}).catch(error => {
			this.setState({bShowSpinner: false});
		});
	}

	componentWillReceiveProps(newProps) {
		if(this.props.reducer.playlistStore.playlist.length != newProps.reducer.playlistStore.playlist.length) {
			NativeStorage.persistPlaylist(newProps.reducer.playlistStore.playlist);
		}
	}

	_persistList = () => {
		if(this.props.reducer.playlistStore.playlist.length > 0) {
			NativeStorage.persistPlaylist(this.props.reducer.playlistStore.playlist);
		}
	}

	_renderRow = ({key, index, data, active}) => {
		//console.log(data);
		//console.log("Index: " + index + " - Key: " + key + " - currentPlayIndex: " + this.props.reducer.playlistStore.currentPlayIndex);

		let bLoaded = (index == this.props.reducer.playlistStore.currentPlayIndex && !this.bMoving) ? true : false;
		if(data && !this.bMoving) {
			//console.log("iterating for: ", data);
			return (
				<PlaylistSortableItem 
					bDisablePlay={this.state.bDisablePlay} 
					bLoaded={bLoaded} 
					item={data} 
					active={active} />
			);
		}
		else {
			return (
				<View />
			);
		}
	}

	_renderSortableList = () => {
		if(this.state.bShowSpinner) {
			return(
				<Spinner color='blue' />
			);
		}
		else {
			return(
				<SortableList
					style={{flex: 1, marginBottom: this.state.bottomMargin}}
					showsVerticalScrollIndicator={true}
					contentContainerStyle={styles.contentContainer}
					data={this.props.reducer.playlistStore.playlist}
					renderRow={this._renderRow} 
					onChangeOrder={this._onChangeOrder} 
					onReleaseRow={this._onReleaseRow}
					onActivateRow={this._onActivateRow} />
			);
		}
	}
	
  render() {
		return (
			<Container>
				<AppHeader id={TabID.PLAYLIST} title='MGooS' />
				{this._renderSortableList()}
				<MusicPlayer 
					onChangingTrack={this._onTogglePlaylistPlayButtonVisibility}
					onLayout={this._onMusicPlayerLayout} />
			</Container>
			);
	}

	_onTogglePlaylistPlayButtonVisibility = () => {
		this.setState({bDisablePlay: !this.state.bDisablePlay});
	}

	_onMusicPlayerLayout = (layout) => {
		//console.log(layout);
		
		this.setState({bottomMargin: (layout.height + 10)});
	}

	_onActivateRow = (key) => {
		this.bMoving = true;
	}
	
	_onReleaseRow = async (key) => {
		let ary = Array();
		let newCurIndex = 0;
		
		if(this.nextOrder) {
			await Promise.all(this.nextOrder.map((e, i, a) => {
				ary.push(this.props.reducer.playlistStore.playlist[e]);
				if(e == this.props.reducer.playlistStore.currentPlayIndex) {
					newCurIndex = i;
				}
			}));
			console.log(ary);
			this.bMoving = false;
			this.props.setIndexPlaylist(null, newCurIndex);
			this.props.changePlaylist(ary);
			//this.setState({curIndex: newCurIndex, playlist: ary});
		}
	}
  
	_onChangeOrder = (nextOrder) => {
		console.log(nextOrder);
		this.nextOrder = nextOrder;
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

const mapStateToProps = (state) => {
  return {reducer: Object.assign({}, state)};
};

const mapDispatchToProps = dispatch => (
  bindActionCreators({
		addToPlaylist,
		addManyToPlaylist,
		changePlaylist,
		removeFromPlaylist,
		adjustIndexPlaylist,
		setIndexPlaylist,
		playerStatusPlaylist
  }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(PlaylistScreen);

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