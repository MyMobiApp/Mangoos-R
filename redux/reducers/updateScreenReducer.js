import { initialState } from '../state';
import { updateScreenActions } from '../actions';

export const UpdateScreenReducer = (state = initialState, action) => {
    //console.log("UpdateScreenReducer reducer: ", action);

    switch(action.type) {
        case updateScreenActions.UpdateFeed: {
            const bUpdate = action.payload;
            
            return Object.assign({}, state, {bUpdateFeed: bUpdate});
        }
        case updateScreenActions.UpdateMyMusic: {
            const bUpdate = action.payload;
            
            return Object.assign({}, state, {bUpdateMyMusic: bUpdate});
        }
        case updateScreenActions.updateFeedAndMyMusic: {
            const bUpdate = action.payload;
            
            return Object.assign({}, state, {bUpdateFeed: bUpdate, bUpdateMyMusic: bUpdate});
        }
        default: {
            return state;
        }
    }
}