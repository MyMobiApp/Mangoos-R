import React from 'react';
import { StyleSheet, ProgressBarAndroid } from 'react-native';
import { Col, Row, Grid } from 'react-native-easy-grid';
import { Textarea, View, Card, CardItem, Text, Body, Button, Icon, Badge, Left, Right } from 'native-base';
import FirebaseDBService from '../singleton/FirestoreDB';

export class UploadProgress extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
        progress: this.props.progress,
        fileName: this.props.fileName
    }
  }

  componentWillReceiveProps(newProps) {
    console.log(newProps.progress);
    if (this.state.progress !== newProps.progress) {
      this.setState({progress: newProps.progress});
    }

    if (this.state.fileName !== newProps.fileName) {
      this.setState({fileName: newProps.fileName});
    }
  }

  shouldComponentUpdate(nextProps) {
    return this.state.progress !== nextProps.progress || this.state.fileName !== nextProps.fileName;
  }

  _renderUploadFileName = (maxLength) => {
    let renderName = ((`${this.state.fileName}`).length > maxLength) ? 
    (((`${this.state.fileName}`).substring(0,maxLength-3)) + '...') : 
    `${this.state.fileName}`;

    return renderName;
  }

  render() {
    return (
      <View style={styles.container}>
        <Card>
          <CardItem header bordered>
            <Text>Uploading </Text>
            <Text style={styles.fileName}>{ this._renderUploadFileName(25)}</Text>
          </CardItem>
          <CardItem>
            <Body>
              <View style={styles.progressBar}>
                <View style={styles.width85}>
                  <ProgressBarAndroid 
                    styleAttr="Horizontal"
                    indeterminate={false}
                    progress={this.state.progress}
                    style={styles.progressBar}
                  />
                </View>
                <View style={styles.progressBadge}>
                  <Badge success>
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
    this.props.onIgnore();
  }

  _handlePostFeed = (event) => {
    //FirebaseDBService.saveItemToPublicFeed();
  }
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    /*justifyContent: 'space-evenly',*/
    padding: 10,
  },
  width100: {
    width: '100%',
  },
  width85: {
    width: '85%',
  },
  height90: {
    height: '90%',
  },
  progressBadge: {
    paddingLeft: 5, 
    top: -5,
    height: '90%',
  },
  fileName: {
    color: '#ff0000'
  },
  progressBar: {
    /*flex: 1,*/
    flexDirection: 'row'
  },
  progressText: {
    fontSize: 12,
  }
});