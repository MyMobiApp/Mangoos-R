import * as firebase from 'firebase';

export default class FirebaseStorage {

    static getMP3DownloadURL(fullPath) {
        return firebase.storage().ref(fullPath).getDownloadURL();
    }
    
    static deleteFile(file_path){
        return firebase.storage().ref(file_path).delete();
    }
}