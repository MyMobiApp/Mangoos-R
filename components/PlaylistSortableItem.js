import React from 'react';
import {
    Image,
    TouchableOpacity,
    Animated,
    Easing,
    StyleSheet,
    Dimensions,
    Platform,
  } from 'react-native';
import { ListItem, Thumbnail, Text, Body, Right, Left, View, Icon, Button, Col, Row } from 'native-base';
import { Grid } from 'react-native-easy-grid';
import { ScrollView } from 'react-native-gesture-handler';

const window = Dimensions.get('window');

export class PlaylistSortableItem extends React.Component {

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
  
  render() {
    const {item, bLoaded, active} = this.props;
    //console.log(item);
    return (
      <Animated.View style={[
        bLoaded ? styles.rowH : styles.row,
        this._style,
      ]}>
        <Left>
          <Thumbnail source={{uri: item.coverImage}}/>
        </Left>
        <View style={{flexDirection: 'column', flex: 3, alignItems:'flex-start', justifyContent:'center'}}>
          <Text>{item.title}</Text>
          <Text note>{item.album}</Text>
        </View>
        <Right>
          <View style={{flexDirection: "row"}}>
            <Button transparent onPress={this._onPlayFromPlaylist} style={{alignSelf:'center'}}>
              <Icon name='md-play-circle'/>
            </Button>
            <Button transparent onPress={this._onRemoveFromPlaylist} style={{alignSelf:'center'}}>
              <Icon name='md-close-circle-outline'/>
            </Button>
          </View>
        </Right>
      </Animated.View>
    );
  }

  _onPlayFromPlaylist = () => {
    alert("_onPlayFromPlaylist");
  }

  _onRemoveFromPlaylist = () => {
      alert("_onRemoveFromPlaylist");
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
    backgroundColor: 'silver',
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