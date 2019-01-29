import React from 'react';
import { StyleSheet, ProgressBarAndroid } from 'react-native';
import { Col, Row, Grid } from 'react-native-easy-grid';
import { Textarea, View, Card, CardItem, Text, Body, Button, Icon, Badge, Left, Right } from 'native-base';

export class UploadProgress extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
        progress: this.props.progress,
        fileName: this.props.fileName
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <Card>
          <CardItem header bordered>
            <Text>Uploading </Text>
            <Text style={styles.fileName}>'{this.state.fileName}'</Text>
          </CardItem>
          <CardItem>
            <Body>
              <View style={styles.progressBar}>
                <View style={styles.width90}>
                  <ProgressBarAndroid 
                    styleAttr="Horizontal"
                    indeterminate={false}
                    progress={this.state.progress}
                    style={styles.progressBar}
                  />
                </View>
                <View style={styles.progressBadge}>
                  <Badge success style={styles.height90}>
                    <Text style={styles.progressText}>
                      {this.state.progress * 100}%
                    </Text>
                  </Badge>
                </View>
              </View>
              <View style={styles.width100}>
                <Textarea rowSpan={5} bordered placeholderTextColor="silver" placeholder="(Let everyone enjoy this music by posting it in public feed)" />
              </View>
            </Body>
          </CardItem>
          <CardItem footer bordered>
            <Left>
              <Button small rounded onPress={this._handlePostIgnore}>
                <Text>Ignore</Text>
                <Icon name='md-remove-circle-outline' />
              </Button>
            </Left>
            <Right>
              <Button small rounded onPress={this._handlePostFeed}>
                <Text>Post</Text>
                <Icon name='md-paper-plane' />
              </Button>
            </Right>
          </CardItem>
        </Card>
      </View>
    );
  }

  _handlePostIgnore = (event) => {

  }

  _handlePostFeed = (event) => {

  }
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-evenly',
    padding: 10,
  },
  width100: {
    width: '100%',
  },
  width90: {
    width: '90%',
  },
  height90: {
    height: '90%',
  },
  progressBadge: {
    paddingLeft: 5, 
    top: -4
  },
  fileName: {
    color: '#ff0000'
  },
  progressBar: {
    flex: 1, 
    flexDirection: 'row'
  },
  progressText: {
    fontSize: 12, 
    top:-2
  }
});