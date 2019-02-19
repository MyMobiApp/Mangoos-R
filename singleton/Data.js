import { Observable } from 'rxjs';
import FirebaseDBService from './FirestoreDB';

export default class DataService {
  static profileData;
  static feedItem = null;
  /*static plItemAry = Array();
  static playlistObservable;
  static playlistObserver;

  static InitAddToPlaylistEvent() {
    this.playlistObservable = Observable.create(observer => {
      this.playlistObserver = observer;
    });

    this.playlistObservable.subscribe(data => {}); 
  }

  static AddToPlaylist(item) {
    this.plItemAry.push(item);
    this.playlistObserver.next(item);
  }

  static getPlaylistItem() {
    let plItemAry = this.plItemAry;

    this.plItemAry = Array();

    return plItemAry;
  }*/

  static setPublicFeedItem(feedItem) {
    this.feedItem = feedItem;
  }

  static getPublicFeedItem() {
    return this.feedItem;
  }

  
  static getProfileData() {
    //console.log("Returning ProfileData: " + JSON.stringify(this.profileData));
    return this.profileData;
  }

  static async saveProfileData(pd) {
    this.profileData = Object.assign({}, pd);
    
    console.log("Save ProfileData: " + JSON.stringify(this.profileData));
    await FirebaseDBService.registerUser(pd);
  }

  static setProfileData(pd) {
    this.profileData = Object.assign({}, pd);
    
    console.log("Set ProfileData: " + JSON.stringify(this.profileData));
  }

  static updateProfileData(pd) {
    this.profileData = Object.assign({}, pd);
  }

  static getFirebaseStorageReadURL(storagePath) {
    const bucket = 'mgoos-mvp.appspot.com';

    return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(storagePath)}?alt=media`;
  }

  static getFirebaseStorageURL(encodedURL) {
    /*const URLComponents = encodedURL.split('/');
    const lastComponent = URLComponents.pop();
    const queryPath     = lastComponent.split('?');*/
    const queryPath = encodedURL.split('/').pop().split('?');
    
    return decodeURIComponent(queryPath.shift());
  }
}