import * as firebase from 'firebase';
import FirebaseStorage from './FirebaseStorage';


export default class FirebaseDBService {
    
    static registerUser(profileData) {
        //firebase.firestore().collection('userProfile', ref => ref.where('email', "==", profileData.email)).snapshotChanges().subscribe(res => {
        firebase.firestore().collection('userProfile').where('email', "==", profileData.email).get().then(res => {
          if (!res.empty)
          {
            console.log("Match found.");
            
            const first_name  = profileData.first_name;
            const last_name   = profileData.last_name;
            const full_name   = profileData.full_name;
            const picture_url = profileData.picture_url;
    
            res.forEach(function(doc) {
              doc.ref.update({first_name, last_name, full_name, picture_url}).then(() => {
                console.log("Profile information is updated with name and image.");
              }).catch(error => {
                console.log("Error updating profile data: " + error);
              });
    
              // doc.data() is never undefined for query doc snapshots
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
    
            firebase.firestore().collection('userProfile').add({
              handle,
              email,
              first_name,
              last_name,
              full_name,
              picture_url
            })
            .then(function() {
              console.log("Document successfully written!");
            })
            .catch(function(error) {
                console.error("Error writing document: ", error);
            });
          }
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
              
              console.error("feedID in mp3Collection updated successfully.");
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
    
      static getMusicMetaInfoList(handle, album, offset, limit) {
        
        return new Promise((resolve, reject) => { 
            let mp3Collection;

            if(offset) {
                mp3Collection = firebase.firestore().collection('mp3Collection')
                .doc(handle).collection(album)
                .orderBy('createdAt', 'desc')
                .startAfter(offset)
                .limit(limit);
            }
            else {
                mp3Collection = firebase.firestore().collection('mp3Collection')
                .doc(handle).collection(album)
                .orderBy('createdAt', 'desc')
                .limit(limit);
            }

            mp3Collection.onSnapshot(querySnapshot => {
                let list = Array();

                querySnapshot.forEach(docSnapshot => {
                    list.push({id: docSnapshot.id, data: docSnapshot.data()});
                });

                resolve(list);
            }, error => {
                reject(error);
            });
        });
      }
    
      static getMusicFileList(handle, album) {
        
        return new Promise((resolve, reject) => { 
          firebase.firestore().collection('mp3Collection').doc(handle).collection(album)
            .onSnapshot(res => {
              //alert(res.size);
              if (res.size > 0)
              {
                let dataAry = Array();
                res.forEach(action => {
                  dataAry.push({'id': action.id, 'data': action.data()});
                  //alert(doc.id + " => " + JSON.stringify(doc.data()));
                  // doc.data() is never undefined for query doc snapshots
                });
                resolve(dataAry);
              }
              else {
                reject("You haven't uploaded any music file yet!");
              }
            });
        });
      }
    
      static getMusicMetadata(path) {
        
        return new Promise((resolve, reject) => { 
          firebase.firestore().doc(path).onSnapshot(docSnapshot => {
              //console.log(docSnapshot);
              if (docSnapshot)
              {
                resolve(docSnapshot.data());
              }
              else {
                reject("You haven't uploaded any music file yet!");
              }
            });
        });
      }
    
      static getPublicFeedItem() {
        return new Promise((resolve, reject) => { 
            firebase.firestore().collection('publicFeed').onSnapshot(querySnapshot => {
                let list = Array();

                querySnapshot.forEach(docSnapshot => {
                    list.push({id: docSnapshot.id, data: docSnapshot.data()});
                });

                resolve(list);
            }, error => {
                reject(error);
            });
        });
      }
    
      static getPublicFeedItemWithOffset(offset, limit) {
        
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
                resolve(list);
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
    
                querySnapshot.forEach(function(doc) {
                  resolve(doc.data().picture_url);
    
                  // doc.data() is never undefined for query doc snapshots
                  //console.log("Profile picture URL : ", doc.data().picture_url);
                });
              }
              else {
                reject("Can't find user profile with handle : " + handle);
              }
            });
        });
      }
    
      static editMusicMetadata(doc_path, album, title) {
        
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
          }, error => {
            console.log("Error getting mp3Collection for editMusicMetadata : " + error);
    
            reject(error);
          });
        });
      }
    
      static deleteMusicMetadataAndFile(doc_path, file_path) {
    
        return new Promise((resolve, reject) => { 
          firebase.firestore().doc(doc_path).get().then(res => {
            console.log(res);
            FirebaseStorage.deleteFile(file_path).then(() => {
              console.log("File deleted from storage ");
            }, error => {
              console.log("Error deleting file from storage : " + error);
            });
    
            if(res.exists) {
              if(res.data().feedID) {
                firebase.firestore().collection("publicFeed").doc(res.data().feedID).delete().then(() => {
                  res.ref.delete().then(() => {
                    resolve();
                  }).catch(error => {
                    console.log("Error deleting file from storage : " + error);
    
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
                  console.log("Error deleting file from storage : " + error);
    
                  reject(error);
                });
              }
            }
            else {
              resolve();
            }
          }, error => {
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