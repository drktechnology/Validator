"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Base_1 = require("./Base");
const CVoteTrackingSchema_1 = require("./schema/CVoteTrackingSchema");
class default_1 extends Base_1.default {
    getSchema() {
        return CVoteTrackingSchema_1.CVote_Tracking;
    }
    getName() {
        return 'cvote_tracking';
    }
    rejectFields() {
        return {};
    }
}
exports.default = default_1;
//# sourceMappingURL=CVote_Tracking.js.map