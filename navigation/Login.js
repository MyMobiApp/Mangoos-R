import React from 'react';
import { Image, StyleSheet, View, Text, Platform, ToastAndroid } from 'react-native';
import { Button, Spinner, Icon } from 'native-base';
import { AuthSession, Facebook, Google } from 'expo';
import AppNavigator from './AppNavigator';

import DataService from '../singleton/Data';
import FirebaseDBService from '../singleton/FirestoreDB';
import NativeStorage from '../singleton/NativeStorage';

const firebase = require('firebase');
// Required for side-effects
require('firebase/firestore');

const FB_APP_ID = '2436819223026748';
const GOOGLE_OAUTH_CLIENT_ID = '949519506589-kdnau097d9io12qncqt9ov85k9vrh97t.apps.googleusercontent.com';
const GOOGLE_OAUTH_ANDROID_CLIENT_ID = '949519506589-48gqqimsbjutnklja0lonhpd2510p56v.apps.googleusercontent.com';
const GOOGLE_OAUTH_EXPO_CLIENT_ID = '949519506589-gokc4p0cqqemp69i0pvb6bicnal1be4e.apps.googleusercontent.com';

const loginMethod = {
  Facebook: 'facebook',
  Google: 'google'
}

export default class LoginScreen extends React.Component {
  static navigationOptions = {
    title: 'Login',
  };

  constructor(props) {
    super(props);

    this.state = {
      loggedIn: false,
      authenticatingFirebase: true,
      userInfo: null,
      authenticationGFB: false
    }
  }

  render() {
    //firebase.auth().signOut();
    if(this.state.loggedIn) {
      return (
        <View style={styles.container}>
          {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
          <AppNavigator />
        </View>
      );
    }
    else {
      if(this.state.authenticatingFirebase) {
        return this._authFromFirebase();
      }
      else if(this.state.authenticationGFB) {
        return (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Spinner color='gray'/>
          </View>
        );
      }
      else {
        return (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <Image source={require('../assets/images/mgoos_logo_ori.gif')} 
              style={{width:162, height:50, marginBottom:50, top:-20}} />
            <Button primary block onPress={this._handleFaceBookLoginAsync} style={{margin:10}}> 
              <Text style={{color:'white'}}>Login with Facebook</Text>
              <Icon name='logo-facebook'></Icon>
            </Button>
            <Button primary block onPress={this._handleGoogleLoginAsync} style={{margin:10}}> 
              <Text style={{color:'white'}}>Login with Google</Text>
              <Icon name='logo-google'></Icon>
            </Button>
          </View>
        );
      }
    }
  }

  _authFromFirebase = () => {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        console.log("User Info:")
        console.log(user);

        FirebaseDBService.getUserProfile(user.email).then(data => {
          if(data.method === loginMethod.Facebook) {
            data.picture_url = user.photoURL+'?height=200';
          }
          
          DataService.saveProfileData(data);
          this.setState({ loggedIn: true, authenticatingFirebase: false, userInfo: data });
        }).catch(error => {
          console.log("_authFromFirebase", error);
          this.setState({ loggedIn: true, authenticatingFirebase: false, userInfo: null });
        });
        // User is signed in.
      }
      else {
        this.setState({ loggedIn: false, authenticatingFirebase: false, userInfo: null });
      }
    }, error => {
      console.log("onAuthStateChanged Error : ", error);
      this.setState({ loggedIn: false, authenticatingFirebase: false, userInfo: null });
    });

    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Spinner />
      </View>
    );
  };

  _renderUserInfo = () => {
    return (
      <View style={{ alignItems: 'center' }}>
        <Image
          source={{ uri: this.state.userInfo.picture.data.url }}
          style={{ width: 100, height: 100, borderRadius: 50 }}
        />
        <Text style={{ fontSize: 20 }}>{this.state.userInfo.name}</Text>
        <Text>ID: {this.state.userInfo.id}</Text>
      </View>
    );
  };

  _handleGoogleLoginAsync = async () => {
    this.setState({authenticationGFB: true});

    try {
      const result = await Google.logInAsync({
        androidClientId: GOOGLE_OAUTH_EXPO_CLIENT_ID,
        //androidClientId: GOOGLE_OAUTH_ANDROID_CLIENT_ID,
        scopes: ["profile", "email"]
      });
      console.log(result);
      if (result.type === "success") {
        var userData = {
          handle: result.user.email.split('@').join('.'),
          email: result.user.email, 
          first_name: result.user.familyName, 
          last_name: result.user.givenName,
          picture_url: result.user.photoUrl, 
          full_name: result.user.name,
          method: loginMethod.Google
        };
        const googleCredential = firebase.auth.GoogleAuthProvider
        .credential(result.idToken, result.accessToken);
    
        try {
          await firebase.auth().signInAndRetrieveDataWithCredential(googleCredential);
        }
        catch(error) {
          console.log("Firebase failed google login: "); 
          console.log(error)
        }

        await DataService.saveProfileData(userData);
        console.log('Logged into Google!', userData);
        this.setState({ loggedIn: true, authenticationGFB: false, authenticatingFirebase: false, userInfo: userData });

      } else {
        console.log("cancelled");
      }
    } catch (e) {
      console.log("error", e);
    }
  }

  _handleFaceBookLoginAsync = async () => {
    this.setState({authenticationGFB: true});

    let redirectUrl = AuthSession.getRedirectUrl();
    //alert(redirectUrl);
    // You need to add this url to your authorized redirect urls on your Facebook app
    console.log({
      redirectUrl
    });

    // NOTICE: Please do not actually request the token on the client (see:
    // response_type=token in the authUrl), it is not secure. Request a code
    // instead, and use this flow:
    // https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow/#confirm
    // The code here is simplified for the sake of demonstration. If you are
    // just prototyping then you don't need to concern yourself with this and
    // can copy this example, but be aware that this is not safe in production.

    /*let result = await AuthSession.startAsync({
      authUrl:
        `https://www.facebook.com/v2.8/dialog/oauth?response_type=token` +
        `&client_id=${FB_APP_ID}` +
        `&redirect_uri=${encodeURIComponent(redirectUrl)}`,
    });*/

    let result = await Facebook.logInWithReadPermissionsAsync(FB_APP_ID,
       {permissions: ['public_profile'],
        behavior: 'native'});

    if (result.type !== 'success') {
      alert('Uh oh, something went wrong');
      return;
    }

    //let accessToken = result.params.access_token;
    let accessToken = result.token;
    console.log(accessToken);
    await NativeStorage.persistAccessToken(accessToken);

    let userInfoResponse = await fetch(
      `https://graph.facebook.com/me?access_token=${accessToken}&fields=id,name,email,first_name,last_name,picture.type(large)`
    );
    const userInfo = await userInfoResponse.json();
    console.log(userInfo);

    if(userInfo.email) {
      var userData = {
        handle: userInfo.email.split('@').join('.'),
        email: userInfo.email, 
        first_name: userInfo.first_name, 
        last_name: userInfo.last_name,
        picture_url: userInfo.picture.data.url, 
        full_name: userInfo.name,
        method: loginMethod.Facebook
      };
      const facebookCredential = firebase.auth.FacebookAuthProvider
      .credential(accessToken);
  
      try {
        await firebase.auth().signInAndRetrieveDataWithCredential(facebookCredential);
      }
      catch(error) {
        console.log("Firebase failed facebook login: "); 
        console.log(error)
      }
  
      DataService.saveProfileData(userData);
      console.log('Logged into Facebook!', userData);
      this.setState({ loggedIn: true, authenticationGFB: false, authenticatingFirebase: false, userInfo: userData });
    }
    else {
      this.setState({ authenticationGFB: false, authenticatingFirebase: false });

      ToastAndroid.showWithGravity(
        "Can't find email-id with facebook. Try logging-in with Google.",
        ToastAndroid.LONG,
        ToastAndroid.CENTER,
      );
    }
    
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});