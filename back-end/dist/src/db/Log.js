"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Base_1 = require("./Base");
const LogSchema_1 = require("./schema/LogSchema");
class default_1 extends Base_1.default {
    getSchema() {
        return LogSchema_1.Log;
    }
    getName() {
        return 'logs';
    }
    getSchemaOption() {
        return {
            strict: false,
            versionKey: false
        };
    }
}
exports.default = default_1;
//# sourceMappingURL=Log.js.map