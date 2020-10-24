import builder from '..';

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
        case 'pop-news':
            let newState = [...state];
            newState.pop();
            return newState;
        default:
            return state;
    }
}

const appReducer = builder.buildCombined(
    {
        App: builder.combine({ Album, Artist}),
        User,
    },
    {
        News,
    }
);

const reducer = (state, action) => {
    if (action.type === 'clear-store') {
        state = undefined;
    }
    return appReducer(state, action);
}

it('should generate the expected states', function () {
    let state = reducer(undefined, {type: undefined});
    expect(state).toMatchSnapshot();
    state = reducer(state, { type: 'login', username: 'hamid'});
    expect(state).toMatchSnapshot();
    state = reducer(state, { type: 'set-artist-name', name: 'Foo' });
    expect(state).toMatchSnapshot();
    state = reducer(state, {type: 'set-album', album: {name: 'new', artist: 'Foo', cover: 'cover.jpg'}});
    expect(state).toMatchSnapshot();
    state = reducer(state, {type: 'play-album'})
    expect(state).toMatchSnapshot();
    state = reducer(state, {type: 'add-news', news: 'First news'});
    expect(state).toMatchSnapshot();
    state = reducer(state, {type: 'add-news', news: 'Second news'});
    expect(state).toMatchSnapshot();
    state = reducer(state, {type: 'add-news', news: 'Third news'});
    expect(state).toMatchSnapshot();
    state = reducer(state, {type: 'pop-news'});
    expect(state).toMatchSnapshot();
    state = reducer(state, {type: 'clear-store'});
    expect(state).toMatchSnapshot();
});
