"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Base_1 = require("../Base");
const claim_faucet_1 = require("./claim_faucet");
const list_faucet_1 = require("./list_faucet");
exports.default = Base_1.default.setRouter([
    {
        path: '/claim_faucet',
        router: claim_faucet_1.default,
        method: 'post'
    },
    {
        path: '/list_faucet',
        router: list_faucet_1.default,
        method: 'get'
    },
]);
//# sourceMappingURL=index.js.map