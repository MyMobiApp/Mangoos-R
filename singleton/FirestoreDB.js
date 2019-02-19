import { NetInfo } from 'react-native';
import FirebaseStorage from './FirebaseStorage';

import atob from 'atob';
const firebase = require('firebase');
// Required for side-effects
require('firebase/firestore');

import { environment } from '../environments/environment';

export class UserProfile {

  constructor(handle, email, first_name, last_name, full_name, picture_url, method) {
    this.handle       = handle;
    this.email        = email;
    this.first_name   = first_name;
    this.last_name    = last_name;
    this.full_name    = full_name;
    this.picture_url  = picture_url;
    this.method       = method;
  }

  toJSON() {
    return {
      handle: this.handle,
      email: this.email,
      first_name: this.first_name,
      last_name: this.last_name,
      full_name: this.full_name,
      picture_url: this.picture_url,
      method: this.method
    };
  }
}

export class FeedItem {

  constructor(profile_handle, full_name, post_datetime, 
              post_dateobj, db_path, doc_id, message, likes,
              feed_status, feed_removed_date, feed_removed_reason) {
    this.profile_handle = profile_handle;
    this.full_name      = full_name;
    this.post_datetime  = post_datetime;
    this.post_dateobj   = post_dateobj;
    this.db_path        = db_path; // location at mp3Collection
    this.doc_id         = doc_id; // mp3Collection's document ID
    this.message        = message;
    this.likes          = likes;
    // 0: Not available for feed / removed later by user
    // 1: Available for feed
    // 2: Forced removed from feed from application admin
    this.feed_status          = feed_status; 
    this.feed_removed_date    = feed_removed_date;
    this.feed_removed_reason  = feed_removed_reason;
  }

  toJSON() {
    return {
      profile_handle:     this.profile_handle,
      full_name:          this.full_name,
      post_datetime:      this.post_datetime,
      post_dateobj:       this.post_dateobj,
      db_path:            this.db_path,
      doc_id:             this.doc_id,
      message:            this.message,
      likes:              this.likes,
      feed_status:        this.feed_status,
      feed_removed_date:  this.feed_removed_date,
      feed_removed_reason: this.feed_removed_reason
    };
  }
}

export default class FirebaseDBService {
  static init() {
      firebase.initializeApp(environment.firebase);
  }

  static registerUser(profileData) {
    return new Promise((resolve, reject) => {
      firebase.firestore().collection('userProfile').where('email', "==", profileData.email).get().then(res => {
        if (!res.empty)
        {
          console.log("Match found.");
          console.log(profileData);
          
          const first_name  = profileData.first_name;
          const last_name   = profileData.last_name;
          const full_name   = profileData.full_name;
          const picture_url = profileData.picture_url;
  
          res.forEach(doc => {
            doc.ref.update({first_name, last_name, full_name, picture_url}).then(() => {
              console.log("Profile information is updated with name and image.");
            }).catch(error => {
              console.log("Error updating profile data: " + error);
            });
  
            // doc.data() is never undefined for query doc snapshots
            resolve({data: doc.data()});
            console.log(doc.id, " => ", doc.data());
          });
        }
        else
        {
          console.log("Does not exist.");
  
          profileData.handle = profileData.email.split('@').join('.');
  
          const handle      = profileData.handle;
          const email       = profileData.email;
          const first_name  = profileData.first_name;
          const last_name   = profileData.last_name;
          const full_name   = profileData.full_name;
          const picture_url = profileData.picture_url;
          const method      = profileData.method;
  
          firebase.firestore().collection('userProfile').add({
            handle,
            email,
            first_name,
            last_name,
            full_name,
            picture_url,
            method
          })
          .then(docRef => {
            resolve({id: docRef.id});
            console.log("Document successfully written!");
          })
          .catch(function(error) {
            reject(error);
            console.error("Error writing document: ", error);
          });
        }
      }).catch(error => {
        reject(error);
        console.error(error);
      });
    });
  }
  
  static getUserProfile(email) {
    
    return new Promise((resolve, reject) => { 
      firebase.firestore().collection('userProfile').where('email', "==", email)
        .get().then(res => {
          if (res.size > 0)
          {
            console.log("Profile found.");
            res.forEach(function(doc) {
              resolve(doc.data());

              // doc.data() is never undefined for query doc snapshots
              console.log(doc.id, " => ", doc.data());
            });
          }
          else {
            reject();
          }
        }).catch(error => {
          reject(error);
        });
    });
  }
  
  static deleteDocWithRef(docRef) {
    firebase.firestore().doc(docRef.path).delete().then(() => {
      // Deleted Successfully
    }).catch(reason => {
      console.log(reason);
    });
  }
  
  static saveMyMP3(handle, mp3MetaInfo) {
    const createdAtISO  = mp3MetaInfo.createdAtISO;
    const createdAt     = mp3MetaInfo.createdAt;
    const fileName      = mp3MetaInfo.fileName;
    const customName    = mp3MetaInfo.customName;
    const albumName     = mp3MetaInfo.albumName
    const fullPath      = mp3MetaInfo.fullPath;
    const contentType   = mp3MetaInfo.contentType;
    const fieldID       = mp3MetaInfo.feedID;
    
    return new Promise((resolve, reject) => {
      firebase.firestore().doc(`mp3Collection/${handle}`).collection(albumName).add({
        createdAt,
        createdAtISO,
        fileName,
        customName,
        albumName,
        fullPath,
        contentType,
        fieldID
      })
      .then(docRef => {
        console.log("Document successfully written!");
        resolve(docRef);
      })
      .catch(function(error) {
          console.error("Error writing document: ", error);
          reject(error);
      });
    });
  }
  
  static saveItemToPublicFeed(feedItem) {
    const db_path         = feedItem.db_path;
    const doc_id          = feedItem.doc_id;
    const post_dateobj   = feedItem.post_dateobj;
    const post_datetime   = feedItem.post_datetime;
    const profile_handle  = feedItem.profile_handle;
    const full_name       = feedItem.full_name;
    const message         = feedItem.message;
    const likes           = feedItem.likes;
    const feed_status     = feedItem.feed_status;

    return new Promise((resolve, reject) => {
      firebase.firestore().collection('publicFeed').add({
        post_dateobj,
        post_datetime,
        profile_handle,
        full_name,
        db_path,
        doc_id,
        message,
        likes,
        feed_status
      })
      .then(docRef => {
        console.log("Public feed document successfully written!");
        
        // Update respective mp3Collection
        firebase.firestore().doc(db_path).update({feedID: docRef.id}).then(() => {
          
          console.log("feedID in mp3Collection updated successfully.");
          resolve(docRef);

        }).catch(error => {
          
          console.error("Error updating feedID in mp3Collection: ", error);
          reject(error);

        });
      })
      .catch(function(error) {
          console.error("Error writing public feed document: ", error);
          reject(error);
      });
    });
  }
  
  static getMusicFileList(handle, album, offset, limit) {
    
    return new Promise((resolve, reject) => { 
      let musicCollection;
      
      if(offset) {
        musicCollection = firebase.firestore().collection('mp3Collection').doc(handle).collection(album)
        .orderBy('createdAt', 'desc')
        .startAfter(offset)
        .limit(limit);
      } else {
        musicCollection = firebase.firestore().collection('mp3Collection').doc(handle).collection(album)
        .orderBy('createdAt', 'desc')
        .limit(limit);
      }

      musicCollection.get().then(res => {
        //alert(res.size);
        if (res.size > 0)
        {
          let dataAry = Array();
          res.forEach(action => {
            dataAry.push({id: action.id, data: action.data()});
            //alert(doc.id + " => " + JSON.stringify(doc.data()));
            // doc.data() is never undefined for query doc snapshots
          });
          resolve(dataAry);
        }
        else {
          resolve(Array());
        }
      }).catch(error => {
        reject(error);
      });
    });
  }

  static getMusicMetadata(path) {
    
    return new Promise((resolve, reject) => { 
      firebase.firestore().doc(path).get().then(docSnapshot => {
          //console.log(docSnapshot);
          if (docSnapshot)
          {
            resolve(docSnapshot.data());
          }
          else {
            reject("You haven't uploaded any music file yet!");
          }
        }).catch(error => {
          reject(error);
        });
    }, error => {
      reject(error);
    });
  }

  static deletePublicFeedItem(mp3CollectionPath) {
    console.log(mp3CollectionPath);
    return new Promise((resolve, reject) => { 
      firebase.firestore().doc(mp3CollectionPath).get().then(docSnapshot => {
        if (docSnapshot)
        {
          const feedID = docSnapshot.data().feedID;

          firebase.firestore().collection('publicFeed').doc(feedID).delete().then(() => {
            docSnapshot.ref.update({feedID:""}).then(() => {
              resolve();
            }).catch(error => {
              reject(error);
            });
          }).catch(error => {
            reject(error);
          })
        }
      }).catch(error => {
        reject(error);
      });
    });
  }

  static getPublicFeedItem() {
    return new Promise((resolve, reject) => { 
        firebase.firestore().collection('publicFeed').get().then(querySnapshot => {
            let list = Array();

            querySnapshot.forEach(docSnapshot => {
                list.push({id: docSnapshot.id, data: docSnapshot.data()});
            });

            resolve(list);
        }).catch(error => {
            reject(error);
        });
    });
  }
  
  static getPublicFeedItemWithOffset(offset, limit) {
    //console.log(offset + " - " + limit);
    return new Promise((resolve, reject) => { 
        var feedItemCollection;
        if(offset) {
            feedItemCollection = firebase.firestore().collection('publicFeed')
                                    .orderBy('post_dateobj', 'desc')
                                    .startAfter(offset)
                                    .limit(limit);
        }
        else {
            feedItemCollection = firebase.firestore().collection('publicFeed')
                                    .orderBy('post_dateobj', 'desc')
                                    .limit(limit);
        }
    
        feedItemCollection.get().then(querySnapshot => {
            let list = Array();
            if(!querySnapshot.empty) {
                querySnapshot.forEach(docSnapshot => {
                    list.push({id: docSnapshot.id, data: docSnapshot.data()});
                });
            }
            //console.log(list);
            resolve(list);
        }).catch(error => {
          reject(error);
        });
    });
  }

  static getMusicData(fullPath) {
    
    return new Promise((resolve, reject) => { 
      firebase.firestore().doc(fullPath)
        .get().then(querySnapshot => {
          if (querySnapshot.exists)
          {
            //console.log("Profile found with handle : " + handle);
            const sPath = querySnapshot.data().fullPath;
            const pUrl  = (querySnapshot.data().hasOwnProperty('metaData') && 
                            querySnapshot.data().metaData.hasOwnProperty('common') &&
                            querySnapshot.data().metaData.common.hasOwnProperty('picture')) ? querySnapshot.data().metaData.common.picture[0].data : null;
            const albm = (querySnapshot.data().hasOwnProperty('metaData') && 
                          querySnapshot.data().metaData.hasOwnProperty('common') && 
                          querySnapshot.data().metaData.common.hasOwnProperty('album')) ? querySnapshot.data().metaData.common.album : querySnapshot.data().albumName;
            const titl = (querySnapshot.data().hasOwnProperty('metaData') && 
                          querySnapshot.data().metaData.hasOwnProperty('common') && 
                          querySnapshot.data().metaData.common.hasOwnProperty('title')) ? querySnapshot.data().metaData.common.title : querySnapshot.data().customName;
            const dur  = (querySnapshot.data().hasOwnProperty('metaData') && 
                          querySnapshot.data().metaData.hasOwnProperty('format') && 
                          querySnapshot.data().metaData.format.hasOwnProperty('duration')) ? querySnapshot.data().metaData.format.duration : null;
            resolve({
              album: albm, 
              title: titl, 
              pictureURL: pUrl, 
              storagePath: sPath,
              duration: dur
            });

            // doc.data() is never undefined for query doc snapshots
            //console.log("Profile picture URL : ", doc.data().picture_url);
          }
          else {
            reject("Can't find music data with fullPath : " + fullPath);
          }
        }).catch(error => {
          reject(error);
        });
    });
  }

  static getProfileImageURL(handle) {

    return new Promise((resolve, reject) => { 
      firebase.firestore().collection('userProfile').where('handle', "==", handle)
        .get().then(querySnapshot => {
          if (!querySnapshot.empty)
          {
            //console.log("Profile found with handle : " + handle);

            querySnapshot.forEach(doc => {
              resolve(doc.data().picture_url);

              // doc.data() is never undefined for query doc snapshots
              //console.log("Profile picture URL : ", doc.data().picture_url);
            });
          }
          else {
            reject("Can't find user profile with handle : " + handle);
          }
        }).catch(error => {
          reject(error);
        });
    });
  }

  static editMusicMetadata(doc_path, album, title) {
    console.log(doc_path);
    return new Promise((resolve, reject) => { 
      firebase.firestore().doc(doc_path).get().then(docSnapshot => {
        if (docSnapshot.exists)
        {
          if(docSnapshot.data().hasOwnProperty('metaData')) {
            docSnapshot.ref.update({
              albumName: album,
              customName: title,
              'metaData.common.title' : title,
              'metaData.common.album' : album
              }).then(() => {
                console.log("editMusicMetadata album and title updated successfully.");

                resolve();
              }).catch(error => {
                console.log("Error updating editMusicMetadata : " + error);

                reject(error);
              });
          }
          else {
            docSnapshot.ref.update({
              albumName: album,
              customName: title,
              }).then(() => {
                console.log("editMusicMetadata album and title updated successfully.");

                resolve();
              }).catch(error => {
                console.log("Error updating editMusicMetadata : " + error);

                reject(error);
              });
          }
        }
      }).catch(error => {
        console.log("Error getting mp3Collection for editMusicMetadata : " + error);

        reject(error);
      });
    });
  }
  
  static deleteMusicMetadataAndFile(doc_path) {

    return new Promise((resolve, reject) => { 
      firebase.firestore().doc(doc_path).get().then(res => {
        console.log(res);
        const file_path = res.data().fullPath;
        let img_path    = null;
        if(res.data().metaData.hasOwnProperty('common') && 
          res.data().metaData.common.hasOwnProperty('picture') && 
          res.data().metaData.common.picture[0].hasOwnProperty('data')) {
          img_path = res.data().metaData.common.picture[0].data;
        }

        FirebaseStorage.deleteFile(file_path).then(() => {
          console.log("Music file deleted from storage ");
        }, error => {
          console.log("Error deleting music file from storage : " + error);
        });

        if(img_path) {
          FirebaseStorage.deleteFile(img_path).then(() => {
            console.log("Cover image file deleted from storage ");
          }, error => {
            console.log("Error deleting cover image file from storage : " + error);
          });
        }

        if(res.exists) {
          if(res.data().feedID) {
            firebase.firestore().collection("publicFeed").doc(res.data().feedID).delete().then(() => {
              res.ref.delete().then(() => {
                resolve();
              }).catch(error => {
                console.log("Error deleting entry from mp3Collection : " + error);

                reject(error);
              });
            }).catch(error => {
              console.log("Error deleting entry from public feed : " + error);

              reject(error);
            });
          }
          else {
            res.ref.delete().then(() => {
              resolve();
            }).catch(error => {
              console.log("Error deleting entry from mp3Collection : " + error);

              reject(error);
            });
          }
        }
        else {
          resolve();
        }
      }).catch(error => {
        console.log("Error getting mp3Collection for deleteMusicMetadataAndFile : " + error);

        reject(error);
      });
    });
  }

  static searchAlbumOrTitle(searchNiddle, handle, album, offset, limit) {
    
    return new Promise((resolve, reject) => { 
        let mp3Collection;
        if(offset) {
        mp3Collection = firebase.firestore().collection('mp3Collection')
            .doc(handle).collection(album)
            .where('metaData.common.title', "==", searchNiddle)
            .where('metaData.common.album', "==", searchNiddle)
            .orderBy('createdAt', 'desc')
            .startAfter(offset)
            .limit(limit);
        }
        else {
        mp3Collection = firebase.firestore().collection('mp3Collection')
            .doc(handle).collection(album)
            .where('metaData.common.title', "==", searchNiddle)
            .where('metaData.common.album', "==", searchNiddle)
            .orderBy('createdAt', 'desc')
            .limit(limit);
        }
        
        mp3Collection.get().then(querySnapshot => {
            var list = Array();
            if(!querySnapshot.empty) {
                
                querySnapshot.forEach(docSnapshot => {
                    list.push({id: docSnapshot.id, data: docSnapshot.data()});
                });
            }
            resolve(list);
        }).catch(error => {
          reject(error);
        });
    });
  }

  static onPublicFeedUpdate() {
    //return firebase.firestore().collection("publicFeed");
  }
}