"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Base_1 = require("../Base");
const get_price_1 = require("./get_price");
const get_total_stake_1 = require("./get_total_stake");
const get_details_1 = require("./get_details");
exports.default = Base_1.default.setRouter([
    {
        path: '/get-price',
        router: get_price_1.default,
        method: 'get'
    },
    {
        path: '/get-total-stake',
        router: get_total_stake_1.default,
        method: 'get'
    },
    {
        path: '/get-details',
        router: get_details_1.default,
        method: 'get'
    },
]);
//# sourceMappingURL=index.js.map