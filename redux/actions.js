
export const playerState = {
    None: 0,
    Play: 1,
    Paused: 2,
    Stopped: 3
};

export const playlistActions = {
    AddOne: 'AddOne',
    AddMany: 'AddMany',
    Change: 'Change',
    Remove: 'Remove',
    RemoveMany: 'RemoveMany',
    Purge: 'Purge',
    AdjustIndex: 'AdjustIndex',
    SetIndex: 'SetIndex',
    PlayerStatus: 'PlayerStatus'
}

export const netStateActions = {
    Connected: 'Connected',
    Disconnected: 'Disconnected'
}


export const addToPlaylist = (item) => (
    {
        type: playlistActions.AddOne,
        payload: item
    }
);

export const addManyToPlaylist = (items) => (
    {
        type: playlistActions.AddMany,
        payload: items
    }
);

export const changePlaylist = (items, newCurIndex = 0) => (
    {
        type: playlistActions.Change,
        payload: {items, newCurIndex}
    }
);

export const removeFromPlaylist = (id, index = null, bAdjust = null) => (
    {
        type: playlistActions.Remove,
        payload: {id, index, bAdjust}
    }
);

export const removeManyFromPlaylist = (idMap) => (
    {
        type: playlistActions.RemoveMany,
        payload: idMap
    }
);

export const purgePlaylist = () => (
    {
        type: playlistActions.Purge,
        payload: {id, index}
    }
);

export const adjustIndexPlaylist = (forward) => (
    {
        type: playlistActions.AdjustIndex,
        payload: forward
    }
);

export const setIndexPlaylist = (id, index = null) => (
    {
        type: playlistActions.SetIndex,
        payload: {id, index}
    }
);

export const playerStatusPlaylist = (status) => (
    {
        type: playlistActions.PlayerStatus,
        payload: status
    }
);

export const netConnected = () => (
    {
        type: netStateActions.Connected,
        payload: true
    }
);

export const netDisconnected = () => (
    {
        type: netStateActions.Disconnected,
        payload: false
    }
);