import {combineReducers} from "redux";
import { createReducer } from '@reduxjs/toolkit';
import {measure} from "./measure";
import builder from '..';

// For a medium and large size applications, having more than 200 action types and a reducer that is a combination of
// around 20 smaller sub-reducers are highly possible.

// According to this benchmarks, `reducer-recipe` is twice as fast as `combineReducers()` and 5x faster than `createReducer()`.

const MAIN_TYPES = 20;
const SUB_TYPES = 10;
const ROUNDS_OF_TEST = 1000;

function createDefaultState() {
    const defaultState = {};
    for (let i =0; i < MAIN_TYPES; i++) {
        defaultState[`store_${i}`] = {
            num: 0,
            str: '',
            array: [1, 2, 3, 4],
        }
    }
    return defaultState;
}
const defaultState = createDefaultState();

function createReducerWithCombineReducers() {
    const reducers = {};
    for (let i = 0; i < MAIN_TYPES; i++) {
        reducers[`store_${i}`] = function (state = defaultState[`store_${i}`], action) {
            switch (action.type) {
                case `type_${i}_subtype_0`:
                    return {...state, num: state.num+1};
                case `type_${i}_subtype_1`:
                    return {...state, num: state.num-1};
                case `type_${i}_subtype_2`:
                    return {...state, num: 0};
                case `type_${i}_subtype_3`:
                    return {...state, str: state.str+'.'};
                case `type_${i}_subtype_4`:
                    return {...state, str: state.str+'..'};
                case `type_${i}_subtype_5`:
                    return {...state, str: ''};
                case `type_${i}_subtype_6`:
                    return {...state, array: [...state.array, state.array.length]};
                case `type_${i}_subtype_7`:
                    const array = [...state.array];
                    array.pop();
                    return {...state, array};
                case `type_${i}_subtype_8`:
                    return {...state, array: []};
                case `type_${i}_subtype_9`:
                    return {...state, array: [1, 2, 3, 4]};
                default:
                    return state;
            }
        }
    }
    return combineReducers(reducers);
}
function createReducersByRecipe() {
    const recipes = {};
    for (let i = 0; i < MAIN_TYPES; i++) {
        recipes[`store_${i}`] = (r) => {
            r.default(defaultState[`store_${i}`])
                .on(`type_${i}_subtype_0`, (state, action) => {
                    return {...state, num: state.num+1};
                })
                .on(`type_${i}_subtype_1`, (state, action) => {
                    return {...state, num: state.num-1};
                })
                .on(`type_${i}_subtype_2`, (state, action) => {
                    return {...state, num: 0};
                })
                .on(`type_${i}_subtype_3`, (state, action) => {
                    return {...state, str: state.str+'.'};
                })
                .on(`type_${i}_subtype_4`, (state, action) => {
                    return {...state, str: state.str+'..'};
                })
                .on(`type_${i}_subtype_5`, (state, action) => {
                    return {...state, str: ''};
                })
                .on(`type_${i}_subtype_6`, (state, action) => {
                    return {...state, array: [...state.array, state.array.length]};
                })
                .on(`type_${i}_subtype_7`, (state, action) => {
                    const array = [...state.array];
                    array.pop();
                    return {...state, array};
                })
                .on(`type_${i}_subtype_8`, (state, action) => {
                    return {...state, array: []};
                })
                .on(`type_${i}_subtype_9`, (state, action) => {
                    return {...state, array: [1, 2, 3, 4]};
                });
        };
    }
    return builder.buildCombined(recipes);
}
function createReducerWithToolkit() {
    return createReducer(defaultState, (builder) => {
        for (let i = 0; i < MAIN_TYPES; i++) {
                builder
                    .addCase(`type_${i}_subtype_0`, (state, action) => {
                        state[`store_${i}`].num++;
                    })
                    .addCase(`type_${i}_subtype_1`, (state, action) => {
                        state[`store_${i}`].num--;
                    })
                    .addCase(`type_${i}_subtype_2`, (state, action) => {
                        state[`store_${i}`].num = 0;
                    })
                    .addCase(`type_${i}_subtype_3`, (state, action) => {
                        state[`store_${i}`].str += '.';
                    })
                    .addCase(`type_${i}_subtype_4`, (state, action) => {
                        state[`store_${i}`].str += '..';
                    })
                    .addCase(`type_${i}_subtype_5`, (state, action) => {
                        state[`store_${i}`].str = '';
                    })
                    .addCase(`type_${i}_subtype_6`, (state, action) => {
                        state[`store_${i}`].array.push(state[`store_${i}`].array.length);
                    })
                    .addCase(`type_${i}_subtype_7`, (state, action) => {
                        state[`store_${i}`].array.pop();
                    })
                    .addCase(`type_${i}_subtype_8`, (state, action) => {
                        state[`store_${i}`].array = [];
                    })
                    .addCase(`type_${i}_subtype_9`, (state, action) => {
                        state[`store_${i}`].array = [1, 2, 3, 4];
                    });
        }
    });
}

const finalStates = [];

function test([reducer, state]) {
    for (let i = 0; i < ROUNDS_OF_TEST; i++) {
        for (let j = 0; j < MAIN_TYPES; j++) {
            for (let k = 0; k < SUB_TYPES; k++) {
                state = reducer(state, {type: `type_${j}_subtype_${k}`});
            }
        }
    }
    finalStates.push(state);
}

it('runs benchmarks', () => {
    measure('combineReducers', () => {
        return [createReducerWithCombineReducers(), createDefaultState()];
    }, test);

    measure('recipe', () => {
        return [createReducersByRecipe(), createDefaultState()];
    }, test);

    measure('createReducer', () => {
        return [createReducerWithToolkit(), createDefaultState()];
    }, test);
    expect(finalStates[1]).toEqual(finalStates[0]);
    expect(finalStates[2]).toEqual(finalStates[0]);
});
