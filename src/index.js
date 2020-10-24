function R() {
  const SPLITTER = "\0";
  const changeManager = {
    addChange: (path, oldStore, newStore, changes) => {
      if (oldStore !== newStore) {
        changes.set(path, newStore);
      }
    },
    applyChanges: (changes, value) => {
      if (changes.size === 0) {
        return value;
      }
      if (changes.has('')) {
        return changes.get('');
      }
      let hierarchy = { val: new Map(), leaf: false };
      changes.forEach((val, path) => {
        let parent = { val: new Map(), leaf: false };
        let cur = 'hierarchy';
        parent.val.set(cur, hierarchy);
        path.split(SPLITTER).forEach((part) => {
          if (!parent.val.has(cur)) {
            parent.val.set(cur, { val: new Map(), leaf: false });
          }
          parent = parent.val.get(cur);
          cur = part;
        });
        parent.val.set(cur, {val, leaf: true});
      });
      return function applyChangesRecursively(hierarchy, value) {
        if (hierarchy.leaf) {
          return hierarchy.val;
        }
        if (hierarchy.val.size === 0) {
          return value;
        }
        let newValue = {... value};
        hierarchy.val.forEach((val, key) => {
          newValue[key] = applyChangesRecursively(val, value[key]);
        });
        return newValue;
      } (hierarchy, value);
    }
  }
  const builder = {
    store: undefined,
    reducers: new Map(),
    wildcardReducers: new Map(),
    path: [],
    default: (store) => {
      let parent = builder;
      let cur = 'store';
      builder.path.forEach((part) => {
        parent = parent[cur];
        cur = part;
      });
      parent[cur] = store;
      return builder;
    },
    on: (type, reducer) => {
      if (typeof type !== 'string') {
        type.forEach((t) => {
          builder.on(t, reducer);
        });
        return builder;
      }
      if (!builder.reducers.has(type)) {
        builder.reducers.set(type, new Map());
      }
      const path = builder.path.join(SPLITTER);
      if (builder.reducers.get(type).has(path)) {
        throw new Error(`Only one reducer is allowed to handle action type ${type} for path ${path}`);
      }
      builder.reducers.get(type).set(path, reducer);
      return builder;
    },
    validateKey: (key) => {
      if (key === '') {
        throw new Error('Store keys should not be empty string');
      }
      if (/\0/.test(key)) {
        throw new Error(`Store keys should not contains null character(\\0), ${key} given at path ${builder.path.join('.')}`);
      }
    },
    sub: (key, recipe) => {
      builder.validateKey(key);
      builder.path.push(key);
      try {
        recipe(builder);
      } finally {
        builder.path.pop();
      }
    },
    wildcard: (key, reducer) => {
      builder.validateKey();
      builder.path.push(key);
      try {
        builder.wildcardReducers.set(builder.path.join(SPLITTER), reducer);
        builder.default(reducer(undefined, {type: undefined}));
      } finally {
        builder.path.pop();
      }
    },
    build: () => {
      return (store = builder.store, action) => {
        const getChanges = (store, action) => {
          const changes = new Map();
          const callReducerOnPath = (reducer, path) => {
            if (path === '') {
              changeManager.addChange(path, store, reducer(store, action), changes);
              return;
            }
            let parent = { store };
            let cur = 'store';
            path.split(SPLITTER).forEach((part) => {
              parent = parent[cur];
              cur = part;
            });
            changeManager.addChange(path, parent[cur], reducer(parent[cur], action), changes)
          }
          builder.wildcardReducers.forEach(callReducerOnPath);
          if (builder.reducers.has(action.type)) {
            builder.reducers.get(action.type).forEach(callReducerOnPath);
          }
          return changes;
        };
        const changes = getChanges(store, action);
        return changeManager.applyChanges(changes, store);
      }
    },
  };
  return builder;
}

export const combine = (recipes, reducers = {}) => (r) => {
  r.default({});
  const keys = Object.keys(recipes);
  for (let i = 0; i < keys.length; i++) {
    r.sub(keys[i], recipes[keys[i]]);
  }
  const wKeys = Object.keys(reducers);
  for (let i = 0; i < wKeys.length; i++) {
    if (recipes[wKeys[i]] !== undefined) {
      throw new Error(`Conflict in reducers and recepies for ${wKeys[i]}`);
    }
    r.wildcard(wKeys[i], reducers[wKeys[i]]);
  }
};
export const build = (reducer) => {
  const r = R();
  reducer(r);
  return r.build();
};
export const buildCombined = (recipes, reducers = {}) => build(combine(recipes, reducers));

export default {
  combine,
  build,
  buildCombined,
};
