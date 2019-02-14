import { initialState } from '../state';
import { playlistActions, playerState } from '../actions';

export const PlaylistReducer = (state = initialState, action) => {
    //console.log("Playlist reducer: ", action, state);
    console.log("action", action);

    switch(action.type) {
        case playlistActions.AddOne: {
            const playlistItem = action.payload;

            return Object.assign({}, state, {playlist: [...state.playlist, playlistItem]});
        }
        case playlistActions.AddMany: {
            const playlistItems = action.payload;
            
            return Object.assign({}, state, {playlist: state.playlist.concat(playlistItems)});
        }
        case playlistActions.Change: {
            const playlistItems = action.payload;

            return Object.assign({}, state, {playlist: Array().concat(playlistItems)});
        }
        case playlistActions.Remove : {
            const idToRemove = action.payload.id;
            const bAdjust    = action.payload.bAdjust;

            const index = state.playlist.findIndex( o => o.id === idToRemove);
            
            if(index >= 0) {
                let newPlaylist = state.playlist;
                newPlaylist.splice(index, 1);

                if(bAdjust) {
                    const index = (newPlaylist.length > 0) ? ((state.currentPlayIndex + 1) % newPlaylist.length) : 0;
                    return Object.assign({}, state, 
                        {
                            currentPlayIndex: index, 
                            playerStatus: playerState.None,
                            playlist: Array().concat(newPlaylist)
                        });
                }
                else {
                    return Object.assign({}, state, {playlist: Array().concat(newPlaylist)});
                }
            }
            else {
                return state;
            }
        }
        case playlistActions.RemoveMany: {
            const idMap = action.payload;
            let newPlaylist = state.playlist.map(o => {
                const index = idMap.findIndex(obj => obj.id === o.id);
                if (index < 0) {
                    return o;
                }
            });

            return Object.assign({}, state, {playlist: Array().concat(newPlaylist)});
        }
        case playlistActions.Purge : {
            return Object.assign({}, state, {playlist: [], currentPlayIndex: 0});
        }
        case playlistActions.AdjustIndex : {
            const forward = action.payload ;
            const newIndex = (state.currentPlayIndex + (forward ? 1 : state.playlist.length - 1)) %
                            state.playlist.length;

            return Object.assign({}, state, {currentPlayIndex: newIndex});
        }
        case playlistActions.SetIndex: {
            let newIndex;
            
            if(action.payload.index != null) {
                newIndex = action.payload.index;
            }
            else {
                const id = action.payload.id;
                newIndex = state.playlist.findIndex( o => o.id === id);
            }

            return Object.assign({}, state, {currentPlayIndex: newIndex});
        }
        case playlistActions.PlayerStatus: {
            const newStatus = action.payload;

            return Object.assign({}, state, {playerStatus: newStatus});
        }
        default : {
            return state;
        }
    }
}

