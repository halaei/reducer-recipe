import { combineReducers } from 'redux';

const unknownArtist = {
  name: 'Unknown',
  followers: 0,
  albums: [],
};
const Artist = (state = unknownArtist, action) => {
  switch (action.type) {
    case 'set-artist-name':
      return { ...state, name: action.name };
    case 'set-artist-followers':
      return { ...state, followers: action.followers };
    case 'publish-new-album':
      return { ...state, albums: [...state.albums, action.album] };
    case 'clear-store':
      return unknownArtist;
    default:
      return state;
  }
};

const unknownAlbum = {
  name: 'Unknown',
  artist: 'Unknown',
  cover: null,
  playing: false,
};

const Album = (state = unknownAlbum, action) => {
  switch (action.type) {
    case 'set-album':
      return { ...action.album, playing: false };
    case 'play-album':
    case 'stop-album':
      return { ...state, playing: !state.playing };
    case 'clear-store':
      return unknownAlbum;
    default:
      return state;
  }
};

const reducer = combineReducers({ Album, Artist });
let store = reducer(undefined, { type: undefined });
store = reducer(store, { type: 'set-artist-name', name: 'Foo'});
console.log(store);
