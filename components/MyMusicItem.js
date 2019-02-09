import React from 'react';
import { Alert, ToastAndroid, TouchableOpacity } from 'react-native';
import { ListItem, View, Right, Text, Left, Thumbnail, Body, Button } from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
import Dialog from "react-native-dialog";

import showPopupMenu from 'react-native-popup-menu-android';
import FirebaseDBService from '../singleton/FirestoreDB';


export class MyMusicItem extends React.Component {

  settingsButton = null;
  refSettingsButton = el => this.settingsButton = el;

  constructor(props) {
    super(props);
    
    this.albumName = props.item.album;
    this.titleName = props.item.title;

    this.state = {
        bSelected: false,
        bDialogVisible: false
    }
  }

  _onItemPress = (id) => {
    const bState = this.state.bSelected;

    this.setState({bSelected: !bState});
    this.props.onItemPress(id);
  }

  render() {
    return (
        <View>
            <Dialog.Container visible={this.state.bDialogVisible}>
              <Dialog.Title>Edit Music Info</Dialog.Title>
              <Dialog.Input label={'Title'} 
                defaultValue={this.props.item.title}
                onChangeText={this._onTitleChangeText}
                style={{borderWidth:1, borderColor:'silver'}}/>
              <Dialog.Input label={'Album'} 
                defaultValue={this.props.item.album} 
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
                <TouchableOpacity onPress={() => this._onItemPress(this.props.item.id)}>
                    <Text>{this.props.item.title}</Text>
                    <Text note>{this.props.item.album}</Text>
                    <Text style={{color:'blue', fontSize:10}}>{this.props.item.createdAt}</Text>
                </TouchableOpacity>
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
    //this.albumName = text;
  }

  _onTitleChangeText = (text) => {
    //this.titleName = text;
  }

  _handleDialogCancel = () => {
    this.setState({bDialogVisible: false});
  }

  _handleDialogSubmit = () => {
    FirebaseDBService.editMusicMetadata(this.props.item.dbPath, 
        this.albumName, this.titleName).then(() => {
          console.log("Edit successful");

          ToastAndroid.showWithGravity(`${this.titleName} edited successfully!`, 
            ToastAndroid.SHORT, ToastAndroid.CENTER);
        }).catch(error => {
            console.log(error);
        });

    this.setState({bDialogVisible: false});
  }

  _onEditPress = () => {
    showPopupMenu(
        [
            { id:'edit', label:'Quick Edit' },
            { id:'delete', label:'Trash' }
        ],
        this.handleSettingsSelect,
        this.settingsButton
    );
  }

  handleSettingsSelect = (item) => {
    if(item.id === 'edit') {
        this.setState({bDialogVisible: true});
    }
    else if(item.id === 'delete') {
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
                    FirebaseDBService.deleteMusicMetadataAndFile(this.props.item.dbPath)
                        .then(() => {
                            ToastAndroid.showWithGravity(`${this.props.item.title} removed successfully!`, 
                                ToastAndroid.SHORT, ToastAndroid.CENTER);
                        }).catch(error => {
                            ToastAndroid.showWithGravity(error, ToastAndroid.SHORT, ToastAndroid.CENTER);
                        });
                }
              },
            ],
            {cancelable: false},
          );
    }
    //alert('Pressed: ' + item.label);
  }
}
