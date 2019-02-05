import React from 'react';
import { TouchableOpacity } from 'react-native';
import { ListItem, View, Right, Text, Left, Thumbnail, Body, Button } from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';


export class MyMusicItem extends React.Component {

  constructor(props) {
    super(props);
    
    this.state = {
        bSelected: false
    }
  }

  _onItemPress = (id) => {
    const bState = this.state.bSelected;

    this.setState({bSelected: !bState});
    this.props.onItemPress(id);
  }

  render() {
    return (
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
            <Button transparent onPress={this._onEditPress} style={{alignSelf:'center'}}>
              <MaterialIcons size={24} name='edit' color='blue'/>
            </Button>
          </View>
        </Right>
      </ListItem>
    );
  }
}
