import React from 'react';
import { StyleSheet } from 'react-native';
import { Grid, Col, Card, CardItem, Thumbnail, Text, Button, Icon, Left, Right, Body } from 'native-base';
import { Entypo } from '@expo/vector-icons';

export class FeedItem extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
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
        <CardItem>
          <Left>
            <Body>
              <Text>{this.state.musicTitle}</Text>
              <Text note>{this.state.musicAlbum}</Text>
            </Body>
          </Left>
          <Right>
            <Thumbnail source={{uri: this.state.musicCover}} />
          </Right>
        </CardItem>
        <CardItem bordered>
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