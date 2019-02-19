import React from 'react';
import { DocumentPicker } from 'expo';
import { Icon, Fab } from 'native-base';

import FirebaseDBService from '../singleton/FirestoreDB';
import DataService from '../singleton/Data';
import FirebaseStorage from '../singleton/FirebaseStorage';
import { Platform } from 'expo-core';

const firebase = require('firebase');
// Required for side-effects
require('firebase/firestore');

export class UploadFAB extends React.Component {
 
  constructor(props) {
    super(props);
    
    this.state = {
        progress: 0,
        downloadURL: ""
    }
  }

  render() {
    return (
        <Fab
            containerStyle={{ }}
            style={{ backgroundColor: '#5067FF' }}
            position="bottomRight"
            onPress={() => {this.onUpload()}}>
            <Icon name="cloud-upload" />
        </Fab>
    );
  }

  onUpload() {
    //audio/mpeg,audio/apev2,audio/mp4,audio/asf,audio/flac,audio/ogg,audio/aiff,audio/wavpack,audio/riff,audio/musepack
    DocumentPicker.getDocumentAsync({type: "audio/mpeg"}).then(obj => {
      console.log(obj);
      if(obj.type == "success") {
        this.uploadAudioAsync(obj.uri, obj.name, "audio/mpeg");
      }
    }).catch(error => {
      alert(error);
    });
  }

  async uploadAudioAsync(uri, name, mimeType) {
    let userID = DataService.getProfileData().handle;//"manish_mastishka.hotmail.com";
    let sAlbum = "default";
    let fullPath = `${userID}/${sAlbum}/${new Date().getTime()}-`+name;

    let blob;
    this.getBlob(uri).then(val => {
        blob = val;
        blob._data.type = mimeType;
        console.log({val});
    }).catch(error => {
        console.log(error);
    });

    var objDate = new Date();
    let toSave = {
      createdAt:    `${Date.now()}`,
      createdAtISO: `${objDate.toISOString()}`,
      fileName:     name,
      customName:   name,
      albumName:    sAlbum,
      fullPath:     fullPath,
      contentType:  mimeType,
      feedID:       null,
      metaData:     null
    };
  
    FirebaseDBService.saveMyMP3(userID, toSave).then(docRef =>{
        let feedItem = {
          doc_id:           docRef.id,
          db_path:          docRef.path,
          message:          "",
          profile_handle:   DataService.getProfileData().handle,
          full_name:        DataService.getProfileData().full_name,
          post_datetime:    (new Date()).toISOString(),
          post_dateobj:     Date.now(),
          likes:            0,
          feed_status:      1,
          feed_removed_date:    null,
          feed_removed_reason:  null
        };      
        DataService.setPublicFeedItem(feedItem);
        
        // Enable background mode.
        //_me_.backgroundMode.enable();
        
        // Trigger props callback, indicating upload initiated
        this.props.onInit(name);
        
        // Start upload, and track upload progress
        let task = FirebaseStorage.uploadAudio(fullPath, blob);

        this.subscribeUploadProgress(task).then(downloadURL => {
            this.state.downloadURL = downloadURL;
            // Trigger props callback, indicating upload completed
            this.props.onDone(downloadURL);
        }).catch(error => {
            console.log(error);
            FirebaseDBService.deleteDocWithRef(docRef);

            // Trigger props callback, indicating upload error
            this.props.onError(error);
        });

        // We're done with the blob, close and release it
        //blob.close();
      }).catch(error => {
        // We're done with the blob, close and release it
        //blob.close();

        alert(error);
        console.log(error);
      });
  }

  async getBlob(uri) {
    // Why are we using XMLHttpRequest? See:
    // https://github.com/expo/expo/issues/2402#issuecomment-443726662
    
    return await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function() {
        resolve(xhr.response);
      };
      xhr.onerror = function(e) {
        console.log(e);
        reject(new TypeError('Network request failed'));
      };
      xhr.responseType = 'blob';
      xhr.open('GET', uri, true);
      xhr.send(null);
    });
  }

  subscribeUploadProgress(task) {
    // Register three observers:
    // 1. 'state_changed' observer, called any time the state changes
    // 2. Error observer, called on failure
    // 3. Completion observer, called on successful completion
    return new Promise((resolve, reject) => {
        task.on('state_changed', snapshot => {
            // Observe state change events such as progress, pause, and resume
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            this.state.progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            // Trigger props callback, indicating upload progress
            this.props.onProgress(this.state.progress);
            
            console.log("Upload Progress % : " + this.state.progress);
            
            switch (snapshot.state) {
                case firebase.storage.TaskState.PAUSED: // or 'paused'
                    console.log('Upload is paused');
                    break;
                case firebase.storage.TaskState.RUNNING: // or 'running'
                    console.log('Upload is running');
                    break;
            }
        }, function(error) {
            // Handle unsuccessful uploads
            reject(error);
        }, function() {
            // Handle successful uploads on complete
            // For instance, get the download URL: https://firebasestorage.googleapis.com/...
            task.snapshot.ref.getDownloadURL().then(function(downloadURL) {
                resolve(downloadURL);
            });
        });
    });
  }
}