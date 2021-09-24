var state = []
export const setState = (key, value) => {
    state[key] = value
}

export const getState = (key) => {
    return state[key] === undefined ? null : state[key]
}