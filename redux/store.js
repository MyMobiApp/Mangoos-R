import { createStore, combineReducers } from 'redux';
import { NetInfoReducer } from './reducers/netInfoReducer';
import { PlaylistReducer } from './reducers/playlistReducer';

rootReducer =  combineReducers({
    playlistStore: PlaylistReducer,
    netInfoStore: NetInfoReducer
});

export default class ApplicationStore {
    static getStore = () => {
        return createStore(rootReducer);
    }
}