import { createStore, combineReducers } from 'redux';
import { NetInfoReducer } from './reducers/netInfoReducer';
import { PlaylistReducer } from './reducers/playlistReducer';
import { UpdateScreenReducer } from './reducers/updateScreenReducer';

rootReducer =  combineReducers({
    playlistStore:      PlaylistReducer,
    netInfoStore:       NetInfoReducer,
    updateScreenStore:  UpdateScreenReducer
});

export default class ApplicationStore {
    static getStore = () => {
        return createStore(rootReducer);
    }
}