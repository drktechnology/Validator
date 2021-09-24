"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Base_1 = require("./Base");
const CVoteSummarySchema_1 = require("./schema/CVoteSummarySchema");
class default_1 extends Base_1.default {
    getSchema() {
        return CVoteSummarySchema_1.CVote_Summary;
    }
    getName() {
        return 'cvote_summary';
    }
    rejectFields() {
        return {};
    }
}
exports.default = default_1;
//# sourceMappingURL=CVote_Summary.js.map