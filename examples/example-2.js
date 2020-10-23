import builder from '../src/index.js';

const Artist = (r) => {
  const unknown = { name: 'Unknown', followers: 0, albums: [] };
  r.default(unknown)
    .on('set-artist-name', (state, action) => {
      return { ...state, name: action.name };
    })
    .on('set-artist-followers', (state, action) => {
      return { ...state, followers: action.followers };
    })
    .on('publish-new-album', (state, action) => {
      return { ...state, albums: [...state.albums, action.album] };
    })
    .on('clear-store', () => unknown);
};

const Album = (r) => {
  const unknown = {
    name: 'Unknown',
    artist: 'Unknown',
    cover: null,
    playing: false,
  };
  r.default(unknown)
    .on('set-album', (state, action) => {
      return { ...action.album, playing: false };
    })
    .on(['play-album', 'stop-album'], (state) => {
      return { ...state, playing: !state.playing };
    })
    .on('clear-store', () => unknown);
};

const User = (r) => {
  r.default(null)
      .on('login', (state, action) => {
        return action.username;
      })
      .on('clear-store', () => null);
}

const reducer = builder.buildCombined({
  App: builder.combine({ Album, Artist}),
  User,
});

let store = reducer(undefined, { type: undefined });
console.log(store);
store = reducer(store, { type: 'login', username: 'hamid'});
console.log(store);
store = reducer(store, { type: 'set-artist-name', name: 'Foo' });
console.log(store);
store = reducer(store, {type: 'set-album', album: {name: 'new', artist: 'Foo', cover: 'cover.jpg'}});
console.log(store);
store = reducer(store, {type: 'play-album'})
console.log(store);
store = reducer(store, {type: 'clear-store'});
console.log(store);
