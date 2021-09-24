"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Base_1 = require("./Base");
const SubmissionSchema_1 = require("./schema/SubmissionSchema");
class default_1 extends Base_1.default {
    getSchema() {
        return SubmissionSchema_1.Submission;
    }
    getName() {
        return 'submission';
    }
}
exports.default = default_1;
//# sourceMappingURL=Submission.js.map