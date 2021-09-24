"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Base_1 = require("../Base");
const get_1 = require("./get");
exports.default = Base_1.default.setRouter([
    {
        path: '/get',
        router: get_1.default,
        method: 'get'
    },
]);
//# sourceMappingURL=index.js.map