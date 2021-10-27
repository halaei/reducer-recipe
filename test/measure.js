// Source: immer (https://github.com/immerjs/immer/blob/master/__performance_tests__/measure.js)
// Copyright (c) 2017 Michel Weststrat
// MIT License: https://github.com/immerjs/immer/blob/master/LICENSE
"use strict"

function measureTime(setup, fn) {
    if (!fn) {
        fn = setup
        setup = () => {}
    }
    const args = setup()
    global.gc && global.gc()
    const startTime = Date.now()
    fn(args)
    const endTime = Date.now()
    return endTime - startTime
}

export function measure(name, setup, fn) {
    const times = [...Array(5)].map(() => measureTime(setup, fn))
    const medianTime = times.sort()[Math.round(times.length / 2)]
    console.log(`${name}: ${medianTime}ms`)
}
