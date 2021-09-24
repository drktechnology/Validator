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
class default_1 extends Base_1.default {
    get(param) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!param.address) {
                throw 'address required';
            }
            const db_validator = this.getDBModel('Validator');
            const address = (param.address).toLowerCase();
            const rs = yield db_validator.findOne({ address: address });
            return rs;
        });
    }
    list() {
        return __awaiter(this, void 0, void 0, function* () {
            const db_validator = this.getDBModel('Validator');
            const rs = yield db_validator.getDBInstance().find({ isActive: true });
            return rs;
        });
    }
}
exports.default = default_1;
//# sourceMappingURL=ValidatorService.js.map