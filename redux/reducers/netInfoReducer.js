import { initialState } from '../state';
import { netStateActions } from '../actions';


export const NetInfoReducer = (state = initialState, action) => {
    //console.log("NetInfoReducer reducer: ", action);

    switch(action.type) {
        case netStateActions.Connected: {
            
            return Object.assign({}, state, {bInternetActive: true});
        }
        case netStateActions.Disconnected: {
            
            return Object.assign({}, state, {bInternetActive: false});
        }
        default: {
            return state;
        }
    }
}