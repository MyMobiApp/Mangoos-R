import React from 'react';
import { Platform } from 'react-native';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';

import TabBarIcon from '../components/TabBarIcon';
import FeedScreen from '../screens/FeedScreen';
import MyMusicScreen from '../screens/MyMusicScreen';
import PlaylistScreen from '../screens/PLaylistScreen';

import * as firebase from 'firebase';
import { environment } from '../environments/environment';

firebase.initializeApp(environment.firebase);

const FeedStack = createStackNavigator({
  Feed: FeedScreen,
});

FeedStack.navigationOptions = {
  tabBarLabel: 'Feed',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={
        Platform.OS === 'ios'
          ? 'ios-globe'
          : 'logo-rss'
      }
    />
  ),
};

const MyMusicStack = createStackNavigator({
  MyMusic: MyMusicScreen,
});

MyMusicStack.navigationOptions = {
  tabBarLabel: 'My Music',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === 'ios' ? 'ios-musical-notes' : 'md-musical-notes'}
    />
  ),
};

const PlaylistStack = createStackNavigator({
  Playlist: PlaylistScreen,
});

PlaylistStack.navigationOptions = {
  tabBarLabel: 'Playlist',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === 'ios' ? 'ios-list' : 'md-list'}
    />
  ),
};

export default createBottomTabNavigator({
  FeedStack,
  MyMusicStack,
  PlaylistStack,
});
