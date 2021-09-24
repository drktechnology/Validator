"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Base_1 = require("../Base");
const ping_1 = require("./ping");
exports.default = Base_1.default.setRouter([
    {
        path: '/',
        router: ping_1.default,
        method: 'get'
    }
]);
//# sourceMappingURL=index.js.map