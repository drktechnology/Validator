"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Base_1 = require("../Base");
const list_1 = require("./list");
exports.default = Base_1.default.setRouter([
    {
        path: '/list',
        router: list_1.default,
        method: 'get'
    }
]);
//# sourceMappingURL=index.js.map