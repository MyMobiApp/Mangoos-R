export const STATE = 'none' | 'playing' | 'paused' | 'stopped';

export const INITIAL_STATE = {
    bInternetActive: false,
    playlist: [],
    currentPlayIndex: 0,
    playerState: 'none'
};