"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Base_1 = require("./Base");
const FaucetSchema_1 = require("./schema/FaucetSchema");
class default_1 extends Base_1.default {
    getSchema() {
        return FaucetSchema_1.Faucet;
    }
    getName() {
        return 'Faucet';
    }
}
exports.default = default_1;
//# sourceMappingURL=Faucet.js.map