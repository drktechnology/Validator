"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
exports.default = {
    formatUsername(user) {
        const firstName = user.profile && user.profile.firstName;
        const lastName = user.profile && user.profile.lastName;
        if (_.isEmpty(firstName) && _.isEmpty(lastName)) {
            return user.username;
        }
        return [firstName, lastName].join(' ');
    },
};
//# sourceMappingURL=user.js.map