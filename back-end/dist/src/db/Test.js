"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Base_1 = require("./Base");
class default_1 extends Base_1.default {
    getSchema() {
        return {
            name: String,
            age: Number,
            time: Date
        };
    }
    getName() {
        return 'Test';
    }
}
exports.default = default_1;
//# sourceMappingURL=Test.js.map