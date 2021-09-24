"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Base_1 = require("./Base");
const TaskSchema_1 = require("./schema/TaskSchema");
class default_1 extends Base_1.default {
    getSchema() {
        return TaskSchema_1.Task;
    }
    getName() {
        return 'task';
    }
}
exports.default = default_1;
//# sourceMappingURL=Task.js.map