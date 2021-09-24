"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Base_1 = require("../Base");
const translate_1 = require("./translate");
exports.default = Base_1.default.setRouter([
    {
        path: '/translate',
        router: translate_1.default,
        method: 'post',
    },
]);
//# sourceMappingURL=index.js.map