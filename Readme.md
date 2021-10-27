# Reducer recipe
`reducer-recipe` is an elegant CPU-efficient alternative to [combileReducers()](https://redux.js.org/api/combinereducers)
and [Redux Toolkit createReducer()](https://redux-toolkit.js.org/api/createreducer).
1. It lets you make faster reducers in an elegant code-style by avoiding large switch-case/if-else statements.
2. It provides a CPU-efficient way to combining a hierarchy of reducers into a single complex reducer.
According to the [benchmarks](./test/benchmark.test.js), using map of action types to small reducers that only handle
the give types, reducers generated by `reducer-recipe` are more CPU-efficient than the ones created by
`combileReducers()` or `createReducer()`.

## Recipes
A recipe is a function that takes a builder (r) as argument and gives r instructions on how it should generate the desired reducer.
To do so, recipe should call:
1. r.default(state): with the default value for state.
2. r.on(actionType, reducer(state, action)): to tell the builder how the final reducer should handle an action of given type.

```javascript
import builder from 'reducer-recipe';

const Artist = (r) => {
    r.default({ name: 'Unknown', followers: 0, albums: [] })
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

const artistReducer = builder.build(Artist);
```
The code above generates the following reducer:
```javascript
const artistReducer = (state = { name: 'Unknown', followers: 0, albums: [] }, action) => {
    switch (action.type) {
      case 'set-artist-name':
        return { ...state, name: action.name };
      case 'set-artist-followers':
        return { ...state, followers: action.followers };
      case 'publish-new-album':
        return { ...state, albums: [...state.albums, action.album] };
      default:
        return state;
    }
}
```

## Combine recipes and reducers
To make a bigger recipe from smaller recipes you can use `builder.combine()` function:
```javascript
const combinedRecipe = builder.combine({ Album, Artist});
const combinedReducer = builder.build(combinedRecipe);
```
Alternatively, you can call `builder.buildCombined()` to combine rececipes and build the reducer at once:
```javascript
const combinedReducer = builder.buildCombined({ Album, Artist});
```
If for some reason, you need pure reducers that cannot be built from recipes, and you want to mix them with recipes, you can pass them as second
argument to `builder.combine()` or `builder.buildCombined()`:
```javascript
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
};

const reducer = builder.buildCombined({ Album, Artist }, { News });
```
See [the tests file](./test/builder.test.js) to see a complete example.
