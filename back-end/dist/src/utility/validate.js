"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const validator = require("validator");
const WAValidator = require("wallet-address-validator");
const F = {
    email(email) {
        return validator.isEmail(email);
    },
    valid_string(str, min, max = 32768) {
        if (!str || !_.isString(str))
            return false;
        const len = str.length;
        if (len < min)
            return false;
        if (len > max)
            return false;
        return true;
    },
    eth_address(address) {
        const valid = WAValidator.validate(address, 'ETH');
        return valid;
    },
};
exports.default = F;
//# sourceMappingURL=validate.js.map