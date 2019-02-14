import React from 'react';
import {
    Animated,
    Easing,
    StyleSheet,
    Dimensions,
    Platform,
  } from 'react-native';
import { Thumbnail, Text, Right, Left, View, Icon, Button } from 'native-base';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { 
	addToPlaylist,
	removeFromPlaylist,
	setIndexPlaylist,
  playerStatusPlaylist,
  playerState 
} from '../redux/actions';
import NativeStorage from '../singleton/NativeStorage';


const window = Dimensions.get('window');

class PlaylistSortableItem extends React.Component {

  constructor(props) {
    super(props);
  
    this._active = new Animated.Value(0);
  
    this._style = {
      ...Platform.select({
        ios: {
          transform: [{
            scale: this._active.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.1],
            }),
          }],
          shadowRadius: this._active.interpolate({
                inputRange: [0, 1],
                outputRange: [2, 10],
          }),
        },

        android: {
          transform: [{
            scale: this._active.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.07],
            }),
          }],
        
          elevation: this._active.interpolate({
            inputRange: [0, 1],
            outputRange: [2, 6],
          }),
        },
      })
    };
  }
  
  componentWillReceiveProps(nextProps) {
    if (this.props.active !== nextProps.active) {
      Animated.timing(this._active, {
        duration: 300,
        easing: Easing.bounce,
        toValue: Number(nextProps.active),
      }).start();
    }
  }

  _renderPlayPauseButton = (bCurrent, eStatus) => {
    //console.log(this.props.idItemPlaying + " - " + this.props.item.id);
    
    if(bCurrent && (eStatus == playerState.Play)) {
      return (
        <Icon name='md-pause'/>
      );
    }
    else {
      return (
        <Icon name='md-play-circle'/>
      );
    }
  }
  
  render() {
    //const {item, bLoaded, active} = this.props;
    const curIndex = this.props.reducer.playlistStore.currentPlayIndex;
    const playlistItem = this.props.reducer.playlistStore.playlist[curIndex];

    const bCurrent = playlistItem ? playlistItem.id == this.props.item.id : false;
    const eStatus  = this.props.reducer.playlistStore.playerStatus;
    
    //console.log("Rendering : ", this.props.item);
    return (
      <Animated.View style={[
        this.props.bLoaded ? styles.rowH : styles.row,
        this._style,
      ]}>
        <Left>
          <Thumbnail source={{uri: this.props.item.coverImage}}/>
        </Left>
        <View style={{flexDirection: 'column', flex: 3, alignItems:'flex-start', justifyContent:'center'}}>
          <Text>{this.props.item.title}</Text>
          <Text note>{this.props.item.album}</Text>
        </View>
        <Right>
          <View style={{flexDirection: "row"}}>
            <Button transparent onPress={this._onPlayFromPlaylist} 
              style={{alignSelf:'center'}}
              disabled={!this.props.bDisablePlay} >
              {this._renderPlayPauseButton(bCurrent, eStatus)}
            </Button>
            <Button transparent onPress={this._onRemoveFromPlaylist} 
              style={{alignSelf:'center'}}
              disabled={!this.props.bDisablePlay} >
              <Icon name='md-close-circle-outline' />
            </Button>
          </View>
        </Right>
      </Animated.View>
    );
  }

  _onPlayFromPlaylist = () => {
    //this.props.onPlay(this.props.item.id);

    //console.log(this.props);

    this.props.setIndexPlaylist(this.props.item.id);
    this.props.playerStatusPlaylist(playerState.Play);
  }

  _onRemoveFromPlaylist = () => {
    const curIndex = this.props.reducer.playlistStore.currentPlayIndex;
    const playlistItem = this.props.reducer.playlistStore.playlist[curIndex];

    const bAdjust = playlistItem ? (playlistItem.id == this.props.item.id) : false

    this.props.removeFromPlaylist(this.props.item.id, null, bAdjust);
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
  title: {
    fontSize: 20,
    paddingVertical: 20,
    color: '#999999',
  },
  list: {
    flex: 1,
  },
  contentContainer: {
    width: window.width,

    ...Platform.select({
    ios: {
        paddingHorizontal: 30,
    },

    android: {
        paddingHorizontal: 0,
    }
    })
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 5,
    /*height: 80,*/
    flex: 1,
    marginTop: 7,
    marginBottom: 8,
    borderRadius: 4,

    ...Platform.select({
      ios: {
        width: window.width - 10 * 2,
        shadowColor: 'rgba(0,0,0,0.2)',
        shadowOpacity: 1,
        shadowOffset: {height: 2, width: 2},
        shadowRadius: 2,
      },
      android: {
        width: window.width - 10 * 2,
        elevation: 0,
        marginHorizontal: 10,
      },
    })
  },
  rowH: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'palegreen',
    padding: 5,
    /*height: 80,*/
    flex: 1,
    marginTop: 7,
    marginBottom: 8,
    borderRadius: 4,

    ...Platform.select({
      ios: {
        width: window.width - 10 * 2,
        shadowColor: 'rgba(0,0,0,0.2)',
        shadowOpacity: 1,
        shadowOffset: {height: 2, width: 2},
        shadowRadius: 2,
      },
      android: {
        width: window.width - 10 * 2,
        elevation: 0,
        marginHorizontal: 10,
      },
    })
  },
  image: {
    width: 50,
    height: 50,
    marginRight: 15,
    borderRadius: 25,
  },
  text: {
    fontSize: 16,
    color: '#222222',
  },
});

const mapStateToProps = (state) => {
  return {reducer: Object.assign({}, state)};
};

const mapDispatchToProps = dispatch => (
  bindActionCreators({
    addToPlaylist,
	  removeFromPlaylist,
	  setIndexPlaylist,
	  playerStatusPlaylist
  }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(PlaylistSortableItem);