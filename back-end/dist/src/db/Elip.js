"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Base_1 = require("./Base");
const ElipSchema_1 = require("./schema/ElipSchema");
class default_1 extends Base_1.default {
    getSchema() {
        return ElipSchema_1.Elip;
    }
    getName() {
        return 'elip';
    }
    buildSchema() {
        const schema = super.buildSchema();
        schema.index({ status: -1, vid: -1 });
        return schema;
    }
}
exports.default = default_1;
//# sourceMappingURL=Elip.js.map