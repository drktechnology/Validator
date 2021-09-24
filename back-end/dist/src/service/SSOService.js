"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Base_1 = require("./Base");
const utility_1 = require("../utility");
class default_1 extends Base_1.default {
    login(param) {
        const { sso: payload, sig } = param;
        if (!utility_1.sso.validate(payload, sig) || !this.currentUser) {
            throw 'login info invalid';
        }
        const nonce = utility_1.sso.getNonce(payload);
        const { _id, email, username, profile: { lastName, firstName, bio } } = this.currentUser;
        const userparams = {
            nonce,
            external_id: _id.toString(),
            email,
            username,
            name: `${firstName} ${lastName}`,
            bio,
        };
        const loginString = utility_1.sso.buildLoginString(userparams);
        return loginString;
    }
}
exports.default = default_1;
//# sourceMappingURL=SSOService.js.map