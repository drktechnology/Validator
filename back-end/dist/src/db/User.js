"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Base_1 = require("./Base");
const UserSchema_1 = require("./schema/UserSchema");
class default_1 extends Base_1.default {
    getSchema() {
        return UserSchema_1.User;
    }
    getName() {
        return 'users';
    }
    rejectFields() {
        return {
            password: false,
            salt: false
        };
    }
}
exports.default = default_1;
//# sourceMappingURL=User.js.map