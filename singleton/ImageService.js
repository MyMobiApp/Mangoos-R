import FirebaseDBService from './FirestoreDB';

export default class ImageService {
    static profileHandleImgMap = {};
    static musicCoverImgMap = {};
  
    static getProfileImage(handle) {
      //let key = handle.split(".").join("");
      
      return new Promise((resolve, reject) => { 
        let retVal;
  
        if(this.profileHandleImgMap.hasOwnProperty(handle)) {
          resolve(this.profileHandleImgMap[handle]);
        }
        else {
            FirebaseDBService.getProfileImageURL(handle).then(profile_img_url => {
            this.profileHandleImgMap[handle] = profile_img_url;
  
            //console.log("In getProfileImage for : " + handle);
            //console.log(this.profileHandleImgMap);
            //console.log(this.profileHandleImgMap[handle]);
            //console.log(this.profileHandleImgMap.hasOwnProperty(handle));
  
            resolve(this.profileHandleImgMap[handle]);
          }).catch(error => {
  
            reject(error);
  
          });
        }
      });
    }
  }
  