function R() {
  const SPLITTER = "\0";
  const builder = {
    store: undefined,
    reducers: new Map(),
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
    sub: (key, reducer) => {
      if (key === '') {
        throw new Error('Store keys should not be empty string');
      }
      if (/\0/.test(key)) {
        throw new Error(`Store keys should not contains null character(\\0), ${key} given at path ${builder.path.join('.')}`);
      }
      builder.path.push(key);
      try {
        reducer(builder);
      } finally {
        builder.path.pop();
      }
    },
    build: () => {
      return (store = builder.store, action) => {
        if (!builder.reducers.has(action.type)) {
          return store;
        }
        let changes = new Map();
        function saveChange(path, oldStore, newStore) {
          if (oldStore !== newStore) {
            changes.set(path, newStore);
          }
        }
        builder.reducers.get(action.type).forEach((reducer, path) => {
          if (path === '') {
            saveChange(path, store, reducer(store, action));
            return;
          }
          let parent = { store };
          let cur = 'store';
          path.split(SPLITTER).forEach((part) => {
            parent = parent[cur];
            cur = part;
          });
          saveChange(path, parent[cur], reducer(parent[cur], action))
        });
        return function applyChanges(changes, value) {
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
        } (changes, store);
      };
    },
  };
  return builder;
}

export const combine = (reducers) => (r) => {
  r.default({});
  const keys = Object.keys(reducers);
  for (let i = 0; i < keys.length; i++) {
    r.sub(keys[i], (r) => {
      reducers[keys[i]](r);
    });
  }
};
export const build = (reducer) => {
  const r = R();
  reducer(r);
  return r.build();
};
export const buildCombined = (reducers) => build(combine(reducers));

export default {
  combine,
  build,
  buildCombined,
};
