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
    });
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
    });
};

const User = (r) => {
  r.default(null)
      .on('login', (state, action) => {
        return action.username;
      });
};

const News = (state = [], action) => {
    switch (action.type) {
        case 'add-news':
            return [action.news, ...state];
        case 'remove-news':
            let newState = [...state];
            newState.pop();
            return newState;
        default:
            return state;
    }
}

const appReducer = builder.build(
  builder.combine({
    App: builder.combine({ Album, Artist}),
    User,
  }, {
      News,
  })
);

const reducer = (state, action) => {
    if (action.type === 'clear-store') {
        state = undefined;
    }
    return appReducer(state, action);
}

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
store = reducer(store, {type: 'add-news', news: 'First news'});
store = reducer(store, {type: 'add-news', news: 'Second news'});
store = reducer(store, {type: 'add-news', news: 'Third news'});
console.log(store);
store = reducer(store, {type: 'remove-news'});
console.log(store);
store = reducer(store, {type: 'clear-store'});
console.log(store);
