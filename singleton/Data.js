import FirebaseDBService from './FirestoreDB';

export default class DataService {
  static profileData;
  static feedItem = null;
  static mp3UploadProgress = 0;
  static mp3UploadObservable;
  static mp3UploadObserver;

  constructor() {
    let _me_ = this;

    this.mp3UploadObservable = Observable.create(observer => {
      _me_.mp3UploadObserver = observer;
    });

    // Dummy call, to initialize observer
    this.mp3UploadObservable.subscribe(data => {}); 
  }

  ngOnInit() {
    
  }

  static uploadEvent() {
    return this.mp3UploadObservable;
  }

  static getmp3UploadProgress() {
    return this.mp3UploadProgress;
  }

  static setPublicFeedItem(feedItem) {
    this.feedItem = feedItem;
  }

  static getPublicFeedItem() {
    return this.feedItem;
  }

  static setMP3UploadProgress(progress) {
    this.mp3UploadProgress = progress;

    this.mp3UploadObserver.next(progress);
    //alert("In setMP3UploadProgress : "+ progress);
  }

  static getProfileData() {
    //console.log("Returning ProfileData: " + JSON.stringify(this.profileData));
    return this.profileData;
  }

  static saveProfileData(pd) {
    this.profileData = Object.assign({}, pd);
    
    console.log("Set ProfileData: " + JSON.stringify(this.profileData));
    FirebaseDBService.registerUser(pd);
  }

  static setProfileData(pd) {
    this.profileData = Object.assign({}, pd);
    
    console.log("Saved ProfileData: " + JSON.stringify(this.profileData));
  }

  static addNewProfileData(pd) {
    this.profileData = Object.assign({}, pd);

    FirebaseDBService.registerUser(pd);
  }

  static updateProfileData(pd) {
    this.profileData = Object.assign({}, pd);
  }

  static imgSrc(format, base64data) {
    return this.sanitizer.bypassSecurityTrustUrl('data:'+format+';base64,' + base64data);
  }

  static rawImgSrc(format, base64data) {
    return ('data:'+format+';base64,' + base64data);
  }

  static sanitizeImg(imgData) {
    return this.sanitizer.bypassSecurityTrustUrl(imgData);
  }
}