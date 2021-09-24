"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Base_1 = require("./Base");
const ValidatorSchema_1 = require("./schema/ValidatorSchema");
class default_1 extends Base_1.default {
    getSchema() {
        return ValidatorSchema_1.Validator;
    }
    getName() {
        return 'Validator';
    }
}
exports.default = default_1;
//# sourceMappingURL=Validator.js.map