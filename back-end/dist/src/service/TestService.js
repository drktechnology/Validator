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
const Base_1 = require("./Base");
const utility_1 = require("../utility");
const faucet = require("../faucet");
class default_1 extends Base_1.default {
    getTestList() {
        return __awaiter(this, void 0, void 0, function* () {
            const db_test = this.getDBModel('Test');
            return yield db_test.find({});
        });
    }
    claimFaucet(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const { to, ip } = param;
            const amount = 3;
            if (!utility_1.validate.eth_address(to)) {
                throw 'Invalid address!';
            }
            const txHash = yield faucet.transfer(to, amount);
            const doc = {
                ip,
                to,
                amount,
                txHash
            };
            const db_faucet = this.getDBModel('Faucet');
            const rs = yield db_faucet.save(doc);
            return rs;
        });
    }
    listFaucet(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const limit = 10;
            const db_faucet = this.getDBModel('Faucet').getDBInstance();
            const count = yield db_faucet.count({});
            const list = yield db_faucet.find({})
                .sort({ createdAt: -1 })
                .limit(limit);
            const rs = yield db_faucet.aggregate([{ $match: {} },
                { $group: { _id: null, sum: { $sum: "$amount" } } }]);
            const sum = rs && rs[0] && rs[0].sum ? rs[0].sum : 0;
            return {
                list,
                count,
                sum
            };
        });
    }
}
exports.default = default_1;
//# sourceMappingURL=TestService.js.map