"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getState = exports.setState = void 0;
var state = [];
exports.setState = (key, value) => {
    state[key] = value;
};
exports.getState = (key) => {
    return state[key] === undefined ? null : state[key];
};
//# sourceMappingURL=index.js.map