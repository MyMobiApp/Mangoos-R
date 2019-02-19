import React from 'react';
import { Alert, ToastAndroid, TouchableOpacity } from 'react-native';
import { Spinner, ListItem, View, Right, Text, Left, Thumbnail, Body, Button } from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
import Dialog from "react-native-dialog";
import showPopupMenu from 'react-native-popup-menu-android';

import FirebaseDBService, { FeedItem } from '../singleton/FirestoreDB';
import DataService from '../singleton/Data';


export class MyMusicItem extends React.Component {

  settingsButton = null;
  refSettingsButton = el => this.settingsButton = el;

  constructor(props) {
    super(props);
    
    this.albumName = props.item.album;
    this.titleName = props.item.title;

    this.state = {
        bSelected: false,
        bDialogVisible: false,
        bUpdatingAlbumTitle: false,
        album: props.item.album,
        title: props.item.title
    }
  }

  _onItemPress = (id) => {
    const bState = this.state.bSelected;

    this.setState({bSelected: !bState});
    this.props.onItemPress(id);
  }

  componentWillReceiveProps(newProps) {
    //console.log("Selected: " + newProps.selected );
    if(!newProps.selected) {
      this.setState({bSelected: false});
    }
  }

  _renderMusicInfo = () => {
    var options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
    const dStr  = (new Date(this.props.item.createdAt)).toLocaleDateString("en-US", options);

    if(this.state.bUpdatingAlbumTitle) {
      return (
          <Spinner color='red' />
      );
    }
    else {
      return (
          <TouchableOpacity onPress={() => this._onItemPress(this.props.item.id)}>
              <Text>{this.state.title}</Text>
              <Text note>{this.state.album}</Text>
              <Text style={{color:'blue', fontSize:10, fontWeight:'bold'}}>{dStr}{this.props.bInFeed?' - In public feed':''}</Text>
          </TouchableOpacity>
      );
    }
  }

  render() {
    console.log("Rendering : ", this.props.item.id, this.props.item.title, this.props.bInFeed);
    return (
        <View>
            <Dialog.Container visible={this.state.bDialogVisible}>
              <Dialog.Title>Edit Music Info</Dialog.Title>
              <Dialog.Input label={'Title'} 
                defaultValue={this.state.title}
                onChangeText={this._onTitleChangeText}
                style={{borderWidth:1, borderColor:'silver'}}/>
              <Dialog.Input label={'Album'} 
                defaultValue={this.state.album} 
                onChangeText={this._onAlbumChangeText}
                style={{borderWidth:1, borderColor:'silver'}}/>
              <Dialog.Button label="Cancel" onPress={this._handleDialogCancel}/>
              <Dialog.Button label="Submit" onPress={this._handleDialogSubmit}/>
            </Dialog.Container>
        
            <ListItem 
            avatar 
            style={{justifyContent: 'center', backgroundColor: this.state.bSelected ? 'palegreen' : 'white'}}>
                <Left>
                <TouchableOpacity onPress={() => this._onItemPress(this.props.item.id)}>
                    <Thumbnail source={{uri: this.props.item.coverImage}}/>
                </TouchableOpacity>
                </Left>
                <Body>
                    {this._renderMusicInfo()}
                </Body>
                <Right>
                <View style={{flexDirection: "row"}}>
                    <Button transparent onPress={this._onAddToPlaylist} style={{alignSelf:'center'}}>
                    <MaterialIcons size={24} name='playlist-add' color='blue'/>
                    </Button>
                    <Text>  </Text>
                    <Button transparent onPress={this._onEditPress} style={{alignSelf:'center'}} ref={this.refSettingsButton}>
                    <MaterialIcons size={24} name='settings' color='blue'/>
                    </Button>
                </View>
                </Right>
            </ListItem>
        </View>
    );
  }

  _onAddToPlaylist = () => {
    this.props.onAddToPlaylist(this.props.item);
  }

  _onAlbumChangeText = (text) => {
    this.albumName = text;
  }

  _onTitleChangeText = (text) => {
    this.titleName = text;
  }

  _handleDialogCancel = () => {
    this.setState({bDialogVisible: false});
  }

  _handleDialogSubmit = () => {
    //console.log("Updating with: " + this.albumName + " - " + this.titleName);
    this.setState({bUpdatingAlbumTitle: true});
    FirebaseDBService.editMusicMetadata(this.props.item.dbPath, 
        this.albumName, this.titleName).then(() => {
          this.setState({album: this.albumName, title: this.titleName, bUpdatingAlbumTitle: false});

          ToastAndroid.showWithGravity(`${this.titleName} edited successfully!`, 
            ToastAndroid.SHORT, ToastAndroid.CENTER);
        }).catch(error => {
            console.log(error);
            this.setState({bUpdatingAlbumTitle: false});
        });

    this.setState({bDialogVisible: false});
  }

  _onEditPress = () => {
    const feedLabel = this.props.bInFeed ? 'Remove from Feed' : 'Post to Public Feed';

    showPopupMenu(
        [
            { id:'edit', label:'Quick Edit' },
            { id:'delete', label:'Trash' },
            { id:'feed', label:feedLabel }
        ],
        this.handleSettingsSelect,
        this.settingsButton
    );
  }

  handleSettingsSelect = (item) => {

    switch(item.id) {
      case 'edit': {
        this.setState({bDialogVisible: true});

        break;
      }
      case 'delete': {
        Alert.alert(
          'Delete ...',
          `Are you sure to delete '${this.props.item.title}'?`,
          [
            {
              text: 'No',
              onPress: () => console.log('Cancel Pressed'),
              style: 'cancel',
            },
            {
              text: 'Yes', 
              onPress: () => {
                this.setState({bUpdatingAlbumTitle: true});
                FirebaseDBService.deleteMusicMetadataAndFile(this.props.item.dbPath)
                  .then(() => {
                    ToastAndroid.showWithGravity(`${this.props.item.title} removed successfully!`, 
                      ToastAndroid.SHORT, ToastAndroid.CENTER);

                    this.props.onRemoveItem(this.props.item.id);
                  }).catch(error => {
                      ToastAndroid.showWithGravity(error, ToastAndroid.SHORT, ToastAndroid.CENTER);
                      this.setState({bUpdatingAlbumTitle: false});
                  });
              }
            },
          ],
          {cancelable: false},
        );

        break;
      }
      case 'feed': {
        const handle        = DataService.getProfileData().handle;
        const fullName      = DataService.getProfileData().full_name;
        const postDateTime  = (new Date()).toISOString();
        const postDateObj   = Date.now();
        const dbPath        = this.props.item.dbPath;
        const docID         = this.props.item.id;
        const message       = "";

        if(this.props.bInFeed) {
          FirebaseDBService.deletePublicFeedItem(dbPath).then(() => {
            ToastAndroid.showWithGravity("Item removed from feed.", ToastAndroid.SHORT, ToastAndroid.CENTER);
              this.setState({bUpdatingAlbumTitle: false});
          }).catch(error => {
            console.log(error);
            ToastAndroid.showWithGravity(error, ToastAndroid.SHORT, ToastAndroid.CENTER);
              this.setState({bUpdatingAlbumTitle: false});
          });
        }
        else {
          const feedItem = new FeedItem(handle, fullName, postDateTime, 
            postDateObj, dbPath, docID, message, 0, 1, null, null);
          FirebaseDBService.saveItemToPublicFeed(feedItem.toJSON()).then(() => {
            ToastAndroid.showWithGravity("Item added to Feed!", ToastAndroid.SHORT, ToastAndroid.CENTER);
              this.setState({bUpdatingAlbumTitle: false});
          }).catch(error => {
            ToastAndroid.showWithGravity(error, ToastAndroid.SHORT, ToastAndroid.CENTER);
              this.setState({bUpdatingAlbumTitle: false});
          });
        }

        break;
      }
    }
    
    //alert('Pressed: ' + item.label);
  }
}