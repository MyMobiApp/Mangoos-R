import React from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import { AppLoading, Asset, Font, Icon } from 'expo';
import { Provider } from 'react-redux';
import ApplicationStore from './redux/store';

import Login from './navigation/Login';
import FirebaseDBService from './singleton/FirestoreDB';
import './issues/setTimeoutIssue';

import Sentry from 'sentry-expo';
import SentryExpo from 'sentry-expo';
import DataService from './singleton/Data';

// Remove this once Sentry is correctly setup.
//Sentry.enableInExpoDevelopment = true;

// Init function calls
Sentry.config('https://271a4453bd5f462385ba4aa866fb471f@sentry.io/1395405').install();
const store = ApplicationStore.getStore();

export default class App extends React.Component {
  state = {
    isLoadingComplete: false,
    //isConnected: true,
  };

  constructor(props) {
    super(props);

    FirebaseDBService.init();
  }

  componentDidCatch(error, errorInfo) {
    const uid   = DataService.getProfileData().handle;
    const email = DataService.getProfileData().email;

    Sentry.setUserContext({id: uid, username: email});
    Sentry.setExtraContext(errorInfo);
    Sentry.captureException(error);
  }

  render() {
    if (!this.state.isLoadingComplete && !this.props.skipLoadingScreen) {
      return (
        <AppLoading
          startAsync={this._loadResourcesAsync}
          onError={this._handleLoadingError}
          onFinish={this._handleFinishLoading}
        />
      );
    } else {
      return (
        <Provider store={ store } >
          <View style={styles.container}>
            {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
            <Login />
          </View>
        </Provider>
      );
    }
  }

  _loadResourcesAsync = async () => {
    return Promise.all([
      Asset.loadAsync([
        require('./assets/images/robot-dev.png'),
        require('./assets/images/robot-prod.png'),
      ]),
      Font.loadAsync({
        // This is the font that we are using for our tab bar
        ...Icon.Ionicons.font,
        // We include SpaceMono because we use it in HomeScreen.js. Feel free
        // to remove this if you are not using it in your app
        'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf'),
        Roboto: require("native-base/Fonts/Roboto.ttf"),
        Roboto_medium: require("native-base/Fonts/Roboto_medium.ttf")
      }),
    ]);
  };

  _handleLoadingError = error => {
    // In this case, you might want to report the error to your error
    // reporting service, for example Sentry
    console.warn(error);
  };

  _handleFinishLoading = () => {
    this.setState({ isLoadingComplete: true });
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
