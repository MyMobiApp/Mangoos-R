import React from 'react';
import {
	Dimensions,
	Image,
	StyleSheet,
	Text,
	TouchableHighlight,
	View,
} from 'react-native';
import Slider from 'react-native-slider';
import { Audio, Font, KeepAwake  } from 'expo';
import { MaterialIcons } from '@expo/vector-icons';
import { Grid, Col } from 'native-base';

export class PlaylistItem {
	constructor(id, title, album, uri, coverImage, duration, createdAt) {
        this.id             = id;
        this.title          = title;
        this.album          = album;
		this.uri            = uri;
        this.coverImage     = coverImage;
        this.duration       = duration;
        this.createdAt      = createdAt;
    }
    
    toJSON() {
        return {
            id: this.id,
            title: this.title,
            album: this.album,
            uri: this.uri,
            coverImage: this.coverImage,
            duration: this.duration,
            createdAt: this.createdAt
        }
    }
}

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get('window');
const BACKGROUND_COLOR = 'white';
const TRACKER_COLOR = 'red';
const THUMB_RADIUS  = 5;
const BUTTON_COLOR  = '#31a4db';
const DISABLED_OPACITY = 0.5;
const FONT_SIZE = 14;
const LOADING_STRING = 'Loading music info...';
const BUFFERING_STRING = 'Buffering...';
const RATE_SCALE = 3.0;
const thumbTouchSize = {width:40, height: 40};

export class MusicPlayer extends React.Component {

  constructor(props) {
    super(props);

    this.index = 0;
    this.playID = null;
    this.isSeeking = false;
    this.shouldPlayAtEndOfSeek = false;
    this.playbackInstance = null;

    this.state = {
        playbackInstanceName: LOADING_STRING,
        playbackInstancePosition: null,
        playbackInstanceDuration: null,
        shouldPlay: false,
        isPlaying: false,
        isBuffering: false,
        isLoading: true,
        fontLoaded: false,
        volume: 1.0,
        rate: 1.0,
        portrait: null,
    };
  }

  async componentWillReceiveProps(newProps) {
    //console.log(this.playID + " - " + newProps.bPlayCurrent);
    if(this.index != newProps.curIndex) {
        this.index = newProps.curIndex;

        console.log(this.playID + " - " + newProps.playlist[this.index].id);
        if(this.playID != newProps.playlist[this.index].id ) {
            this._updatePlaybackInstanceForIndex(true);
        }
    }
    else if(this.props.bPlayCurrent != newProps.bPlayCurrent) {
        this._onPlayPausePressed();
    }

    let index = newProps.playlist.findIndex( o => o.id === this.playID);

    if(index < 0 && this.playbackInstance != null) {
        this._advanceIndex(true, newProps);
        this._updateScreenForLoading(true, "Checking next item in playlist...");

        this._loadNewPlaybackInstance(false);
    }

    console.log(this.props.playlist.length + " - " + newProps.playlist.length);
    if(this.props.playlist.length == 0 && newProps.playlist.length > 0) {
        this.index = newProps.curIndex;
        
        this._updateScreenForLoading(true, "Checking next item in playlist...");

        this._loadNewPlaybackInstance(false, null, newProps);
    }
  }

  componentDidMount() {
    Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_MIX_WITH_OTHERS,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        playThroughEarpieceAndroid: false      
    });
    (async () => {
        await Font.loadAsync({
            roboto: require('../assets/fonts/Roboto.ttf'),
        });
        this.setState({ fontLoaded: true });
    })();

    this._loadNewPlaybackInstance(false);
}

async _loadNewPlaybackInstance(playing, playIndex = null, newProps = null) {
    //console.log("playIndex: " + playIndex + " - Index: " + this.index);
    
    playIndex = playIndex ? playIndex : this.index;
    props = newProps ? newProps : this.props;
    
    if (this.playbackInstance != null) {
        await this.playbackInstance.unloadAsync();
        this.playbackInstance.setOnPlaybackStatusUpdate(null);
        this.playbackInstance = null;
    }

    if(props.playlist.length > 0) {
        this.playID = props.playlist[playIndex].id;

        const source = { uri: props.playlist[playIndex].uri };
        const initialStatus = {
            shouldPlay: playing,
            rate: this.state.rate,
            volume: this.state.volume,
        };

        const { sound, status } = await Audio.Sound.createAsync(
            source,
            initialStatus,
            this._onPlaybackStatusUpdate
        );
        this.playbackInstance = sound;

        this._updateScreenForLoading(false);
    }
    else {
        this._updateScreenForLoading(true, "Playlist is empty...");
    }
}

_updateScreenForLoading(isLoading, instanceName = null) {
    instanceName = instanceName ? instanceName : LOADING_STRING ;

    if (isLoading) {
        this.setState({
            isPlaying: false,
            playbackInstanceName: instanceName,
            playbackInstanceDuration: null,
            playbackInstancePosition: null,
            isLoading: true,
        });
    } else {
        this.setState({
            playbackInstanceName: this.props.playlist[this.index].title,
            portrait: this.props.playlist[this.index].image,
            isLoading: false,
        });
    }
}

_onPlaybackStatusUpdate = status => {
    if (status.isLoaded) {
        this.setState({
            playbackInstancePosition: status.positionMillis,
            playbackInstanceDuration: status.durationMillis,
            shouldPlay: status.shouldPlay,
            isPlaying: status.isPlaying,
            isBuffering: status.isBuffering,
            rate: status.rate,
            volume: status.volume,
        });
        if (status.didJustFinish) {
            this._advanceIndex(true);
            this._updatePlaybackInstanceForIndex(true);
        }
    } else {
        if (status.error) {
            console.log(`FATAL PLAYER ERROR: ${status.error}`);
        }
    }
};

_advanceIndex(forward, newProps = null) {
    const props = newProps ? newProps : this.props;

    this.index =
        (this.index + (forward ? 1 : props.playlist.length - 1)) %
        props.playlist.length;

    if(newProps == null) {
        this.props.onPlay(this.index);
    }
}

async _updatePlaybackInstanceForIndex(playing) {
    this._updateScreenForLoading(true);

    this._loadNewPlaybackInstance(playing);
}

_onPlayPausePressed = () => {
    if (this.playbackInstance != null) {
        if (this.state.isPlaying) {
            this.playbackInstance.pauseAsync();
            
            this.props.onPause(this.index);
            KeepAwake.deactivate();
        } else {
            this.playbackInstance.playAsync();

            this.props.onPlay(this.index);
            KeepAwake.activate();
        }
    }
};

_onStopPressed = () => {
    if (this.playbackInstance != null) {
        this.playbackInstance.stopAsync();

        this.props.onPause(this.index);
        KeepAwake.deactivate();
    }
};

_onForwardPressed = () => {
    if (this.playbackInstance != null) {
        this._advanceIndex(true);
        this._updatePlaybackInstanceForIndex(this.state.shouldPlay);
    }
};

_onBackPressed = () => {
    if (this.playbackInstance != null) {
        this._advanceIndex(false);
        this._updatePlaybackInstanceForIndex(this.state.shouldPlay);
    }
};

_onVolumeSliderValueChange = value => {
    if (this.playbackInstance != null) {
        this.playbackInstance.setVolumeAsync(value);
    }
};

_trySetRate = async rate => {
    if (this.playbackInstance != null) {
        try {
            await this.playbackInstance.setRateAsync(rate);
        } catch (error) {
            // Rate changing could not be performed, possibly because the client's Android API is too old.
        }
    }
};

_onRateSliderSlidingComplete = async value => {
    this._trySetRate(value * RATE_SCALE);
};

_onSeekSliderValueChange = value => {
    if (this.playbackInstance != null && !this.isSeeking) {
        this.isSeeking = true;
        this.shouldPlayAtEndOfSeek = this.state.shouldPlay;
        this.playbackInstance.pauseAsync();
    }
};

_onSeekSliderSlidingComplete = async value => {
    if (this.playbackInstance != null) {
        this.isSeeking = false;
        const seekPosition = value * this.state.playbackInstanceDuration;
        if (this.shouldPlayAtEndOfSeek) {
            this.playbackInstance.playFromPositionAsync(seekPosition);
        } else {
            this.playbackInstance.setPositionAsync(seekPosition);
        }
    }
};

_getSeekSliderPosition() {
    if (
        this.playbackInstance != null &&
        this.state.playbackInstancePosition != null &&
        this.state.playbackInstanceDuration != null
    ) {
        return (
            this.state.playbackInstancePosition /
            this.state.playbackInstanceDuration
        );
    }
    return 0;
}

_getMMSSFromMillis(millis) {
    const totalSeconds = millis / 1000;
    const seconds = Math.floor(totalSeconds % 60);
    const minutes = Math.floor(totalSeconds / 60);

    const padWithZero = number => {
        const string = number.toString();
        if (number < 10) {
            return '0' + string;
        }
        return string;
    };
    return padWithZero(minutes) + ':' + padWithZero(seconds);
}

_getTimestamp() {
    if (
        this.playbackInstance != null &&
        this.state.playbackInstancePosition != null &&
        this.state.playbackInstanceDuration != null
    ) {
        return `${this._getMMSSFromMillis(
            this.state.playbackInstancePosition
        )} / ${this._getMMSSFromMillis(
            this.state.playbackInstanceDuration
        )}`;
    }
    return '';
}

_renderCoverImage = () => {
    if(this.props.playlist.length && this.props.playlist[this.index]) {
        return (
            <Image
                style={{width: 50, height: 50}}
                source={{uri: this.props.playlist[this.index].coverImage }}
            />
        );
    }
    else {
        return (
            <View />
        );
    }
}

  render() {
    return !this.state.fontLoaded ? (
        <View />
        ) : (	
        <View style={styles.container} onLayout={(event) => {
            var {x,y,width,height} = event.nativeEvent.layout;
            this.props.onLayout({x,y,width,height});
          }}>
            <Grid>
                <Col style={styles.coverImgContainer}>
                    {this._renderCoverImage()}
                </Col>
                <Col>
                <View style={styles.detailsContainer}>
                    <Text style={[styles.text, { fontFamily: 'roboto' }]}>
                        {this.state.playbackInstanceName}
                    </Text>
                    <Text style={[styles.text, { fontFamily: 'roboto' }]}>
                        {this.state.isBuffering ? (
                            BUFFERING_STRING
                        ) : (
                            this._getTimestamp()
                        )}
                    </Text>
                </View>
                </Col>
            </Grid>
            <View
                style={[
                    styles.buttonsContainerBase,
                    styles.buttonsContainerTopRow,
                    {
                        opacity: this.state.isLoading
                            ? DISABLED_OPACITY
                            : 1.0,
                    },
                ]}
            >
                <TouchableHighlight
                    underlayColor={BACKGROUND_COLOR}
                    style={styles.wrapper}
                    onPress={this._onBackPressed}
                    disabled={this.state.isLoading}
                >
                    <View>
                        <MaterialIcons
                            name="fast-rewind"
                            size={40}
                            color={BUTTON_COLOR}
                        />
                    </View>
                </TouchableHighlight>
                <TouchableHighlight
                    underlayColor={BACKGROUND_COLOR}
                    style={styles.wrapper}
                    onPress={this._onPlayPausePressed}
                    disabled={this.state.isLoading}
                >
                    <View>
                        {this.state.isPlaying ? (
                            <MaterialIcons
                                name="pause"
                                size={40}
                                color={BUTTON_COLOR}
                            />
                        ) : (
                            <MaterialIcons
                                name="play-arrow"
                                size={40}
                                color={BUTTON_COLOR}
                            />
                        )}
                    </View>
                </TouchableHighlight>
                <TouchableHighlight
                    underlayColor={BACKGROUND_COLOR}
                    style={styles.wrapper}
                    onPress={this._onStopPressed}
                    disabled={this.state.isLoading}
                >
                    <View>
                        <MaterialIcons
                            name="stop"
                            size={40}
                            color={BUTTON_COLOR}
                        />
                    </View>
                </TouchableHighlight>
                <TouchableHighlight
                    underlayColor={BACKGROUND_COLOR}
                    style={styles.wrapper}
                    onPress={this._onForwardPressed}
                    disabled={this.state.isLoading}
                >
                    <View>
                        <MaterialIcons
                            name="fast-forward"
                            size={40}
                            color={BUTTON_COLOR}
                        />
                    </View>
                </TouchableHighlight>
            </View>
            <View
                style={[
                    styles.playbackContainer,
                    {
                        opacity: this.state.isLoading
                            ? DISABLED_OPACITY
                            : 1.0,
                    },
                ]}
            >
                <Slider
                    style={styles.playbackContainer}
                    value={this._getSeekSliderPosition()}
                    onValueChange={this._onSeekSliderValueChange}
                    onSlidingComplete={this._onSeekSliderSlidingComplete}
                    disabled={this.state.isLoading}
                    trackStyle={styles.track}
                    thumbStyle={styles.thumb}
                    minimumTrackTintColor={TRACKER_COLOR}
                    thumbTouchSize={thumbTouchSize}
                />
            </View>
        </View>
    );
  }
}

const styles = StyleSheet.create({
	container: {
        flex: 1,
        flexDirection: 'column',
        width: DEVICE_WIDTH - 10,
		justifyContent: 'space-between',
		alignItems: 'center',
		alignSelf: 'stretch',
        backgroundColor: BACKGROUND_COLOR,
        position: 'absolute',
        bottom:0,
        borderWidth: 1,
        borderRadius: 2,
        borderColor: '#ddd',
        borderBottomWidth: 0,
        shadowColor: '#848484',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
        marginLeft: 5,
        marginRight: 10,
        marginBottom: 8,
	},
	portraitContainer: {
		marginTop: 80,
	},
	portrait: {
		height: 200,
		width: 200,
	},
	detailsContainer: {
		height: 40,
		marginTop: 25,
		alignItems: 'flex-start',
    },
    coverImgContainer: {
        width: 90,
		marginTop: 20,
		alignItems: 'center',
	},
	playbackContainer: {
		flex: 1,
		flexDirection: 'column',
		justifyContent: 'space-between',
		alignItems: 'center',
        alignSelf: 'stretch',
        marginLeft:10,
        top: 10,
	},
	playbackSlider: {
        height: 30,
	},
	text: {
		fontSize: FONT_SIZE,
		minHeight: FONT_SIZE,
	},
	buttonsContainerBase: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	buttonsContainerTopRow: {
		maxHeight: 40,
		minWidth: DEVICE_WIDTH / 2.0,
		maxWidth: DEVICE_WIDTH / 2.0,
	},
	buttonsContainerMiddleRow: {
		maxHeight: 40,
		alignSelf: 'stretch',
		paddingRight: 20,
	},
	volumeContainer: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		minWidth: DEVICE_WIDTH - 40,
		maxWidth: DEVICE_WIDTH - 40,
	},
	volumeSlider: {
		width: DEVICE_WIDTH - 80,
	},
	buttonsContainerBottomRow: {
		alignSelf: 'stretch',
	},
	rateSlider: {
		width: DEVICE_WIDTH - 80,
    },
    track: {
        alignSelf: 'stretch',
        height: 2,
        backgroundColor: '#ddd',
        marginLeft: 10,
        marginRight: 10,
    },
    thumb: {
        alignSelf: 'flex-start',
        top: -4,
        width: THUMB_RADIUS * 2,
        height: THUMB_RADIUS * 2,
        backgroundColor: '#31a4db',
        borderRadius: THUMB_RADIUS,
        shadowColor: '#31a4db',
        shadowOffset: {width: 0, height: 0},
        shadowRadius: 2,
        shadowOpacity: 0.6,
    }
});