import { AsyncStorage } from "react-native";

export default class NativeStorage {
    static persistPlaylist(playlistAry) {
        return AsyncStorage.setItem('playlist', JSON.stringify(playlistAry));
    }

    static getPlaylist() {
        return AsyncStorage.getItem('playlist');
    }

    static persistUserProfile(userProfile) {
        return AsyncStorage.setItem('userProfile', JSON.stringify(userProfile));
    }

    static getUserProfile() {
        return AsyncStorage.getItem('userProfile');
    }

    static persistFeedItems(feedItemAry) {
        return AsyncStorage.setItem('feed', JSON.stringify(feedItemAry));
    }

    static getFeedItem() {
        return AsyncStorage.getItem('feed');
    }

    static persistAccessToken(token) {
        return AsyncStorage.setItem('fbAccessToken', token);
    }

    static getAccessToken() {
        return AsyncStorage.getItem('fbAccessToken');
    }
}
