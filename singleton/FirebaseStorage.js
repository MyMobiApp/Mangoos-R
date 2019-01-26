const firebase = require('firebase');
// Required for side-effects
require('firebase/firestore');

export default class FirebaseStorage {

    static getMP3DownloadURL(fullPath) {
        return firebase.storage().ref(fullPath).getDownloadURL();
    }
    
    static deleteFile(file_path){
        return firebase.storage().ref(file_path).delete();
    }

    static uploadAudio(full_path, blob) {
        return firebase.storage().ref(full_path).put(blob);
    }
}