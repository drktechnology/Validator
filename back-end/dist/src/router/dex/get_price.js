"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Base_1 = require("../Base");
const contract_1 = require("../../contract");
const CoinGecko = require('coingecko-api');
const CoinGeckoClient = new CoinGecko();
class default_1 extends Base_1.default {
    constructor() {
        super(...arguments);
        this.needLogin = false;
    }
    action() {
        return __awaiter(this, void 0, void 0, function* () {
            const drkEth = yield contract_1.getPrice();
            const rs = yield CoinGeckoClient.simple.price({
                ids: ['ethereum'],
                vs_currencies: ['usd']
            });
            const ethUsd = rs.data ? rs.data.ethereum.usd : 0;
            const drkUsd = drkEth * ethUsd;
            return this.rawResult(1, {
                "draken": {
                    "usd": drkUsd
                }
            });
        });
    }
}
exports.default = default_1;
//# sourceMappingURL=get_price.js.map