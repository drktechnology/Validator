"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Base_1 = require("./Base");
const CVoteSchema_1 = require("./schema/CVoteSchema");
class default_1 extends Base_1.default {
    getSchema() {
        return CVoteSchema_1.CVote;
    }
    getName() {
        return 'cvote';
    }
    buildSchema() {
        const schema = super.buildSchema();
        schema.index({ published: -1, vid: -1 });
        schema.index({ vid: -1 });
        return schema;
    }
}
exports.default = default_1;
//# sourceMappingURL=CVote.js.map