"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Base_1 = require("./Base");
const TeamSchema_1 = require("./schema/TeamSchema");
class default_1 extends Base_1.default {
    getSchema() {
        return TeamSchema_1.User_Team;
    }
    getName() {
        return 'user_team';
    }
}
exports.default = default_1;
//# sourceMappingURL=User_Team.js.map