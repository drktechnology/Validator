"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Base_1 = require("./Base");
const CommunitySchema_1 = require("./schema/CommunitySchema");
class default_1 extends Base_1.default {
    getSchema() {
        return CommunitySchema_1.Community;
    }
    getName() {
        return 'community';
    }
    rejectFields() {
        return {};
    }
}
exports.default = default_1;
//# sourceMappingURL=Community.js.map