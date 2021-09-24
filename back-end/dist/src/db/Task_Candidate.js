"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Base_1 = require("./Base");
const TaskSchema_1 = require("./schema/TaskSchema");
class default_1 extends Base_1.default {
    getSchema() {
        return TaskSchema_1.Task_Candidate;
    }
    getName() {
        return 'task_candidate';
    }
}
exports.default = default_1;
//# sourceMappingURL=Task_Candidate.js.map