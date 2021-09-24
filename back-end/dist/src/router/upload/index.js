"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Base_1 = require("../Base");
const file_1 = require("./file");
exports.default = Base_1.default.setRouter([
    {
        path: '/file',
        router: file_1.default,
        method: 'post'
    }
]);
//# sourceMappingURL=index.js.map