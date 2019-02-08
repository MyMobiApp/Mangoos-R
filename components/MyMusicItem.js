import React from 'react';
import { TouchableOpacity } from 'react-native';
import { ListItem, View, Right, Text, Left, Thumbnail, Body, Button } from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
import Dialog from "react-native-dialog";

import showPopupMenu from 'react-native-popup-menu-android';


export class MyMusicItem extends React.Component {

  settingsButton = null;
  refSettingsButton = el => this.settingsButton = el;

  constructor(props) {
    super(props);
    
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
              <Dialog.Input value={this.props.item.title}/>
              <Dialog.Input value={this.props.item.album}/>
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

  _handleDialogCancel = () => {
    this.setState({bDialogVisible: false});
  }

  _handleDialogSubmit = () => {
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
        alert("Delete Pressed");
    }
    //alert('Pressed: ' + item.label);
  }
}
