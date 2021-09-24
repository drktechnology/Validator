"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Base_1 = require("./Base");
const ReleaseSchema_1 = require("./schema/ReleaseSchema");
class default_1 extends Base_1.default {
    getSchema() {
        return ReleaseSchema_1.Release;
    }
    getName() {
        return 'release';
    }
}
exports.default = default_1;
//# sourceMappingURL=Release.js.map