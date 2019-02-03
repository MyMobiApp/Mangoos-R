import React from 'react';
import { Dimensions, Image, StyleSheet } from 'react-native';
import { View, Grid, Col, Card, CardItem, Thumbnail, Text, Button, Icon, Left, Right, Body } from 'native-base';
import { Entypo } from '@expo/vector-icons';

export class FeedItem extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      id:             props.id,
      profileHandle:  props.profileHandle,
      profileName:    props.fullName,
      profileImg:     props.profileImg,
      feedMsg:        props.FeedMsg,
      musicURL:       props.musicURL,
      musicCover:     props.musicCover,
      musicTitle:     props.musicTitle,
      musicAlbum:     props.musicAlbum,
      postDateTime:   props.postDateTime,
      likes:          props.like,
    }
  }

  componentWillReceiveProps(newProps) {
    if (this.state.id !== newProps.profileImg) {
      this.setState({profileImg: newProps.profileImg});
    }

    if (this.state.musicURL !== newProps.musicURL) {
      this.setState({musicURL: newProps.musicURL});
    }

    if (this.state.musicCover !== newProps.musicCover) {
      this.setState({musicCover: newProps.musicCover});
    }

    if (this.state.musicTitle !== newProps.musicTitle) {
      this.setState({musicTitle: newProps.musicTitle});
    }

    if (this.state.musicAlbum !== newProps.musicAlbum) {
      this.setState({musicAlbum: newProps.musicAlbum});
    }
  }

  shouldComponentUpdate(nextProps) {
    return (this.state.profileImg !== nextProps.profileImg || 
            this.state.musicURL !== nextProps.musicURL || 
            this.state.musicCover !== newProps.musicCover ||
            this.state.musicTitle !== newProps.musicTitle ||
            this.state.musicAlbum !== newProps.musicAlbum);
  }

  render() {
    return (
      <Card style={styles.card}>
        <CardItem bordered>
          <Left>
            <Thumbnail source={{uri: this.state.profileImg}} />
            <Body>
              <Text>{this.state.profileName}</Text>
              <Text note>{this.state.postDateTime}</Text>
            </Body>
          </Left>
        </CardItem>
        <CardItem bordered>
          <Body>
            <Image source={{uri: this.state.musicCover}} style={{resizeMode: 'contain', height: 200, width: (Dimensions.get('window').width - 50), flex: 1}}/>
            <View style={{marginTop: 5, alignItems: 'center', width:'100%'}}>
              <Text>{this.state.musicTitle}</Text>
              <Text note>{this.state.musicAlbum}</Text>
            </View>
            <View style={{marginTop: 10, alignItems: 'flex-start', width:'100%', borderTopWidth:1, borderColor:'silver'}}>
              <Text style={{margin: 15}}>{this.state.feedMsg}</Text>
            </View>
          </Body>
        </CardItem>
        <CardItem>
          <Grid>
            <Col>
              <Left>

              </Left>
            </Col>
            <Col>
            <Right>
              <Button small transparent textStyle={{color: '#87838B', borderWidth: 1, borderColor: 'silver'}}>
                <Text>Add to Playlist</Text>
                <Entypo name="add-to-list" size={20} color={'#87838B'}/>
              </Button>
            </Right>
            </Col>
          </Grid>
        </CardItem>
      </Card>
    );
  }
}

const styles = StyleSheet.create({
  card: {
    margin: 5,
    flex: 0
  }
});