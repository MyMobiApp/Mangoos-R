import { AsyncStorage } from "react-native";

export default class NativeStorage {
    static persistPlaylist(playlistAry) {
        return AsyncStorage.setItem('playlist', playlistAry);
    }

    static getPlaylist() {
        return AsyncStorage.getItem('playlist');
    }

    static persistUserProfile(userProfile) {
        return AsyncStorage.setItem('userProfile', userProfile);
    }

    static getUserProfile() {
        return AsyncStorage.getItem('userProfile');
    }

    static persistFeedItems(feedItemAry) {
        return AsyncStorage.setItem('feed', feedItemAry);
    }

    static getFeedItem() {
        return AsyncStorage.getItem('feed');
    }
}